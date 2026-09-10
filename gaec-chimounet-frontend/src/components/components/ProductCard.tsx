import type { CatalogProduct } from "../../data/products/catalog.types";

type ProductCardProps = {
    product: CatalogProduct;
    showPrice: boolean;
};

const unitLabels: Record<string, string> = {
    kg: "kg",
    unit: "unité",
    piece: "pièce",
};

function formatPrice(product: CatalogProduct): string | null {
    if (product.price === null) {
        return null;
    }

    const price = new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
    }).format(product.price);
    const unit = unitLabels[product.saleUnit] ?? product.saleUnit;

    return unit ? `${price} / ${unit}` : price;
}

function stockLabel(product: CatalogProduct): string {
    if (!product.isAvailable) {
        return "Épuisé";
    }

    if (!product.isStockManaged || product.stockQuantity === null) {
        return "Disponible";
    }

    const quantity = new Intl.NumberFormat("fr-FR", {
        maximumFractionDigits: 2,
    }).format(product.stockQuantity);
    const unit = unitLabels[product.stockUnit] ?? product.stockUnit;

    return `Stock : ${quantity}${unit ? ` ${unit}` : ""}`;
}

export default function ProductCard({ product, showPrice }: ProductCardProps) {
    const price = formatPrice(product);

    return (
        <article className="product-card">
            <div className="product-card__image-wrapper">
                {product.imageUrl ? (
                    <img
                        className="product-card__image"
                        src={product.imageUrl}
                        alt={product.name}
                        loading="lazy"
                    />
                ) : (
                    <div className="product-card__image-placeholder" aria-hidden="true" />
                )}

                <span
                    className={[
                        "product-card__availability",
                        !product.isAvailable
                            ? "product-card__availability--unavailable"
                            : "",
                    ]
                        .filter(Boolean)
                        .join(" ")}
                >
                    {stockLabel(product)}
                </span>
            </div>

            <div className="product-card__content">
                <h3 className="product-card__title">
                    {product.name}
                </h3>

                <p className="product-card__category">{product.category}</p>

                {product.description && (
                    <p className="product-card__subtitle">{product.description}</p>
                )}

                {showPrice && price && (
                    <p className="product-card__price">{price}</p>
                )}
            </div>
        </article>
    );
}
