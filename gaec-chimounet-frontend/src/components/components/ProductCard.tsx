import type {
    Product,
    //ProductAvailability,
} from "../../data/products/products.types.ts";

type ProductCardProps = {
    product: Product;
};

// const availabilityLabels: Record<ProductAvailability, string> = {
//     available: "Disponible",
//     soon: "Bientôt disponible",
//     unavailable: "Indisponible",
// };

export default function ProductCard({
                                        product,
                                    }: ProductCardProps) {
    return (
        <article className="product-card">
            <div className="product-card__image-wrapper">
                <img
                    className="product-card__image"
                    src={product.imageUrl}
                    alt={product.imageAlt}
                    loading="lazy"
                />

        {/*        <span*/}
        {/*            className={[*/}
        {/*                "product-card__availability",*/}
        {/*                `product-card__availability--${product.availability}`,*/}
        {/*            ].join(" ")}*/}
        {/*        >*/}
        {/*  {availabilityLabels[product.availability]}*/}
        {/*</span>*/}
            </div>

            <div className="product-card__content">
                <h3 className="product-card__title">
                    {product.name}
                </h3>

                <p className="product-card__subtitle">
                    {product.subtitle}
                </p>

                {/*<a*/}
                {/*    className="product-card__link"*/}
                {/*    href={`/produits/${product.slug}`}*/}
                {/*>*/}
                {/*    Découvrir*/}
                {/*    <span aria-hidden="true">→</span>*/}
                {/*</a>*/}
            </div>
        </article>
    );
}