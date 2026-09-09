import { Link } from "react-router";

import type { Recipe } from "../../data/recipes/recipes.types";

type RecipeCardProps = {
    recipe: Recipe;
};

export default function RecipeCard({ recipe }: RecipeCardProps) {
    return (
        <article className="recipe-card">
            <Link
                className="recipe-card__image-link"
                to={`/recettes/${recipe.slug}`}
                aria-label={`Voir la recette ${recipe.title}`}
            >
                <img
                    className="recipe-card__image"
                    src={recipe.imageUrl}
                    alt={recipe.imageAlt}
                    loading="lazy"
                />
            </Link>

            <div className="recipe-card__content">
                <div className="recipe-card__metadata">
                    <span>{recipe.category}</span>
                    <span aria-hidden="true">•</span>
                    <span>{recipe.durationInMinutes} min</span>
                </div>

                <h2 className="recipe-card__title">
                    <Link to={`/recettes/${recipe.slug}`}>
                        {recipe.title}
                    </Link>
                </h2>

                <p className="recipe-card__summary">
                    {recipe.summary}
                </p>

                <Link
                    className="recipe-card__link"
                    to={`/recettes/${recipe.slug}`}
                >
                    Voir la recette
                    <span aria-hidden="true">→</span>
                </Link>
            </div>
        </article>
    );
}