import { mediaUrl } from "../lib/media";
import { invalidateAllQueries } from "../lib/queryCache";
import { supabase } from "../lib/supabase";
import type {
    Recipe,
    RecipeInput,
    Season,
} from "../data/recipes/recipes.types";
import { assertOk } from "./errors";
import { removeMedia } from "./media";

// Une seule requête ramène la recette et ses enfants triés : évite le N+1
// classique « une requête par recette pour ses ingrédients ».
const RECIPE_SELECT = `
    id, title, slug, season, summary, category,
    duration_in_minutes, preparation_time_in_minutes, cooking_time_in_minutes,
    servings, image_path, image_alt, tips, is_published, position,
    recipe_ingredients (id, quantity, name, position),
    recipe_steps (id, description, position)
`;

type RecipeRow = {
    id: string;
    title: string;
    slug: string;
    season: Season;
    summary: string;
    category: string;
    duration_in_minutes: number;
    preparation_time_in_minutes: number;
    cooking_time_in_minutes: number;
    servings: number;
    image_path: string | null;
    image_alt: string;
    tips: string | null;
    is_published: boolean;
    position: number;
    recipe_ingredients: {
        id: string;
        quantity: string;
        name: string;
        position: number;
    }[];
    recipe_steps: {
        id: string;
        description: string;
        position: number;
    }[];
};

function byPosition<T extends { position: number }>(a: T, b: T): number {
    return a.position - b.position;
}

function toRecipe(row: RecipeRow): Recipe {
    return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        season: row.season,
        summary: row.summary,
        category: row.category,
        durationInMinutes: row.duration_in_minutes,
        preparationTimeInMinutes: row.preparation_time_in_minutes,
        cookingTimeInMinutes: row.cooking_time_in_minutes,
        servings: row.servings,
        imageUrl: mediaUrl(row.image_path),
        imagePath: row.image_path,
        imageAlt: row.image_alt,
        isPublished: row.is_published,
        position: row.position,
        tips: row.tips ?? undefined,
        ingredients: [...row.recipe_ingredients]
            .sort(byPosition)
            .map(({ id, quantity, name }) => ({ id, quantity, name })),
        steps: [...row.recipe_steps]
            .sort(byPosition)
            .map(({ id, description }) => ({ id, description })),
    };
}

/**
 * Recettes destinées au site public.
 * RLS filtre déjà les brouillons pour un visiteur, mais le staff connecté
 * verrait ses brouillons apparaître sur le site public sans ce `eq`.
 */
export async function fetchPublishedRecipes(): Promise<Recipe[]> {
    const { data, error } = await supabase
        .from("recipes")
        .select(RECIPE_SELECT)
        .eq("is_published", true)
        .order("position")
        .order("created_at", { ascending: false });

    assertOk(error);

    return (data as RecipeRow[] | null)?.map(toRecipe) ?? [];
}

/** Recettes du back-office : brouillons inclus. */
export async function fetchAllRecipes(): Promise<Recipe[]> {
    const { data, error } = await supabase
        .from("recipes")
        .select(RECIPE_SELECT)
        .order("position")
        .order("created_at", { ascending: false });

    assertOk(error);

    return (data as RecipeRow[] | null)?.map(toRecipe) ?? [];
}

export async function fetchRecipeBySlug(slug: string): Promise<Recipe | null> {
    const { data, error } = await supabase
        .from("recipes")
        .select(RECIPE_SELECT)
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

    assertOk(error);

    return data ? toRecipe(data as RecipeRow) : null;
}

export async function fetchRecipeById(id: string): Promise<Recipe | null> {
    const { data, error } = await supabase
        .from("recipes")
        .select(RECIPE_SELECT)
        .eq("id", id)
        .maybeSingle();

    assertOk(error);

    return data ? toRecipe(data as RecipeRow) : null;
}

function toRow(input: RecipeInput) {
    return {
        title: input.title.trim(),
        slug: input.slug.trim(),
        season: input.season,
        summary: input.summary.trim(),
        category: input.category.trim(),
        preparation_time_in_minutes: input.preparationTimeInMinutes,
        cooking_time_in_minutes: input.cookingTimeInMinutes,
        servings: input.servings,
        image_path: input.imagePath,
        image_alt: input.imageAlt.trim(),
        tips: input.tips.trim() || null,
        is_published: input.isPublished,
        position: input.position,
        ingredients: input.ingredients,
        steps: input.steps,
    };
}

export async function createRecipe(input: RecipeInput): Promise<string> {
    const { data, error } = await supabase.rpc("save_recipe", {
        p_recipe: toRow(input),
        p_id: null,
    });

    assertOk(error);

    invalidateAllQueries();

    return data as string;
}

export async function updateRecipe(
    id: string,
    input: RecipeInput,
): Promise<void> {
    const { error } = await supabase.rpc("save_recipe", {
        p_recipe: toRow(input),
        p_id: id,
    });

    assertOk(error);

    invalidateAllQueries();
}

/**
 * Supprime la recette, ses enfants (par cascade) et sa photo.
 * La photo part en dernier : si la suppression en base échoue, on ne veut pas
 * avoir déjà détruit l'image d'une recette toujours en ligne.
 */
export async function deleteRecipe(recipe: Recipe): Promise<void> {
    const { error } = await supabase.from("recipes").delete().eq("id", recipe.id);

    assertOk(error);

    invalidateAllQueries();

    await removeMedia(recipe.imagePath);
}

export async function setRecipePublished(
    id: string,
    isPublished: boolean,
): Promise<void> {
    const { error } = await supabase
        .from("recipes")
        .update({ is_published: isPublished })
        .eq("id", id);

    assertOk(error);

    invalidateAllQueries();
}
