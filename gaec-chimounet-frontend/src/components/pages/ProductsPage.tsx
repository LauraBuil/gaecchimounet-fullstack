import { useMemo, useState } from "react";

import { fetchProductCatalogView } from "../../api/kuupanda";
import { normalizeText } from "../../lib/text";
import { useAsyncData } from "../../hooks/useAsyncData";
import ProductCard from "../components/ProductCard";

export default function ProductsPage() {
    const { data, isLoading, error, reload } = useAsyncData(fetchProductCatalogView);

    const [selectedCategory, setSelectedCategory] = useState("all");
    const [productSearch, setProductSearch] = useState("");

    const products = useMemo(() => data?.products ?? [], [data]);
    const showPrices = data?.showPrices ?? true;
    const categories = useMemo(
        () =>
            Array.from(
                new Map(
                    products.map((product) => [product.categoryId, product.category]),
                ),
            ).map(([value, label]) => ({ value, label })),
        [products],
    );

    const filteredProducts = useMemo(() => {
        const normalizedSearch = normalizeText(productSearch);

        return products.filter((product) => {
            const matchesCategory =
                selectedCategory === "all" ||
                product.categoryId === selectedCategory;

            const matchesSearch =
                normalizedSearch === "" ||
                normalizeText(product.name).includes(normalizedSearch);

            return matchesCategory && matchesSearch;
        });
    }, [products, selectedCategory, productSearch]);

    const resetFilters = () => {
        setSelectedCategory("all");
        setProductSearch("");
    };

    return (
        <div className="products-page">
            <section className="page-hero">
                <div className="container page-hero__content">
                    <p className="eyebrow">Cultivés au fil des saisons</p>

                    <h1 className="page-hero__title">Nos produits</h1>

                    <p className="page-hero__description">
                        Découvrez les légumes biologiques cultivés sur notre
                        exploitation et récoltés à maturité.
                    </p>
                </div>
            </section>

            <section className="section products-list">
                <div className="container">
                    <header className="section-heading">
                        <div>
                            <p className="eyebrow eyebrow--dark">
                                Du champ à votre panier
                            </p>

                            <h2>Nos légumes de saison</h2>
                        </div>

                        <div className="section-heading__aside">
                            <p>
                                Des produits frais, cultivés en pleine terre et récoltés
                                à maturité pour préserver leur goût.
                            </p>
                        </div>
                    </header>

                    {isLoading && (
                        <p className="section-state">Chargement des produits…</p>
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

                    {!isLoading && !error && (
                        <>
                            <div className="product-filters">
                                <div className="product-filters__group">
                                    <p className="product-filters__label">
                                        Filtrer par catégorie
                                    </p>

                                    <div
                                        className="product-filters__seasons"
                                        aria-label="Filtrer les produits par catégorie"
                                    >
                                        {[
                                            { label: "Toutes", value: "all" },
                                            ...categories,
                                        ].map((category) => (
                                            <button
                                                key={category.value}
                                                type="button"
                                                className={[
                                                    "product-filters__season",
                                                    selectedCategory === category.value
                                                        ? "product-filters__season--active"
                                                        : "",
                                                ]
                                                    .filter(Boolean)
                                                    .join(" ")}
                                                aria-pressed={
                                                    selectedCategory === category.value
                                                }
                                                onClick={() =>
                                                    setSelectedCategory(category.value)
                                                }
                                            >
                                                {category.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="product-filters__search">
                                    <label
                                        className="product-filters__label"
                                        htmlFor="product-search"
                                    >
                                        Rechercher un produit
                                    </label>

                                    <div className="product-filters__input-wrapper">
                                        <input
                                            id="product-search"
                                            className="product-filters__input"
                                            type="search"
                                            value={productSearch}
                                            placeholder="Tomate, courgette, chou…"
                                            onChange={(event) =>
                                                setProductSearch(event.target.value)
                                            }
                                        />

                                        {productSearch && (
                                            <button
                                                type="button"
                                                className="product-filters__clear"
                                                aria-label="Effacer la recherche"
                                                onClick={() => setProductSearch("")}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="products-list__results">
                                <p aria-live="polite">
                                    {filteredProducts.length}{" "}
                                    {filteredProducts.length > 1
                                        ? "produits trouvés"
                                        : "produit trouvé"}
                                </p>

                                {(selectedCategory !== "all" || productSearch !== "") && (
                                    <button
                                        type="button"
                                        className="products-list__reset"
                                        onClick={resetFilters}
                                    >
                                        Réinitialiser les filtres
                                    </button>
                                )}
                            </div>

                            {filteredProducts.length > 0 ? (
                                <div className="products-list__grid">
                                    {filteredProducts.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            showPrice={showPrices}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="products-list__empty">
                                    <h3>Aucun produit trouvé</h3>

                                    <p>Essaie un autre nom ou une autre catégorie.</p>

                                    <button
                                        type="button"
                                        className="button button--primary"
                                        onClick={resetFilters}
                                    >
                                        Voir tous les produits
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
