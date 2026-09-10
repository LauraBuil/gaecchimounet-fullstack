export type CatalogProduct = {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    price: number | null;
    saleUnit: string;
    stockQuantity: number | null;
    stockUnit: string;
    isAvailable: boolean;
    isStockManaged: boolean;
    categoryId: string;
    category: string;
    position: number;
};

export type KuupandaCatalog = {
    products: CatalogProduct[];
    syncedAt: string;
    source: "Kuupanda";
};
