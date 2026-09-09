export type RecipeIngredient = {
    id: string;
    quantity: string;
    name: string;
};

export type RecipeStep = {
    id: string;
    description: string;
};

export type Season = "spring" | "summer" | "autumn" | "winter";

export type Recipe = {
    id: string;
    title: string;
    slug: string;
    season: Season;
    summary: string;
    category: string;
    /** Somme préparation + cuisson, calculée par la base. */
    durationInMinutes: number;
    preparationTimeInMinutes: number;
    cookingTimeInMinutes: number;
    servings: number;
    imageUrl: string;
    /** Chemin brut dans le bucket Storage, nécessaire pour remplacer la photo. */
    imagePath: string | null;
    imageAlt: string;
    isPublished: boolean;
    position: number;
    ingredients: RecipeIngredient[];
    steps: RecipeStep[];
    tips?: string;
};

/** Ce que le formulaire d'administration envoie : ni identifiants, ni champs calculés. */
export type RecipeInput = {
    title: string;
    slug: string;
    season: Season;
    summary: string;
    category: string;
    preparationTimeInMinutes: number;
    cookingTimeInMinutes: number;
    servings: number;
    imagePath: string | null;
    imageAlt: string;
    isPublished: boolean;
    position: number;
    tips: string;
    ingredients: {
        quantity: string;
        name: string;
    }[];
    steps: {
        description: string;
    }[];
};

export const SEASONS: Season[] = ["spring", "summer", "autumn", "winter"];

export const SEASON_LABELS: Record<Season, string> = {
    spring: "Printemps",
    summer: "Été",
    autumn: "Automne",
    winter: "Hiver",
};
