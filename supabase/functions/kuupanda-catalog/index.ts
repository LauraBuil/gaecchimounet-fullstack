import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const KUUPANDA_API = "https://api.prod.kuupanda.com";
const KUUPANDA_PRODUCER_ID = "2927";
const KUUPANDA_BRAND_ID = "e327b095-493c-4407-adf5-ba0c9e7913a8";
const CACHE_DURATION_MS = 5 * 60 * 1000;
const UNLIMITED_STOCK_VALUE = 999_999;

const allowedOrigins = new Set([
    "https://gaecchimounet.fr",
    "https://www.gaecchimounet.fr",
    "https://staging.gaecchimounet.fr",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]);

type KuupandaProduct = {
    id?: unknown;
    name?: unknown;
    description?: unknown;
    price?: unknown;
    picture?: { url?: unknown } | null;
    availableQuantity?: unknown;
    baseUnit?: unknown;
    stockUnit?: unknown;
};

type KuupandaGroup = {
    category?: unknown;
    products?: KuupandaProduct[];
};

type CachedCatalog = {
    expiresAt: number;
    payload: string;
};

let cachedCatalog: CachedCatalog | null = null;

function corsHeaders(request: Request): Record<string, string> {
    const origin = request.headers.get("origin") ?? "";

    return {
        "Access-Control-Allow-Origin": allowedOrigins.has(origin)
            ? origin
            : "https://gaecchimounet.fr",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        Vary: "Origin",
    };
}

function jsonResponse(
    request: Request,
    body: string,
    status = 200,
): Response {
    return new Response(body, {
        status,
        headers: {
            ...corsHeaders(request),
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control":
                status === 200
                    ? "public, max-age=60, s-maxage=300, stale-while-revalidate=900"
                    : "no-store",
        },
    });
}

function asString(value: unknown): string {
    return typeof value === "string" ? value : "";
}

function asNumber(value: unknown): number | null {
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function plainText(value: unknown): string {
    return asString(value)
        .replace(/<br\s*\/?\s*>/gi, " ")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'")
        .replace(/&ecirc;/gi, "ê")
        .replace(/&eacute;/gi, "é")
        .replace(/&egrave;/gi, "è")
        .replace(/&agrave;/gi, "à")
        .replace(/&ccedil;/gi, "ç")
        .replace(/\s+/g, " ")
        .trim();
}

function categoryLabel(categoryId: string, customCategories: Record<string, string>): string {
    if (customCategories[categoryId]) {
        return customCategories[categoryId];
    }

    const predefined: Record<string, string> = {
        "_FRUITS-VEGETABLES": "Fruits et légumes",
        "_TRANSFORMED-PRODUCTS": "Produits transformés",
    };

    return predefined[categoryId] ?? "Autres produits";
}

async function fetchKuupandaCatalog(): Promise<string> {
    const query = new URLSearchParams({
        saleChannel: "STANDARD",
        component: "FORM",
    });
    const headers = {
        "Content-Type": "application/json",
        "x-brand-id": KUUPANDA_BRAND_ID,
    };

    const [productsResponse, producerResponse] = await Promise.all([
        fetch(
            `${KUUPANDA_API}/product/clientList/${KUUPANDA_PRODUCER_ID}?${query}`,
            {
                method: "POST",
                headers,
                body: JSON.stringify({
                    codes: [],
                    cartAmount: 0,
                    customer: "",
                    cartProducts: {},
                }),
            },
        ),
        fetch(
            `${KUUPANDA_API}/user/clientList/${KUUPANDA_PRODUCER_ID}?${query}`,
            { headers },
        ),
    ]);

    if (!productsResponse.ok || !producerResponse.ok) {
        throw new Error(
            `Kuupanda a répondu ${productsResponse.status}/${producerResponse.status}.`,
        );
    }

    const productsData = await productsResponse.json() as { products?: KuupandaGroup[] };
    const producerData = await producerResponse.json() as {
        storefront?: { customCategories?: Record<string, string> };
    };
    const customCategories = producerData.storefront?.customCategories ?? {};
    const groups = Array.isArray(productsData.products) ? productsData.products : [];

    const products = groups.flatMap((group, groupPosition) => {
        const categoryId = asString(group.category);
        const category = categoryLabel(categoryId, customCategories);
        const entries = Array.isArray(group.products) ? group.products : [];

        return entries
            .map((product, productPosition) => {
                const rawQuantity = asNumber(product.availableQuantity);
                const stockQuantity =
                    rawQuantity === null || rawQuantity >= UNLIMITED_STOCK_VALUE
                        ? null
                        : Math.max(0, rawQuantity);

                return {
                    id: asString(product.id),
                    name: asString(product.name),
                    description: plainText(product.description),
                    imageUrl: asString(product.picture?.url),
                    price: asNumber(product.price),
                    saleUnit: asString(product.baseUnit),
                    stockQuantity,
                    stockUnit: asString(product.stockUnit),
                    isAvailable: rawQuantity === null || rawQuantity > 0,
                    isStockManaged: stockQuantity !== null,
                    categoryId,
                    category,
                    position: groupPosition * 1000 + productPosition,
                };
            })
            .filter((product) => product.id && product.name);
    });

    return JSON.stringify({
        products,
        syncedAt: new Date().toISOString(),
        source: "Kuupanda",
    });
}

Deno.serve(async (request: Request) => {
    if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    if (request.method !== "GET") {
        return jsonResponse(
            request,
            JSON.stringify({ error: "Méthode non autorisée." }),
            405,
        );
    }

    if (cachedCatalog && cachedCatalog.expiresAt > Date.now()) {
        return jsonResponse(request, cachedCatalog.payload);
    }

    try {
        const payload = await fetchKuupandaCatalog();
        cachedCatalog = {
            payload,
            expiresAt: Date.now() + CACHE_DURATION_MS,
        };

        return jsonResponse(request, payload);
    } catch (error) {
        console.error("Impossible de charger le catalogue Kuupanda", error);

        if (cachedCatalog) {
            return jsonResponse(request, cachedCatalog.payload);
        }

        return jsonResponse(
            request,
            JSON.stringify({
                error: "Le catalogue Kuupanda est momentanément indisponible.",
            }),
            502,
        );
    }
});
