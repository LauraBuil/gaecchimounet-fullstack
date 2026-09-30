import { buildMediaPath, type MediaFolder } from "../lib/media";
import { MEDIA_BUCKET, supabase } from "../lib/supabase";
import { describeError } from "./errors";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const WEBP_QUALITY = 0.82;

const MAX_IMAGE_SIDE: Record<MediaFolder, number> = {
    gallery: 1920,
    recipes: 1400,
    products: 1400,
};

const ACCEPTED_TYPES = ["image/webp", "image/jpeg", "image/png", "image/avif"];

export const ACCEPT_ATTRIBUTE = ACCEPTED_TYPES.join(",");

function webpFileName(fileName: string): string {
    const dotIndex = fileName.lastIndexOf(".");
    const base = dotIndex === -1 ? fileName : fileName.slice(0, dotIndex);
    return `${base || "photo"}.webp`;
}

/** Réduit et convertit une photo avant l'envoi pour éviter les fichiers de plusieurs Mo. */
async function optimizeImage(file: File, folder: MediaFolder): Promise<File> {
    if (typeof createImageBitmap !== "function") return file;

    try {
        const bitmap = await createImageBitmap(file, {
            imageOrientation: "from-image",
        });
        const maxSide = MAX_IMAGE_SIDE[folder];
        const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));

        // Un petit WebP est déjà adapté au web : évite une conversion sans gain.
        if (file.type === "image/webp" && scale === 1 && file.size <= 500_000) {
            bitmap.close();
            return file;
        }

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(bitmap.width * scale));
        canvas.height = Math.max(1, Math.round(bitmap.height * scale));

        const context = canvas.getContext("2d");

        if (!context) {
            bitmap.close();
            return file;
        }

        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();

        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, "image/webp", WEBP_QUALITY);
        });

        if (!blob || (blob.size >= file.size && scale === 1)) return file;

        return new File([blob], webpFileName(file.name), {
            type: "image/webp",
            lastModified: file.lastModified,
        });
    } catch {
        // Certains navigateurs ou fichiers atypiques ne sont pas décodables via
        // Canvas. L'envoi original reste alors possible.
        return file;
    }
}

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

    const optimizedFile = await optimizeImage(file, folder);
    const path = buildMediaPath(folder, optimizedFile.name);

    const { error } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, optimizedFile, {
            contentType: optimizedFile.type,
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
