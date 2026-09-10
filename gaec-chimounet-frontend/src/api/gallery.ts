import type { GalleryImage } from "../data/gallery/gallery.types";
import { mediaUrl } from "../lib/media";
import { invalidateAllQueries } from "../lib/queryCache";
import { supabase } from "../lib/supabase";
import { assertOk } from "./errors";
import { removeMedia, uploadMedia } from "./media";

const GALLERY_SELECT = "id, storage_path, alt, is_published, position";

type GalleryRow = {
    id: string;
    storage_path: string;
    alt: string;
    is_published: boolean;
    position: number;
};

function toGalleryImage(row: GalleryRow): GalleryImage {
    return {
        id: row.id,
        storagePath: row.storage_path,
        url: mediaUrl(row.storage_path),
        alt: row.alt,
        isPublished: row.is_published,
        position: row.position,
    };
}

export async function fetchPublishedGalleryImages(): Promise<GalleryImage[]> {
    const { data, error } = await supabase
        .from("gallery_images")
        .select(GALLERY_SELECT)
        .eq("is_published", true)
        .order("position")
        .order("created_at", { ascending: false });

    assertOk(error);

    return (data as GalleryRow[] | null)?.map(toGalleryImage) ?? [];
}

export async function fetchAllGalleryImages(): Promise<GalleryImage[]> {
    const { data, error } = await supabase
        .from("gallery_images")
        .select(GALLERY_SELECT)
        .order("position")
        .order("created_at", { ascending: false });

    assertOk(error);

    return (data as GalleryRow[] | null)?.map(toGalleryImage) ?? [];
}

/**
 * Envoie une photo puis crée la ligne correspondante.
 *
 * Si l'insertion échoue, on retire le fichier tout juste envoyé : sans cela le
 * bucket accumulerait des images orphanes invisibles depuis le back-office.
 */
export async function addGalleryImage(
    file: File,
    alt: string,
    position: number,
): Promise<GalleryImage> {
    const storagePath = await uploadMedia("gallery", file);

    const { data, error } = await supabase
        .from("gallery_images")
        .insert({
            storage_path: storagePath,
            alt: alt.trim(),
            position,
            is_published: true,
        })
        .select(GALLERY_SELECT)
        .single();

    if (error) {
        await removeMedia(storagePath);
        assertOk(error);
    }

    invalidateAllQueries();

    return toGalleryImage(data as GalleryRow);
}

export async function updateGalleryImage(
    id: string,
    changes: { alt?: string; isPublished?: boolean; position?: number },
): Promise<void> {
    const row: Record<string, unknown> = {};

    if (changes.alt !== undefined) {
        row.alt = changes.alt.trim();
    }

    if (changes.isPublished !== undefined) {
        row.is_published = changes.isPublished;
    }

    if (changes.position !== undefined) {
        row.position = changes.position;
    }

    if (Object.keys(row).length === 0) {
        return;
    }

    const { error } = await supabase
        .from("gallery_images")
        .update(row)
        .eq("id", id);

    assertOk(error);

    invalidateAllQueries();
}

export async function deleteGalleryImage(image: GalleryImage): Promise<void> {
    const { error } = await supabase
        .from("gallery_images")
        .delete()
        .eq("id", image.id);

    assertOk(error);

    invalidateAllQueries();

    await removeMedia(image.storagePath);
}

/** Enregistre un nouvel ordre d'affichage après un glisser-déposer. */
export async function reorderGalleryImages(
    orderedIds: string[],
): Promise<void> {
    const updates = orderedIds.map((id, index) =>
        supabase.from("gallery_images").update({ position: index }).eq("id", id),
    );

    const results = await Promise.all(updates);

    const failure = results.find((result) => result.error);

    if (failure) {
        assertOk(failure.error);
    }

    invalidateAllQueries();
}
