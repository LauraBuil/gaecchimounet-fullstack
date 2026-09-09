import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { describeError } from "../../../api/errors";
import {
    createRecipe,
    fetchRecipeById,
    updateRecipe,
} from "../../../api/recipes";
import type {
    Recipe,
    RecipeInput,
    Season,
} from "../../../data/recipes/recipes.types";
import { SEASON_LABELS, SEASONS } from "../../../data/recipes/recipes.types";
import { slugify } from "../../../lib/text";
import { useAsyncData } from "../../../hooks/useAsyncData";
import AsyncBoundary from "../shared/AsyncBoundary";
import ImageUploadField from "../shared/ImageUploadField";

const EMPTY_RECIPE: RecipeInput = {
    title: "",
    slug: "",
    season: "spring",
    summary: "",
    category: "",
    preparationTimeInMinutes: 15,
    cookingTimeInMinutes: 0,
    servings: 4,
    imagePath: null,
    imageAlt: "",
    isPublished: true,
    position: 0,
    tips: "",
    ingredients: [{ quantity: "", name: "" }],
    steps: [{ description: "" }],
};

function toInput(recipe: Recipe): RecipeInput {
    return {
        title: recipe.title,
        slug: recipe.slug,
        season: recipe.season,
        summary: recipe.summary,
        category: recipe.category,
        preparationTimeInMinutes: recipe.preparationTimeInMinutes,
        cookingTimeInMinutes: recipe.cookingTimeInMinutes,
        servings: recipe.servings,
        imagePath: recipe.imagePath,
        imageAlt: recipe.imageAlt,
        isPublished: recipe.isPublished,
        position: recipe.position,
        tips: recipe.tips ?? "",
        ingredients:
            recipe.ingredients.length > 0
                ? recipe.ingredients.map(({ quantity, name }) => ({ quantity, name }))
                : [{ quantity: "", name: "" }],
        steps:
            recipe.steps.length > 0
                ? recipe.steps.map(({ description }) => ({ description }))
                : [{ description: "" }],
    };
}

