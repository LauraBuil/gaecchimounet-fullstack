import { useId, useState } from "react";

import { ACCEPT_ATTRIBUTE, removeMedia, uploadMedia } from "../../../api/media";
import type { MediaFolder } from "../../../lib/media";
import { mediaUrl } from "../../../lib/media";

type ImageUploadFieldProps = {
    label: string;
    folder: MediaFolder;
    /** Chemin de stockage actuel, ou null si aucune image. */
    value: string | null;
    onChange: (path: string | null) => void;
};

/**
 * Champ d'envoi d'image avec aperçu.
 *
 * L'image part vers le bucket dès la sélection, avant l'enregistrement de la
 * fiche : le formulaire ne manipule ensuite qu'un chemin, ce qui simplifie
 * l'enregistrement. En contrepartie, abandonner le formulaire après un envoi
 * laisse un fichier orphelin — d'où le bouton « Retirer », qui le supprime
 * réellement du bucket.
 */
export default function ImageUploadField({
    label,
    folder,
    value,
    onChange,
}: ImageUploadFieldProps) {
    const inputId = useId();
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFile = async (file: File | undefined) => {
        if (!file) {
            return;
        }

        setError(null);
        setIsUploading(true);

        try {
            const previous = value;
            const path = await uploadMedia(folder, file);

            onChange(path);

            // Remplacement : l'ancien fichier n'est plus référencé nulle part.
            if (previous) {
                await removeMedia(previous);
            }
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : String(caught));
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = async () => {
        const previous = value;

        onChange(null);

        if (previous) {
            await removeMedia(previous);
        }
    };

    return (
        <div className="admin-field">
            <label htmlFor={inputId}>{label}</label>

            <div className="image-field">
                {value && (
                    <img
                        className="image-field__preview"
                        src={mediaUrl(value)}
                        alt="Aperçu de l’image sélectionnée"
                    />
                )}

                <div className="image-field__controls">
                    <input
                        id={inputId}
                        type="file"
                        accept={ACCEPT_ATTRIBUTE}
                        disabled={isUploading}
                        onChange={(event) => {
                            void handleFile(event.target.files?.[0]);
                            // Réinitialise l'input pour autoriser un nouvel envoi
                            // du même fichier après un retrait.
                            event.target.value = "";
                        }}
                    />

                    {isUploading && <span className="image-field__status">Envoi…</span>}

                    {value && !isUploading && (
                        <button
                            type="button"
                            className="admin-button admin-button--ghost"
                            onClick={() => void handleRemove()}
                        >
                            Retirer
                        </button>
                    )}
                </div>
            </div>

            <p className="admin-field__hint">
                WebP, JPEG, PNG ou AVIF, 10 Mo maximum. Le format WebP est
                recommandé : il divise le poids par deux à qualité égale.
            </p>

            {error && (
                <p className="admin-alert admin-alert--error" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
