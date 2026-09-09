import { MEDIA_BUCKET, supabase } from "./supabase";
import { slugify } from "./text";

export type MediaFolder = "gallery" | "recipes" | "products";

const PLACEHOLDER_IMAGE =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3">' +
            '<rect width="4" height="3" fill="#e8e3d8"/>' +
            "</svg>",
    );

/**
 * Reconstruit l'URL publique d'un fichier du bucket `medias`.
 *
 * On stocke en base le chemin (« gallery/tomates.webp ») et non l'URL complète :
 * si le projet Supabase change d'identifiant, aucune donnée n'est à réécrire.
 */
export function mediaUrl(path: string | null | undefined): string {
    if (!path) {
        return PLACEHOLDER_IMAGE;
    }

    // Tolère une URL déjà complète, pour ne pas casser l'affichage si une
    // fiche pointe encore vers une image externe.
    if (/^(https?:|data:)/.test(path)) {
        return path;
    }

    return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

/**
 * Construit un chemin de stockage unique et lisible.
 * Le suffixe aléatoire évite qu'un second envoi du même fichier n'écrase le
 * précédent, tout en gardant un nom reconnaissable dans le dashboard Supabase.
 */
export function buildMediaPath(folder: MediaFolder, fileName: string): string {
    const dotIndex = fileName.lastIndexOf(".");

    const extension =
        dotIndex === -1 ? "webp" : fileName.slice(dotIndex + 1).toLowerCase();

    const base =
        slugify(dotIndex === -1 ? fileName : fileName.slice(0, dotIndex)).slice(
            0,
            60,
        ) || "photo";

    return `${folder}/${base}-${crypto.randomUUID().slice(0, 8)}.${extension}`;
}
