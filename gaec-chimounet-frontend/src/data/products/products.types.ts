import type { Season } from "../recipes/recipes.types";

/** Les produits et les recettes partagent la même énumération de saisons. */
export type ProductSeason = Season;

export type Product = {
    id: string;
    name: string;
    slug: string;
    subtitle: string;
    imageUrl: string;
    /** Chemin brut dans le bucket Storage, nécessaire pour remplacer la photo. */
    imagePath: string | null;
    imageAlt: string;
    seasons: ProductSeason[];
    isPublished: boolean;
    position: number;
};

export type ProductInput = {
    name: string;
    slug: string;
    subtitle: string;
    imagePath: string | null;
    imageAlt: string;
    seasons: ProductSeason[];
    isPublished: boolean;
    position: number;
};
