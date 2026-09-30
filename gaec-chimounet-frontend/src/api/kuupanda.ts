import type {
    CatalogProduct,
    KuupandaCatalog,
} from "../data/products/catalog.types";
import { supabase } from "../lib/supabase";
import { fetchSiteSettings } from "./siteSettings";

const CATALOG_CACHE_KEY = "gaec-chimounet:kuupanda-catalog:v1";
const CATALOG_CACHE_DURATION_MS = 5 * 60 * 1000;

type StoredCatalog = {
    storedAt: number;
    catalog: KuupandaCatalog;
};

function isCatalogProduct(value: unknown): value is CatalogProduct {
    if (!value || typeof value !== "object") {
        return false;
    }

    const product = value as Partial<CatalogProduct>;

    return (
        typeof product.id === "string" &&
        typeof product.name === "string" &&
        typeof product.imageUrl === "string" &&
        typeof product.category === "string" &&
        typeof product.isAvailable === "boolean"
    );
}

function readStoredCatalog(): StoredCatalog | null {
    try {
        const raw = window.localStorage.getItem(CATALOG_CACHE_KEY);

        if (!raw) return null;

        const value = JSON.parse(raw) as Partial<StoredCatalog>;

        if (
            typeof value.storedAt !== "number" ||
            !value.catalog ||
            !Array.isArray(value.catalog.products)
        ) {
            return null;
        }

        return {
            storedAt: value.storedAt,
            catalog: {
                products: value.catalog.products.filter(isCatalogProduct),
                syncedAt: value.catalog.syncedAt,
                source: "Kuupanda",
            },
        };
    } catch {
        return null;
    }
}

function storeCatalog(catalog: KuupandaCatalog): void {
    try {
        window.localStorage.setItem(
            CATALOG_CACHE_KEY,
            JSON.stringify({ storedAt: Date.now(), catalog }),
        );
    } catch {
        // Le navigateur peut refuser le stockage privé : le catalogue reste
        // alors simplement disponible dans le cache mémoire de l'application.
    }
}

export async function fetchKuupandaCatalog(): Promise<KuupandaCatalog> {
    const stored = readStoredCatalog();

    if (stored && Date.now() - stored.storedAt < CATALOG_CACHE_DURATION_MS) {
        return stored.catalog;
    }

    const { data, error } = await supabase.functions.invoke("kuupanda-catalog", {
        method: "GET",
    });

    if (error) {
        // Une ancienne copie vaut mieux qu'une page vide lors d'une panne
        // temporaire de Kuupanda ou d'un réveil lent de l'Edge Function.
        if (stored) return stored.catalog;
        throw error;
    }

    const response = data as Partial<KuupandaCatalog> | null;

    if (!response || !Array.isArray(response.products)) {
        throw new Error("Le catalogue Kuupanda a renvoyé une réponse invalide.");
    }

    const catalog: KuupandaCatalog = {
        products: response.products.filter(isCatalogProduct),
        syncedAt:
            typeof response.syncedAt === "string"
                ? response.syncedAt
                : new Date().toISOString(),
        source: "Kuupanda",
    };

    storeCatalog(catalog);
    return catalog;
}

export async function fetchKuupandaProducts(): Promise<CatalogProduct[]> {
    const catalog = await fetchKuupandaCatalog();
    return catalog.products;
}

export type ProductCatalogView = {
    products: CatalogProduct[];
    showPrices: boolean;
};

export async function fetchProductCatalogView(): Promise<ProductCatalogView> {
    const [catalog, settings] = await Promise.all([
        fetchKuupandaCatalog(),
        fetchSiteSettings(),
    ]);

    return {
        products: catalog.products,
        showPrices: settings.showProductPrices,
    };
}
