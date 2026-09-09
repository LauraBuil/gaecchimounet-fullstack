import { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import { fetchPublishedGalleryImages } from "../../api/gallery";
import type { GalleryImage } from "../../data/gallery/gallery.types";
import { useAsyncData } from "../../hooks/useAsyncData";

export default function GalleryPage() {
    const { data, isLoading, error, reload } = useAsyncData(
        fetchPublishedGalleryImages,
    );

    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

    const images = data ?? [];

    useEffect(() => {
        if (!selectedImage) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setSelectedImage(null);
            }
        };

        document.body.classList.add("has-open-modal");
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.classList.remove("has-open-modal");
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [selectedImage]);

    return (
        <div className="gallery-page">
            <section className="gallery-hero">
                <div className="container gallery-hero__content">
                    <p className="eyebrow">Au fil des saisons</p>

                    <h1 className="gallery-hero__title">
                        La vie de notre exploitation
                    </h1>

                    <p className="gallery-hero__description">
                        Découvrez nos cultures, nos récoltes, les paysages qui nous
                        entourent et les petits moments qui rythment notre travail
                        toute l’année.
                    </p>
                </div>
            </section>

            <section className="section gallery-section">
                <div className="container">
                    {isLoading && (
                        <p className="section-state">Chargement des photos…</p>
                    )}

                    {error && (
                        <div className="section-state section-state--error">
                            <p>{error}</p>

                            <button
                                type="button"
                                className="button button--primary"
                                onClick={reload}
                            >
                                Réessayer
                            </button>
                        </div>
                    )}

                    {!isLoading && !error && images.length === 0 && (
                        <p className="section-state">
                            La galerie est encore vide, revenez bientôt !
                        </p>
                    )}

                    {images.length > 0 && (
                        <div className="gallery-grid">
                            {images.map((image) => (
                                <button
                                    key={image.id}
                                    type="button"
                                    className="gallery-card"
                                    onClick={() => setSelectedImage(image)}
                                    aria-label={`Agrandir l’image : ${image.alt}`}
                                >
                                    <img
                                        className="gallery-card__image"
                                        src={image.url}
                                        alt={image.alt}
                                        loading="lazy"
                                    />
                                    <span className="gallery-card__overlay" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {selectedImage && (
                <div
                    className="image-popup"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Image agrandie : ${selectedImage.alt}`}
                    onClick={() => setSelectedImage(null)}
                >
                    <div
                        className="image-popup__content"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="image-popup__close"
                            aria-label="Fermer l’image agrandie"
                            onClick={() => setSelectedImage(null)}
                        >
                            <XMarkIcon />
                        </button>

                        <img
                            className="image-popup__image"
                            src={selectedImage.url}
                            alt={selectedImage.alt}
                        />

                        <p className="image-popup__caption">{selectedImage.alt}</p>
                    </div>
                </div>
            )}
        </div>
    );
}