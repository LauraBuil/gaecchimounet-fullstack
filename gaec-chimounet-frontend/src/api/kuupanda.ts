import type {
    CatalogProduct,
    KuupandaCatalog,
} from "../data/products/catalog.types";
import { supabase } from "../lib/supabase";
import { fetchSiteSettings } from "./siteSettings";

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

export async function fetchKuupandaCatalog(): Promise<KuupandaCatalog> {
    const { data, error } = await supabase.functions.invoke("kuupanda-catalog", {
        method: "GET",
    });

    if (error) {
        throw error;
    }

    const response = data as Partial<KuupandaCatalog> | null;

    if (!response || !Array.isArray(response.products)) {
        throw new Error("Le catalogue Kuupanda a renvoyé une réponse invalide.");
    }

    return {
        products: response.products.filter(isCatalogProduct),
        syncedAt:
            typeof response.syncedAt === "string"
                ? response.syncedAt
                : new Date().toISOString(),
        source: "Kuupanda",
    };
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
