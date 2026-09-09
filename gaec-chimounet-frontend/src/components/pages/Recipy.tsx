import { useMemo, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import { fetchPublishedRecipes } from "../../api/recipes";
import type { Season } from "../../data/recipes/recipes.types";
import { SEASON_LABELS, SEASONS } from "../../data/recipes/recipes.types";
import { normalizeText } from "../../lib/text";
import { useAsyncData } from "../../hooks/useAsyncData";
import RecipeCard from "../components/RecipeCard";

type SeasonFilter = "toutes" | Season;

const seasonFilters: { label: string; value: SeasonFilter }[] = [
    { label: "Toutes", value: "toutes" },
    ...SEASONS.map((season) => ({
        label: SEASON_LABELS[season],
        value: season as SeasonFilter,
    })),
];

export default function Recipy() {
    const { data, isLoading, error, reload } = useAsyncData(fetchPublishedRecipes);

    const [selectedSeason, setSelectedSeason] = useState<SeasonFilter>("toutes");
    const [ingredientSearch, setIngredientSearch] = useState("");

    const recipes = useMemo(() => data ?? [], [data]);

    const filteredRecipes = useMemo(() => {
        const normalizedSearch = normalizeText(ingredientSearch);

        return recipes.filter((recipe) => {
            const matchesSeason =
                selectedSeason === "toutes" || recipe.season === selectedSeason;

            const searchableIngredients = recipe.ingredients
                .map((ingredient) => ingredient.name)
                .join(" ");

            const searchableText = normalizeText(
                `${recipe.title} ${searchableIngredients}`,
            );

            const matchesSearch =
                normalizedSearch === "" ||
                searchableText.includes(normalizedSearch);

            return matchesSeason && matchesSearch;
        });
    }, [recipes, selectedSeason, ingredientSearch]);

    const resetFilters = () => {
        setSelectedSeason("toutes");
        setIngredientSearch("");
    };

    return (
        <div className="recipes-page">
            <section className="page-hero">
                <div className="container page-hero__content">
                    <p className="eyebrow">Cuisinez au rythme des saisons</p>

                    <h1 className="page-hero__title">Nos recettes</h1>

                    <p className="page-hero__description">
                        Des idées simples et généreuses pour cuisiner les légumes
                        biologiques de notre exploitation.
                    </p>
                </div>
            </section>

            <section className="section recipes-list">
                <div className="container">
                    <header className="section-heading">
                        <div>
                            <p className="eyebrow eyebrow--dark">Toutes nos idées</p>

                            <h2>Des recettes de saison</h2>
                        </div>

                        <div className="section-heading__aside">
                            <p>
                                Retrouvez des recettes adaptées aux produits disponibles
                                au fil de l’année.
                            </p>
                        </div>
                    </header>

                    {isLoading && (
                        <p className="section-state">Chargement des recettes…</p>
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
                            <div className="recipe-filters">
                                <div className="recipe-filters__group">
                                    <p className="recipe-filters__label">
                                        Filtrer par saison
                                    </p>

                                    <div
                                        className="recipe-filters__seasons"
                                        aria-label="Filtrer les recettes par saison"
                                    >
                                        {seasonFilters.map((season) => (
                                            <button
                                                key={season.value}
                                                type="button"
                                                className={[
                                                    "recipe-filters__season",
                                                    selectedSeason === season.value
                                                        ? "recipe-filters__season--active"
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

                                <div className="recipe-filters__search">
                                    <label
                                        className="recipe-filters__label"
                                        htmlFor="ingredient-search"
                                    >
                                        Rechercher par ingrédient
                                    </label>

                                    <div className="recipe-filters__input-wrapper">
                                        <input
                                            id="ingredient-search"
                                            className="recipe-filters__input"
                                            type="search"
                                            value={ingredientSearch}
                                            placeholder="Tomate, courgette, carotte…"
                                            onChange={(event) =>
                                                setIngredientSearch(event.target.value)
                                            }
                                        />

                                        {ingredientSearch && (
                                            <button
                                                type="button"
                                                className="recipe-filters__clear"
                                                aria-label="Effacer la recherche"
                                                onClick={() => setIngredientSearch("")}
                                            >
                                                <XMarkIcon />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="recipes-list__results">
                                <p aria-live="polite">
                                    {filteredRecipes.length}{" "}
                                    {filteredRecipes.length > 1
                                        ? "recettes trouvées"
                                        : "recette trouvée"}
                                </p>

                                {(selectedSeason !== "toutes" || ingredientSearch) && (
                                    <button
                                        type="button"
                                        className="recipes-list__reset"
                                        onClick={resetFilters}
                                    >
                                        Réinitialiser les filtres
                                    </button>
                                )}
                            </div>

                            {filteredRecipes.length > 0 ? (
                                <div className="recipes-list__grid">
                                    {filteredRecipes.map((recipe) => (
                                        <RecipeCard key={recipe.id} recipe={recipe} />
                                    ))}
                                </div>
                            ) : (
                                <div className="recipes-list__empty">
                                    <h3>Aucune recette trouvée</h3>

                                    <p>Essaie un autre ingrédient ou une autre saison.</p>

                                    <button
                                        type="button"
                                        className="button button--primary"
                                        onClick={resetFilters}
                                    >
                                        Voir toutes les recettes
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