import { buildMediaPath, type MediaFolder } from "../lib/media";
import { MEDIA_BUCKET, supabase } from "../lib/supabase";
import { describeError } from "./errors";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ACCEPTED_TYPES = ["image/webp", "image/jpeg", "image/png", "image/avif"];

export const ACCEPT_ATTRIBUTE = ACCEPTED_TYPES.join(",");

/**
 * Envoie une image dans le bucket et renvoie son chemin de stockage.
 *
 * On valide côté client pour donner un message immédiat, mais le bucket
 * applique les mêmes limites côté serveur : la validation ci-dessous est un
 * confort, pas une sécurité.
 */
export async function uploadMedia(
    folder: MediaFolder,
    file: File,
): Promise<string> {
    if (!ACCEPTED_TYPES.includes(file.type)) {
        throw new Error(
            "Format non accepté. Utilisez une image WebP, JPEG, PNG ou AVIF.",
        );
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new Error(
            `Cette image pèse ${(file.size / 1024 / 1024).toFixed(1)} Mo. ` +
                "La taille maximale est de 10 Mo.",
        );
    }

    const path = buildMediaPath(folder, file.name);

    const { error } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, file, {
            contentType: file.type,
            cacheControl: "31536000",
            upsert: false,
        });

    if (error) {
        throw new Error(describeError(error));
    }

    return path;
}

/**
 * Supprime un fichier du bucket.
 *
 * Volontairement tolérant : si le fichier a déjà disparu, on ne veut pas
 * empêcher la suppression de la fiche qui le référence.
 */
export async function removeMedia(path: string | null | undefined): Promise<void> {
    if (!path || /^(https?:|data:)/.test(path)) {
        return;
    }

    const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);

    if (error) {
        console.warn(`Suppression de l'image « ${path} » impossible :`, error.message);
    }
}
