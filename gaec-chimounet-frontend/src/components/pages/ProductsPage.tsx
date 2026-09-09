import { useMemo, useState } from "react";

import { fetchPublishedProducts } from "../../api/products";
import type { ProductSeason } from "../../data/products/products.types";
import { SEASON_LABELS, SEASONS } from "../../data/recipes/recipes.types";
import { normalizeText } from "../../lib/text";
import { useAsyncData } from "../../hooks/useAsyncData";
import ProductCard from "../components/ProductCard";

type SeasonFilter = "all" | ProductSeason;

const seasonFilters: { label: string; value: SeasonFilter }[] = [
    { label: "Toutes", value: "all" },
    ...SEASONS.map((season) => ({
        label: SEASON_LABELS[season],
        value: season as SeasonFilter,
    })),
];

export default function ProductsPage() {
    const { data, isLoading, error, reload } = useAsyncData(fetchPublishedProducts);

    const [selectedSeason, setSelectedSeason] = useState<SeasonFilter>("all");
    const [productSearch, setProductSearch] = useState("");

    const products = useMemo(() => data ?? [], [data]);

    const filteredProducts = useMemo(() => {
        const normalizedSearch = normalizeText(productSearch);

        return products.filter((product) => {
            const matchesSeason =
                selectedSeason === "all" ||
                product.seasons.includes(selectedSeason);

            const matchesSearch =
                normalizedSearch === "" ||
                normalizeText(product.name).includes(normalizedSearch);

            return matchesSeason && matchesSearch;
        });
    }, [products, selectedSeason, productSearch]);

    const resetFilters = () => {
        setSelectedSeason("all");
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
                                        Filtrer par saison
                                    </p>

                                    <div
                                        className="product-filters__seasons"
                                        aria-label="Filtrer les produits par saison"
                                    >
                                        {seasonFilters.map((season) => (
                                            <button
                                                key={season.value}
                                                type="button"
                                                className={[
                                                    "product-filters__season",
                                                    selectedSeason === season.value
                                                        ? "product-filters__season--active"
                                                        : "",
                                                ]
                                                    .filter(Boolean)
                                                    .join(" ")}
                                                aria-pressed={
                                                    selectedSeason === season.value
                                                }
                                                onClick={() =>
                                                    setSelectedSeason(season.value)
                                                }
                                            >
                                                {season.label}
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

                                {(selectedSeason !== "all" || productSearch !== "") && (
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
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            ) : (
                                <div className="products-list__empty">
                                    <h3>Aucun produit trouvé</h3>

                                    <p>Essaie un autre nom ou une autre saison.</p>

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