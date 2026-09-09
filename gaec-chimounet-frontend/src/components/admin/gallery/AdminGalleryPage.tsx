import { useEffect, useRef, useState } from "react";

import { describeError } from "../../../api/errors";
import {
    addGalleryImage,
    deleteGalleryImage,
    fetchAllGalleryImages,
    reorderGalleryImages,
    updateGalleryImage,
} from "../../../api/gallery";
import { ACCEPT_ATTRIBUTE } from "../../../api/media";
import type { GalleryImage } from "../../../data/gallery/gallery.types";
import { useAsyncData } from "../../../hooks/useAsyncData";
import AsyncBoundary from "../shared/AsyncBoundary";
import ConfirmButton from "../shared/ConfirmButton";

export default function AdminGalleryPage() {
    const { data, isLoading, error, reload } = useAsyncData(
        fetchAllGalleryImages,
    );

    // Copie locale : permet de réordonner et d'éditer les descriptions sans
    // attendre un aller-retour réseau à chaque interaction.
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [actionError, setActionError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<string | null>(null);
    const [isOrderDirty, setIsOrderDirty] = useState(false);
    const [isSavingOrder, setIsSavingOrder] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (data) {
            setImages(data);
            setIsOrderDirty(false);
        }
    }, [data]);

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) {
            return;
        }

        setActionError(null);

        const selected = Array.from(files);
        let nextPosition = images.length;
        const failures: string[] = [];

        // Envoi séquentiel : plusieurs dizaines de photos en parallèle
        // saturent la connexion montante et font échouer des envois en série.
        for (const [index, file] of selected.entries()) {
            setUploadProgress(
                `Envoi de ${index + 1} sur ${selected.length} — ${file.name}`,
            );

            try {
                await addGalleryImage(file, "", nextPosition);
                nextPosition += 1;
            } catch (caught) {
                failures.push(`${file.name} : ${describeError(caught as Error)}`);
            }
        }

        setUploadProgress(null);

        if (failures.length > 0) {
            setActionError(
                `${failures.length} photo(s) n’ont pas pu être envoyées.\n` +
                    failures.join("\n"),
            );
        }

        reload();
    };

    const handleAltChange = (id: string, alt: string) => {
        setImages((current) =>
            current.map((image) => (image.id === id ? { ...image, alt } : image)),
        );
    };

    const handleAltSave = async (image: GalleryImage) => {
        setActionError(null);

        try {
            await updateGalleryImage(image.id, { alt: image.alt });
        } catch (caught) {
            setActionError(describeError(caught as Error));
        }
    };

    const handleTogglePublished = async (image: GalleryImage) => {
        setActionError(null);

        try {
            await updateGalleryImage(image.id, {
                isPublished: !image.isPublished,
            });
            reload();
        } catch (caught) {
            setActionError(describeError(caught as Error));
        }
    };

    const handleDelete = async (image: GalleryImage) => {
        setActionError(null);

        try {
            await deleteGalleryImage(image);
            reload();
        } catch (caught) {
            setActionError(describeError(caught as Error));
        }
    };

    const move = (index: number, offset: number) => {
        const target = index + offset;

        if (target < 0 || target >= images.length) {
            return;
        }

        const next = [...images];
        [next[index], next[target]] = [next[target], next[index]];
        setImages(next);
        setIsOrderDirty(true);
    };

    const handleSaveOrder = async () => {
        setActionError(null);
        setIsSavingOrder(true);

        try {
            await reorderGalleryImages(images.map((image) => image.id));
            setIsOrderDirty(false);
        } catch (caught) {
            setActionError(describeError(caught as Error));
        } finally {
            setIsSavingOrder(false);
        }
    };

    return (
        <div className="admin-page">
            <header className="admin-page__header">
                <div>
                    <h1>Galerie photos</h1>

                    <p className="admin-page__description">
                        {images.length} photo{images.length > 1 ? "s" : ""} dans la
                        galerie.
                    </p>
                </div>

                <div className="admin-page__actions">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={ACCEPT_ATTRIBUTE}
                        multiple
                        hidden
                        onChange={(event) => {
                            void handleUpload(event.target.files);
                            event.target.value = "";
                        }}
                    />

                    <button
                        type="button"
                        className="button button--primary"
                        disabled={uploadProgress !== null}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {uploadProgress ? "Envoi en cours…" : "Ajouter des photos"}
                    </button>
                </div>
            </header>

            {uploadProgress && (
                <p className="admin-alert admin-alert--info" role="status">
                    {uploadProgress}
                </p>
            )}

            {actionError && (
                <p className="admin-alert admin-alert--error" role="alert">
                    {actionError}
                </p>
            )}

            {isOrderDirty && (
                <div className="admin-sticky-bar">
                    <p>L’ordre a été modifié mais n’est pas encore enregistré.</p>

                    <div className="admin-sticky-bar__actions">
                        <button
                            type="button"
                            className="button button--primary"
                            disabled={isSavingOrder}
                            onClick={() => void handleSaveOrder()}
                        >
                            {isSavingOrder ? "Enregistrement…" : "Enregistrer l’ordre"}
                        </button>

                        <button
                            type="button"
                            className="admin-button admin-button--ghost"
                            onClick={reload}
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            <AsyncBoundary
                isLoading={isLoading}
                error={error}
                isEmpty={images.length === 0}
                emptyMessage="Aucune photo pour l’instant. Utilisez « Ajouter des photos »."
                onRetry={reload}
            >
                <ul className="admin-gallery">
                    {images.map((image, index) => (
                        <li
                            key={image.id}
                            className={[
                                "admin-gallery__item",
                                image.isPublished
                                    ? ""
                                    : "admin-gallery__item--draft",
                            ]
                                .filter(Boolean)
                                .join(" ")}
                        >
                            <img
                                className="admin-gallery__image"
                                src={image.url}
                                alt={image.alt || "Photo sans description"}
                                loading="lazy"
                            />

                            <div className="admin-gallery__body">
                                <label className="admin-gallery__alt">
                                    <span>Description</span>

                                    <input
                                        type="text"
                                        placeholder="Ce que l’on voit sur la photo"
                                        value={image.alt}
                                        onChange={(event) =>
                                            handleAltChange(image.id, event.target.value)
                                        }
                                        onBlur={() => void handleAltSave(image)}
                                    />
                                </label>

                                <div className="admin-gallery__actions">
                                    <button
                                        type="button"
                                        className="admin-icon-button"
                                        aria-label="Déplacer avant"
                                        disabled={index === 0}
                                        onClick={() => move(index, -1)}
                                    >
                                        ←
                                    </button>

                                    <button
                                        type="button"
                                        className="admin-icon-button"
                                        aria-label="Déplacer après"
                                        disabled={index === images.length - 1}
                                        onClick={() => move(index, 1)}
                                    >
                                        →
                                    </button>

                                    <button
                                        type="button"
                                        className="admin-button admin-button--ghost"
                                        onClick={() =>
                                            void handleTogglePublished(image)
                                        }
                                    >
                                        {image.isPublished ? "Masquer" : "Afficher"}
                                    </button>

                                    <ConfirmButton
                                        label="Supprimer"
                                        onConfirm={() => handleDelete(image)}
                                    />
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </AsyncBoundary>

            <p className="admin-hint">
                La description sert aux lecteurs d’écran et s’affiche si la photo ne
                charge pas. Elle est enregistrée dès que vous quittez le champ.
            </p>
        </div>
    );
}
