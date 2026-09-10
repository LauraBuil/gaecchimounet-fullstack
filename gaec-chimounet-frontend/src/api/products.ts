import { mediaUrl } from "../lib/media";
import { invalidateAllQueries } from "../lib/queryCache";
import { supabase } from "../lib/supabase";
import type {
    Product,
    ProductInput,
    ProductSeason,
} from "../data/products/products.types";
import { assertOk } from "./errors";
import { removeMedia } from "./media";

const PRODUCT_SELECT =
    "id, name, slug, subtitle, image_path, image_alt, seasons, is_published, position";

type ProductRow = {
    id: string;
    name: string;
    slug: string;
    subtitle: string;
    image_path: string | null;
    image_alt: string;
    seasons: ProductSeason[] | null;
    is_published: boolean;
    position: number;
};

function toProduct(row: ProductRow): Product {
    return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        subtitle: row.subtitle,
        imageUrl: mediaUrl(row.image_path),
        imagePath: row.image_path,
        imageAlt: row.image_alt,
        seasons: row.seasons ?? [],
        isPublished: row.is_published,
        position: row.position,
    };
}

export async function fetchPublishedProducts(): Promise<Product[]> {
    const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("is_published", true)
        .order("position");

    assertOk(error);

    return (data as ProductRow[] | null)?.map(toProduct) ?? [];
}

export async function fetchAllProducts(): Promise<Product[]> {
    const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .order("position");

    assertOk(error);

    return (data as ProductRow[] | null)?.map(toProduct) ?? [];
}

function toRow(input: ProductInput) {
    return {
        name: input.name.trim(),
        slug: input.slug.trim(),
        subtitle: input.subtitle.trim(),
        image_path: input.imagePath,
        image_alt: input.imageAlt.trim(),
        seasons: input.seasons,
        is_published: input.isPublished,
        position: input.position,
    };
}

export async function createProduct(input: ProductInput): Promise<string> {
    const { data, error } = await supabase
        .from("products")
        .insert(toRow(input))
        .select("id")
        .single();

    assertOk(error);

    invalidateAllQueries();

    return (data as { id: string }).id;
}

export async function updateProduct(
    id: string,
    input: ProductInput,
): Promise<void> {
    const { error } = await supabase
        .from("products")
        .update(toRow(input))
        .eq("id", id);

    assertOk(error);

    invalidateAllQueries();
}

export async function deleteProduct(product: Product): Promise<void> {
    const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

    assertOk(error);

    invalidateAllQueries();

    await removeMedia(product.imagePath);
}

export async function setProductPublished(
    id: string,
    isPublished: boolean,
): Promise<void> {
    const { error } = await supabase
        .from("products")
        .update({ is_published: isPublished })
        .eq("id", id);

    assertOk(error);

    invalidateAllQueries();
}
