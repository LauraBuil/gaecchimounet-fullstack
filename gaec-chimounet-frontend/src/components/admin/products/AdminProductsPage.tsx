import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

import { describeError } from "../../../api/errors";
import { fetchProductCatalogView } from "../../../api/kuupanda";
import { updateProductPriceVisibility } from "../../../api/siteSettings";
import type { CatalogProduct } from "../../../data/products/catalog.types";
import { useAsyncData } from "../../../hooks/useAsyncData";
import AsyncBoundary from "../shared/AsyncBoundary";

const unitLabels: Record<string, string> = {
    kg: "kg",
    unit: "unité",
    piece: "pièce",
};

function formatPrice(product: CatalogProduct): string {
    if (product.price === null) {
        return "Prix non renseigné";
    }

    const price = new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
    }).format(product.price);
    const unit = unitLabels[product.saleUnit] ?? product.saleUnit;

    return unit ? `${price} / ${unit}` : price;
}

function formatStock(product: CatalogProduct): string {
    if (!product.isAvailable) {
        return "Épuisé";
    }

    if (!product.isStockManaged || product.stockQuantity === null) {
        return "Disponible — stock illimité dans Kuupanda";
    }

    const quantity = new Intl.NumberFormat("fr-FR", {
        maximumFractionDigits: 2,
    }).format(product.stockQuantity);
    const unit = unitLabels[product.stockUnit] ?? product.stockUnit;

    return `${quantity}${unit ? ` ${unit}` : ""} en stock`;
}

export default function AdminProductsPage() {
    const { data, isLoading, error, reload } = useAsyncData(fetchProductCatalogView);
    const [showPrices, setShowPrices] = useState(true);
    const [isSavingVisibility, setIsSavingVisibility] = useState(false);
    const [visibilityError, setVisibilityError] = useState<string | null>(null);
    const products = data?.products ?? [];

    useEffect(() => {
        if (data) {
            setShowPrices(data.showPrices);
        }
    }, [data]);

    const handlePriceVisibility = async (nextValue: boolean) => {
        const previousValue = showPrices;
        setShowPrices(nextValue);
        setIsSavingVisibility(true);
        setVisibilityError(null);

        try {
            await updateProductPriceVisibility(nextValue);
            reload();
        } catch (caught) {
            setShowPrices(previousValue);
            setVisibilityError(describeError(caught as Error));
        } finally {
            setIsSavingVisibility(false);
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <div>
                    <p className="admin-kicker">Catalogue synchronisé</p>
                    <h1>Produits Kuupanda</h1>
                    <p className="admin-page__description">
                        Les produits, les prix et les stocks affichés sur le site
                        viennent maintenant de votre boutique Kuupanda.
                    </p>
                </div>

                <div className="admin-page__actions">
                    <a
                        className="button button--primary admin-kuupanda-link"
                        href="https://admin.kuupanda.com"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Gérer dans Kuupanda
                        <ArrowTopRightOnSquareIcon aria-hidden="true" />
                    </a>
                </div>
            </div>

            <p className="admin-alert">
                Une modification faite dans Kuupanda devient visible ici et sur le
                site dans un délai maximal d’environ cinq minutes.
            </p>

            <div className="admin-product-setting">
                <div>
                    <h2>Afficher les prix sur le site</h2>
                    <p>
                        Ce réglage s’applique aux produits de la page d’accueil et
                        de la page Produits.
                    </p>
                </div>

                <label className="admin-switch">
                    <input
                        type="checkbox"
                        checked={showPrices}
                        disabled={isLoading || isSavingVisibility}
                        onChange={(event) =>
                            void handlePriceVisibility(event.target.checked)
                        }
                    />
                    <span className="admin-switch__track" aria-hidden="true" />
                    <span className="admin-switch__label">
                        {isSavingVisibility
                            ? "Enregistrement…"
                            : showPrices
                              ? "Prix affichés"
                              : "Prix masqués"}
                    </span>
                </label>
            </div>

            {visibilityError && (
                <p className="admin-alert admin-alert--error" role="alert">
                    {visibilityError}
                </p>
            )}

            <AsyncBoundary
                isLoading={isLoading}
                error={error}
                isEmpty={products.length === 0}
                emptyMessage="Aucun produit publié dans Kuupanda pour l’instant."
                onRetry={reload}
            >
                <ul className="admin-list">
                    {products.map((product) => (
                        <li key={product.id} className="admin-list__item">
                            {product.imageUrl ? (
                                <img
                                    className="admin-list__thumbnail"
                                    src={product.imageUrl}
                                    alt=""
                                    loading="lazy"
                                />
                            ) : (
                                <div
                                    className="admin-list__thumbnail"
                                    aria-hidden="true"
                                />
                            )}

                            <div className="admin-list__content">
                                <h2 className="admin-list__title">{product.name}</h2>

                                <p className="admin-list__meta">
                                    {product.category} · {formatPrice(product)}
                                </p>

                                <p className="admin-list__summary">
                                    {formatStock(product)}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </AsyncBoundary>
        </div>
    );
}
