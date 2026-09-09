import { useEffect, useState, type FormEvent } from "react";

import { describeError } from "../../../api/errors";
import {
    createProduct,
    deleteProduct,
    fetchAllProducts,
    setProductPublished,
    updateProduct,
} from "../../../api/products";
import type {
    Product,
    ProductInput,
    ProductSeason,
} from "../../../data/products/products.types";
import { SEASON_LABELS, SEASONS } from "../../../data/recipes/recipes.types";
import { slugify } from "../../../lib/text";
import { useAsyncData } from "../../../hooks/useAsyncData";
import AsyncBoundary from "../shared/AsyncBoundary";
import ConfirmButton from "../shared/ConfirmButton";
import ImageUploadField from "../shared/ImageUploadField";

const EMPTY_PRODUCT: ProductInput = {
    name: "",
    slug: "",
    subtitle: "",
    imagePath: null,
    imageAlt: "",
    seasons: [],
    isPublished: true,
    position: 0,
};

function toInput(product: Product): ProductInput {
    return {
        name: product.name,
        slug: product.slug,
        subtitle: product.subtitle,
        imagePath: product.imagePath,
        imageAlt: product.imageAlt,
        seasons: product.seasons,
        isPublished: product.isPublished,
        position: product.position,
    };
}

export default function AdminProductsPage() {
    const { data, isLoading, error, reload } = useAsyncData(fetchAllProducts);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState<ProductInput>(EMPTY_PRODUCT);
    const [formError, setFormError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const products = data ?? [];

    // Referme le formulaire si la fiche en cours d'édition a disparu, par
    // exemple après une suppression déclenchée depuis un autre onglet.
    useEffect(() => {
        if (editingId && !products.some((product) => product.id === editingId)) {
            setEditingId(null);
        }
    }, [editingId, products]);

    const startCreate = () => {
        setForm({ ...EMPTY_PRODUCT, position: products.length });
        setEditingId(null);
        setIsCreating(true);
        setFormError(null);
    };

    const startEdit = (product: Product) => {
        setForm(toInput(product));
        setEditingId(product.id);
        setIsCreating(false);
        setFormError(null);
    };

    const closeForm = () => {
        setIsCreating(false);
        setEditingId(null);
        setFormError(null);
    };

    const toggleSeason = (season: ProductSeason) => {
        setForm((current) => ({
            ...current,
            seasons: current.seasons.includes(season)
                ? current.seasons.filter((value) => value !== season)
                : [...current.seasons, season],
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);

        if (!form.name.trim()) {
            setFormError("Le nom du produit est obligatoire.");
            return;
        }

        const slug = form.slug.trim() || slugify(form.name);

        if (!slug) {
            setFormError("Le slug ne peut pas être vide.");
            return;
        }

        setIsSubmitting(true);

        try {
            if (editingId) {
                await updateProduct(editingId, { ...form, slug });
            } else {
                await createProduct({ ...form, slug });
            }

            closeForm();
            reload();
        } catch (caught) {
            setFormError(describeError(caught as Error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTogglePublished = async (product: Product) => {
        setActionError(null);

        try {
            await setProductPublished(product.id, !product.isPublished);
            reload();
        } catch (caught) {
            setActionError(describeError(caught as Error));
        }
    };

    const handleDelete = async (product: Product) => {
        setActionError(null);

        try {
            await deleteProduct(product);
            reload();
        } catch (caught) {
            setActionError(describeError(caught as Error));
        }
    };

    const isFormOpen = isCreating || editingId !== null;

    return (
        <div className="admin-page">
            <header className="admin-page__header">
                <div>
                    <h1>Produits</h1>

                    <p className="admin-page__description">
                        {products.length} produit{products.length > 1 ? "s" : ""} au
                        catalogue.
                    </p>
                </div>

                {!isFormOpen && (
                    <button
                        type="button"
                        className="button button--primary"
                        onClick={startCreate}
                    >
                        Ajouter un produit
                    </button>
                )}
            </header>

            {actionError && (
                <p className="admin-alert admin-alert--error" role="alert">
                    {actionError}
                </p>
            )}

            {isFormOpen && (
                <form className="admin-form admin-form--inline" onSubmit={handleSubmit}>
                    <h2>{editingId ? "Modifier le produit" : "Nouveau produit"}</h2>

                    <div className="admin-field-row">
                        <div className="admin-field">
                            <label htmlFor="product-name">Nom</label>

                            <input
                                id="product-name"
                                type="text"
                                required
                                value={form.name}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        name: event.target.value,
                                        // Le slug d'un produit existant n'est pas
                                        // régénéré : il pourrait être déjà référencé.
                                        slug: editingId
                                            ? current.slug
                                            : slugify(event.target.value),
                                    }))
                                }
                            />
                        </div>

                        <div className="admin-field">
                            <label htmlFor="product-slug">Slug</label>

                            <input
                                id="product-slug"
                                type="text"
                                value={form.slug}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        slug: event.target.value,
                                    }))
                                }
                            />
                        </div>
                    </div>

                    <div className="admin-field">
                        <label htmlFor="product-subtitle">Accroche</label>

                        <input
                            id="product-subtitle"
                            type="text"
                            placeholder="Sucrés et fondants"
                            value={form.subtitle}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    subtitle: event.target.value,
                                }))
                            }
                        />
                    </div>

                    <ImageUploadField
                        label="Photo du produit"
                        folder="products"
                        value={form.imagePath}
                        onChange={(path) =>
                            setForm((current) => ({ ...current, imagePath: path }))
                        }
                    />

                    <div className="admin-field">
                        <label htmlFor="product-image-alt">
                            Description de l’image
                        </label>

                        <input
                            id="product-image-alt"
                            type="text"
                            value={form.imageAlt}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    imageAlt: event.target.value,
                                }))
                            }
                        />
                    </div>

                    <fieldset className="admin-field">
                        <legend>Saisons de disponibilité</legend>

                        <div className="admin-checkbox-group">
                            {SEASONS.map((season) => (
                                <label key={season} className="admin-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={form.seasons.includes(season)}
                                        onChange={() => toggleSeason(season)}
                                    />

                                    <span>{SEASON_LABELS[season]}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <div className="admin-field-row">
                        <div className="admin-field">
                            <label htmlFor="product-position">Position</label>

                            <input
                                id="product-position"
                                type="number"
                                value={form.position}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        position: Number(event.target.value) || 0,
                                    }))
                                }
                            />
                        </div>

                        <label className="admin-checkbox">
                            <input
                                type="checkbox"
                                checked={form.isPublished}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        isPublished: event.target.checked,
                                    }))
                                }
                            />

                            <span>Publier sur le site</span>
                        </label>
                    </div>

                    {formError && (
                        <p className="admin-alert admin-alert--error" role="alert">
                            {formError}
                        </p>
                    )}

                    <div className="admin-form__actions">
                        <button
                            type="submit"
                            className="button button--primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Enregistrement…" : "Enregistrer"}
                        </button>

                        <button
                            type="button"
                            className="admin-button admin-button--ghost"
                            onClick={closeForm}
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            )}

            <AsyncBoundary
                isLoading={isLoading}
                error={error}
                isEmpty={products.length === 0}
                emptyMessage="Aucun produit pour l’instant."
                onRetry={reload}
            >
                <ul className="admin-list">
                    {products.map((product) => (
                        <li key={product.id} className="admin-list__item">
                            <img
                                className="admin-list__thumbnail"
                                src={product.imageUrl}
                                alt=""
                                loading="lazy"
                            />

                            <div className="admin-list__content">
                                <h2 className="admin-list__title">
                                    {product.name}

                                    {!product.isPublished && (
                                        <span className="admin-badge admin-badge--draft">
                                            Non publié
                                        </span>
                                    )}
                                </h2>

                                <p className="admin-list__meta">
                                    {product.seasons.length > 0
                                        ? product.seasons
                                              .map((season) => SEASON_LABELS[season])
                                              .join(", ")
                                        : "Aucune saison renseignée"}
                                </p>

                                <p className="admin-list__summary">
                                    {product.subtitle}
                                </p>
                            </div>

                            <div className="admin-list__actions">
                                <button
                                    type="button"
                                    className="admin-button"
                                    onClick={() => startEdit(product)}
                                >
                                    Modifier
                                </button>

                                <button
                                    type="button"
                                    className="admin-button admin-button--ghost"
                                    onClick={() => void handleTogglePublished(product)}
                                >
                                    {product.isPublished ? "Dépublier" : "Publier"}
                                </button>

                                <ConfirmButton
                                    label="Supprimer"
                                    onConfirm={() => handleDelete(product)}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            </AsyncBoundary>
        </div>
    );
}
