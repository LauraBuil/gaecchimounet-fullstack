import { useState } from "react";
import { Link } from "react-router";

import { describeError } from "../../../api/errors";
import {
    deleteRecipe,
    fetchAllRecipes,
    setRecipePublished,
} from "../../../api/recipes";
import type { Recipe } from "../../../data/recipes/recipes.types";
import { SEASON_LABELS } from "../../../data/recipes/recipes.types";
import { useAsyncData } from "../../../hooks/useAsyncData";
import AsyncBoundary from "../shared/AsyncBoundary";
import ConfirmButton from "../shared/ConfirmButton";

export default function AdminRecipesPage() {
    const { data, isLoading, error, reload } = useAsyncData(fetchAllRecipes);
    const [actionError, setActionError] = useState<string | null>(null);

    const recipes = data ?? [];

    const handleTogglePublished = async (recipe: Recipe) => {
        setActionError(null);

        try {
            await setRecipePublished(recipe.id, !recipe.isPublished);
            reload();
        } catch (caught) {
            setActionError(describeError(caught as Error));
        }
    };

    const handleDelete = async (recipe: Recipe) => {
        setActionError(null);

        try {
            await deleteRecipe(recipe);
            reload();
        } catch (caught) {
            setActionError(describeError(caught as Error));
        }
    };

    return (
        <div className="admin-page">
            <header className="admin-page__header">
                <div>
                    <h1>Recettes</h1>

                    <p className="admin-page__description">
                        {recipes.length} recette{recipes.length > 1 ? "s" : ""} au
                        total.
                    </p>
                </div>

                <Link className="button button--primary" to="/admin/recettes/nouvelle">
                    Ajouter une recette
                </Link>
            </header>

            {actionError && (
                <p className="admin-alert admin-alert--error" role="alert">
                    {actionError}
                </p>
            )}

            <AsyncBoundary
                isLoading={isLoading}
                error={error}
                isEmpty={recipes.length === 0}
                emptyMessage="Aucune recette pour l’instant. Commencez par en ajouter une."
                onRetry={reload}
            >
                <ul className="admin-list">
                    {recipes.map((recipe) => (
                        <li key={recipe.id} className="admin-list__item">
                            <img
                                className="admin-list__thumbnail"
                                src={recipe.imageUrl}
                                alt=""
                                loading="lazy"
                            />

                            <div className="admin-list__content">
                                <h2 className="admin-list__title">
                                    {recipe.title}

                                    {!recipe.isPublished && (
                                        <span className="admin-badge admin-badge--draft">
                                            Non publiée
                                        </span>
                                    )}
                                </h2>

                                <p className="admin-list__meta">
                                    {SEASON_LABELS[recipe.season]}
                                    {recipe.category && ` · ${recipe.category}`}
                                    {" · "}
                                    {recipe.durationInMinutes} min
                                    {" · "}
                                    {recipe.ingredients.length} ingrédient
                                    {recipe.ingredients.length > 1 ? "s" : ""}
                                    {" · "}
                                    {recipe.steps.length} étape
                                    {recipe.steps.length > 1 ? "s" : ""}
                                </p>

                                <p className="admin-list__summary">{recipe.summary}</p>
                            </div>

                            <div className="admin-list__actions">
                                <Link
                                    className="admin-button"
                                    to={`/admin/recettes/${recipe.id}`}
                                >
                                    Modifier
                                </Link>

                                <button
                                    type="button"
                                    className="admin-button admin-button--ghost"
                                    onClick={() => void handleTogglePublished(recipe)}
                                >
                                    {recipe.isPublished ? "Dépublier" : "Publier"}
                                </button>

                                <ConfirmButton
                                    label="Supprimer"
                                    onConfirm={() => handleDelete(recipe)}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            </AsyncBoundary>
        </div>
    );
}