export default function AdminRecipeFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const isCreating = !id || id === "nouvelle";

    const loader = useCallback(
        () => (isCreating ? Promise.resolve(null) : fetchRecipeById(id)),
        [id, isCreating],
    );

    const { data, isLoading, error, reload } = useAsyncData(loader, [id]);

    const [form, setForm] = useState<RecipeInput>(EMPTY_RECIPE);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Une fois le slug modifié à la main, on arrête de le déduire du titre :
    // le régénérer écraserait une adresse déjà partagée ou référencée.
    const [isSlugManual, setIsSlugManual] = useState(false);

    useEffect(() => {
        if (data) {
            setForm(toInput(data));
            setIsSlugManual(true);
        }
    }, [data]);

    const update = <K extends keyof RecipeInput>(
        key: K,
        value: RecipeInput[K],
    ) => {
        setForm((current) => ({ ...current, [key]: value }));
    };

    const handleTitleChange = (title: string) => {
        setForm((current) => ({
            ...current,
            title,
            slug: isSlugManual ? current.slug : slugify(title),
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitError(null);

        const slug = form.slug.trim() || slugify(form.title);

        if (!form.title.trim()) {
            setSubmitError("Le titre est obligatoire.");
            return;
        }

        if (!slug) {
            setSubmitError(
                "Le slug est vide. Renseignez-le manuellement : il sert d’adresse à la recette.",
            );
            return;
        }

        const hasIngredient = form.ingredients.some(
            (ingredient) => ingredient.name.trim() !== "",
        );

        if (!hasIngredient) {
            setSubmitError("Ajoutez au moins un ingrédient.");
            return;
        }

        const hasStep = form.steps.some((step) => step.description.trim() !== "");

        if (!hasStep) {
            setSubmitError("Ajoutez au moins une étape de préparation.");
            return;
        }

        setIsSubmitting(true);

        try {
            if (isCreating) {
                await createRecipe({ ...form, slug });
            } else {
                await updateRecipe(id, { ...form, slug });
            }

            navigate("/admin/recettes");
        } catch (caught) {
            setSubmitError(describeError(caught as Error));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="admin-page">
            <header className="admin-page__header">
                <div>
                    <Link className="admin-back" to="/admin/recettes">
                        ← Toutes les recettes
                    </Link>

                    <h1>{isCreating ? "Nouvelle recette" : "Modifier la recette"}</h1>
                </div>
            </header>

            <AsyncBoundary isLoading={isLoading} error={error} onRetry={reload}>
                {!isCreating && !data ? (
                    <p className="admin-state">
                        Cette recette n’existe pas ou a été supprimée.
                    </p>
                ) : (
                    <form className="admin-form" onSubmit={handleSubmit}>
                        <fieldset className="admin-fieldset">
                            <legend>Présentation</legend>

                            <div className="admin-field">
                                <label htmlFor="recipe-title">Titre</label>

                                <input
                                    id="recipe-title"
                                    type="text"
                                    required
                                    value={form.title}
                                    onChange={(event) =>
                                        handleTitleChange(event.target.value)
                                    }
                                />
                            </div>

                            <div className="admin-field">
                                <label htmlFor="recipe-slug">
                                    Adresse de la page (slug)
                                </label>

                                <input
                                    id="recipe-slug"
                                    type="text"
                                    value={form.slug}
                                    onChange={(event) => {
                                        setIsSlugManual(true);
                                        update("slug", event.target.value);
                                    }}
                                />

                                <p className="admin-field__hint">
                                    La recette sera accessible sur /recettes/
                                    {form.slug || "…"}. Évitez de la modifier une fois
                                    la recette publiée : les liens déjà partagés
                                    cesseraient de fonctionner.
                                </p>
                            </div>

                            <div className="admin-field">
                                <label htmlFor="recipe-summary">Résumé</label>

                                <textarea
                                    id="recipe-summary"
                                    rows={3}
                                    value={form.summary}
                                    onChange={(event) =>
                                        update("summary", event.target.value)
                                    }
                                />

                                <p className="admin-field__hint">
                                    Une ou deux phrases, affichées sur la vignette de
                                    la recette.
                                </p>
                            </div>

                            <div className="admin-field-row">
                                <div className="admin-field">
                                    <label htmlFor="recipe-category">Catégorie</label>

                                    <input
                                        id="recipe-category"
                                        type="text"
                                        list="recipe-categories"
                                        value={form.category}
                                        onChange={(event) =>
                                            update("category", event.target.value)
                                        }
                                    />

                                    <datalist id="recipe-categories">
                                        <option value="Entrée" />
                                        <option value="Plat" />
                                        <option value="Dessert" />
                                        <option value="Accompagnement" />
                                        <option value="Conserve" />
                                    </datalist>
                                </div>

                                <div className="admin-field">
                                    <label htmlFor="recipe-season">Saison</label>

                                    <select
                                        id="recipe-season"
                                        value={form.season}
                                        onChange={(event) =>
                                            update(
                                                "season",
                                                event.target.value as Season,
                                            )
                                        }
                                    >
                                        {SEASONS.map((season) => (
                                            <option key={season} value={season}>
                                                {SEASON_LABELS[season]}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="admin-fieldset">
                            <legend>Photo</legend>

                            <ImageUploadField
                                label="Image de la recette"
                                folder="recipes"
                                value={form.imagePath}
                                onChange={(path) => update("imagePath", path)}
                            />

                            <div className="admin-field">
                                <label htmlFor="recipe-image-alt">
                                    Description de l’image
                                </label>

                                <input
                                    id="recipe-image-alt"
                                    type="text"
                                    value={form.imageAlt}
                                    onChange={(event) =>
                                        update("imageAlt", event.target.value)
                                    }
                                />

                                <p className="admin-field__hint">
                                    Lue à voix haute par les lecteurs d’écran et
                                    affichée si l’image ne charge pas. Décrivez ce que
                                    l’on voit.
                                </p>
                            </div>
                        </fieldset>

                        <fieldset className="admin-fieldset">
                            <legend>Temps et portions</legend>

                            <div className="admin-field-row">
                                <div className="admin-field">
                                    <label htmlFor="recipe-preparation">
                                        Préparation (min)
                                    </label>

                                    <input
                                        id="recipe-preparation"
                                        type="number"
                                        min={0}
                                        value={form.preparationTimeInMinutes}
                                        onChange={(event) =>
                                            update(
                                                "preparationTimeInMinutes",
                                                Number(event.target.value) || 0,
                                            )
                                        }
                                    />
                                </div>

                                <div className="admin-field">
                                    <label htmlFor="recipe-cooking">
                                        Cuisson (min)
                                    </label>

                                    <input
                                        id="recipe-cooking"
                                        type="number"
                                        min={0}
                                        value={form.cookingTimeInMinutes}
                                        onChange={(event) =>
                                            update(
                                                "cookingTimeInMinutes",
                                                Number(event.target.value) || 0,
                                            )
                                        }
                                    />
                                </div>

                                <div className="admin-field">
                                    <label htmlFor="recipe-servings">Portions</label>

                                    <input
                                        id="recipe-servings"
                                        type="number"
                                        min={1}
                                        value={form.servings}
                                        onChange={(event) =>
                                            update(
                                                "servings",
                                                Number(event.target.value) || 1,
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <p className="admin-field__hint">
                                La durée totale affichée sur le site (
                                {form.preparationTimeInMinutes +
                                    form.cookingTimeInMinutes}{" "}
                                min) est la somme des deux : elle n’est pas à saisir.
                            </p>
                        </fieldset>

                        <IngredientsFieldset
                            ingredients={form.ingredients}
                            onChange={(ingredients) =>
                                update("ingredients", ingredients)
                            }
                        />

                        <StepsFieldset
                            steps={form.steps}
                            onChange={(steps) => update("steps", steps)}
                        />

                        <fieldset className="admin-fieldset">
                            <legend>Publication</legend>

                            <div className="admin-field">
                                <label htmlFor="recipe-tips">
                                    Le petit conseil (optionnel)
                                </label>

                                <textarea
                                    id="recipe-tips"
                                    rows={2}
                                    value={form.tips}
                                    onChange={(event) =>
                                        update("tips", event.target.value)
                                    }
                                />
                            </div>

                            <div className="admin-field-row">
                                <div className="admin-field">
                                    <label htmlFor="recipe-position">Position</label>

                                    <input
                                        id="recipe-position"
                                        type="number"
                                        value={form.position}
                                        onChange={(event) =>
                                            update(
                                                "position",
                                                Number(event.target.value) || 0,
                                            )
                                        }
                                    />

                                    <p className="admin-field__hint">
                                        La valeur la plus basse apparaît en premier.
                                    </p>
                                </div>

                                <label className="admin-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={form.isPublished}
                                        onChange={(event) =>
                                            update("isPublished", event.target.checked)
                                        }
                                    />

                                    <span>
                                        Publier sur le site
                                        <em>
                                            Décochez pour préparer la recette sans la
                                            rendre visible.
                                        </em>
                                    </span>
                                </label>
                            </div>
                        </fieldset>

                        {submitError && (
                            <p className="admin-alert admin-alert--error" role="alert">
                                {submitError}
                            </p>
                        )}

                        <div className="admin-form__actions">
                            <button
                                type="submit"
                                className="button button--primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? "Enregistrement…"
                                    : isCreating
                                      ? "Créer la recette"
                                      : "Enregistrer les modifications"}
                            </button>

                            <Link className="admin-button admin-button--ghost" to="/admin/recettes">
                                Annuler
                            </Link>
                        </div>
                    </form>
                )}
            </AsyncBoundary>
        </div>
    );
}

type IngredientsFieldsetProps = {
    ingredients: RecipeInput["ingredients"];
    onChange: (ingredients: RecipeInput["ingredients"]) => void;
};

function IngredientsFieldset({
    ingredients,
    onChange,
}: IngredientsFieldsetProps) {
    const updateAt = (index: number, key: "quantity" | "name", value: string) => {
        onChange(
            ingredients.map((ingredient, currentIndex) =>
                currentIndex === index
                    ? { ...ingredient, [key]: value }
                    : ingredient,
            ),
        );
    };

    const move = (index: number, offset: number) => {
        const target = index + offset;

        if (target < 0 || target >= ingredients.length) {
            return;
        }

        const next = [...ingredients];
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
    };

    return (
        <fieldset className="admin-fieldset">
            <legend>Ingrédients</legend>

            <ul className="admin-repeater">
                {ingredients.map((ingredient, index) => (
                    <li key={index} className="admin-repeater__row">
                        <input
                            type="text"
                            className="admin-repeater__quantity"
                            placeholder="500 g"
                            aria-label={`Quantité de l’ingrédient ${index + 1}`}
                            value={ingredient.quantity}
                            onChange={(event) =>
                                updateAt(index, "quantity", event.target.value)
                            }
                        />

                        <input
                            type="text"
                            className="admin-repeater__name"
                            placeholder="de tomates"
                            aria-label={`Nom de l’ingrédient ${index + 1}`}
                            value={ingredient.name}
                            onChange={(event) =>
                                updateAt(index, "name", event.target.value)
                            }
                        />

                        <div className="admin-repeater__actions">
                            <button
                                type="button"
                                className="admin-icon-button"
                                aria-label="Monter cet ingrédient"
                                disabled={index === 0}
                                onClick={() => move(index, -1)}
                            >
                                ↑
                            </button>

                            <button
                                type="button"
                                className="admin-icon-button"
                                aria-label="Descendre cet ingrédient"
                                disabled={index === ingredients.length - 1}
                                onClick={() => move(index, 1)}
                            >
                                ↓
                            </button>

                            <button
                                type="button"
                                className="admin-icon-button admin-icon-button--danger"
                                aria-label="Retirer cet ingrédient"
                                onClick={() =>
                                    onChange(
                                        ingredients.filter(
                                            (_, currentIndex) => currentIndex !== index,
                                        ),
                                    )
                                }
                            >
                                ✕
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            <button
                type="button"
                className="admin-button admin-button--ghost"
                onClick={() => onChange([...ingredients, { quantity: "", name: "" }])}
            >
                + Ajouter un ingrédient
            </button>
        </fieldset>
    );
}

type StepsFieldsetProps = {
    steps: RecipeInput["steps"];
    onChange: (steps: RecipeInput["steps"]) => void;
};

function StepsFieldset({ steps, onChange }: StepsFieldsetProps) {
    const move = (index: number, offset: number) => {
        const target = index + offset;

        if (target < 0 || target >= steps.length) {
            return;
        }

        const next = [...steps];
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
    };

    return (
        <fieldset className="admin-fieldset">
            <legend>Étapes de préparation</legend>

            <ol className="admin-repeater">
                {steps.map((step, index) => (
                    <li key={index} className="admin-repeater__row admin-repeater__row--step">
                        <span className="admin-repeater__number">
                            {String(index + 1).padStart(2, "0")}
                        </span>

                        <textarea
                            rows={2}
                            aria-label={`Description de l’étape ${index + 1}`}
                            placeholder="Décrivez l’étape…"
                            value={step.description}
                            onChange={(event) =>
                                onChange(
                                    steps.map((current, currentIndex) =>
                                        currentIndex === index
                                            ? { description: event.target.value }
                                            : current,
                                    ),
                                )
                            }
                        />

                        <div className="admin-repeater__actions">
                            <button
                                type="button"
                                className="admin-icon-button"
                                aria-label="Monter cette étape"
                                disabled={index === 0}
                                onClick={() => move(index, -1)}
                            >
                                ↑
                            </button>

                            <button
                                type="button"
                                className="admin-icon-button"
                                aria-label="Descendre cette étape"
                                disabled={index === steps.length - 1}
                                onClick={() => move(index, 1)}
                            >
                                ↓
                            </button>

                            <button
                                type="button"
                                className="admin-icon-button admin-icon-button--danger"
                                aria-label="Retirer cette étape"
                                onClick={() =>
                                    onChange(
                                        steps.filter(
                                            (_, currentIndex) => currentIndex !== index,
                                        ),
                                    )
                                }
                            >
                                ✕
                            </button>
                        </div>
                    </li>
                ))}
            </ol>

            <button
                type="button"
                className="admin-button admin-button--ghost"
                onClick={() => onChange([...steps, { description: "" }])}
            >
                + Ajouter une étape
            </button>
        </fieldset>
    );
}
