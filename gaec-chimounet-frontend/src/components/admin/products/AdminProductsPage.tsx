import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

import { fetchKuupandaProducts } from "../../../api/kuupanda";
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
    const { data, isLoading, error, reload } = useAsyncData(fetchKuupandaProducts);
    const products = data ?? [];

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
