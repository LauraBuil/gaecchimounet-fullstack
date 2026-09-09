import { useCallback } from "react";
import { Link, useParams } from "react-router";

import { fetchRecipeBySlug } from "../../api/recipes";
import { useAsyncData } from "../../hooks/useAsyncData";

export default function RecipeDetailPage() {
    const { slug } = useParams<{ slug: string }>();

    const loader = useCallback(
        () => (slug ? fetchRecipeBySlug(slug) : Promise.resolve(null)),
        [slug],
    );

    const { data: recipe, isLoading, error } = useAsyncData(loader, [slug]);

    if (isLoading) {
        return (
            <section className="section">
                <div className="container">
                    <p className="section-state">Chargement de la recette…</p>
                </div>
            </section>
        );
    }

    if (error || !recipe) {
        return (
            <section className="section recipe-not-found">
                <div className="container">
                    <p className="eyebrow eyebrow--dark">Recette introuvable</p>

                    <h1>{error ? "Chargement impossible" : "Cette recette n’existe pas"}</h1>

                    {error && <p>{error}</p>}

                    <Link className="button button--primary" to="/recettes">
                        Revenir aux recettes
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <article className="recipe-detail">
            <header className="recipe-detail__hero">
                <img
                    className="recipe-detail__hero-image"
                    src={recipe.imageUrl}
                    alt=""
                    aria-hidden="true"
                />

                <div className="recipe-detail__hero-overlay" aria-hidden="true" />

                <div className="container recipe-detail__hero-content">
                    <Link className="recipe-detail__back" to="/recettes">
                        ← Toutes les recettes
                    </Link>

                    <p className="eyebrow">{recipe.category}</p>

                    <h1 className="recipe-detail__title">{recipe.title}</h1>

                    <p className="recipe-detail__summary">{recipe.summary}</p>
                </div>
            </header>

            <section className="section recipe-detail__body">
                <div className="container recipe-detail__layout">
                    <aside className="recipe-detail__aside">
                        <div className="recipe-information">
                            <div>
                                <span>Préparation</span>
                                <strong>{recipe.preparationTimeInMinutes} min</strong>
                            </div>

                            <div>
                                <span>Cuisson</span>
                                <strong>{recipe.cookingTimeInMinutes} min</strong>
                            </div>

                            <div>
                                <span>Portions</span>
                                <strong>{recipe.servings} personnes</strong>
                            </div>
                        </div>

                        <div className="ingredients-card">
                            <p className="eyebrow eyebrow--dark">
                                Pour {recipe.servings} personnes
                            </p>

                            <h2>Ingrédients</h2>

                            <ul>
                                {recipe.ingredients.map((ingredient) => (
                                    <li key={ingredient.id}>
                                        {ingredient.quantity && (
                                            <strong>{ingredient.quantity}</strong>
                                        )}

                                        <span>{ingredient.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>

                    <div className="recipe-instructions">
                        <p className="eyebrow eyebrow--dark">Préparation</p>

                        <h2>Les étapes de la recette</h2>

                        <ol>
                            {recipe.steps.map((step, index) => (
                                <li key={step.id}>
                                    <span>{String(index + 1).padStart(2, "0")}</span>

                                    <p>{step.description}</p>
                                </li>
                            ))}
                        </ol>

                        {recipe.tips && (
                            <aside className="recipe-tip">
                                <strong>Le petit conseil</strong>
                                <p>{recipe.tips}</p>
                            </aside>
                        )}
                    </div>
                </div>
            </section>
        </article>
    );
}