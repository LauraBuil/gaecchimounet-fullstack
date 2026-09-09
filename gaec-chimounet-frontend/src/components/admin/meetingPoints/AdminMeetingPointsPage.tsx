import { useState, type FormEvent } from "react";

import { describeError } from "../../../api/errors";
import {
    createMeetingPoint,
    deleteMeetingPoint,
    fetchAllMeetingPoints,
    updateMeetingPoint,
} from "../../../api/meetingPoints";
import type {
    MeetingPoint,
    MeetingPointInput,
} from "../../../data/meetingPoints/meetingPoints.types";
import { useAsyncData } from "../../../hooks/useAsyncData";
import AsyncBoundary from "../shared/AsyncBoundary";
import ConfirmButton from "../shared/ConfirmButton";

const EMPTY_POINT: MeetingPointInput = {
    title: "",
    schedule: "",
    location: "",
    isPublished: true,
    position: 0,
};

export default function AdminMeetingPointsPage() {
    const { data, isLoading, error, reload } = useAsyncData(
        fetchAllMeetingPoints,
    );

    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState<MeetingPointInput>(EMPTY_POINT);
    const [formError, setFormError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const points = data ?? [];

    const startCreate = () => {
        setForm({ ...EMPTY_POINT, position: points.length });
        setEditingId(null);
        setIsCreating(true);
        setFormError(null);
    };

    const startEdit = (point: MeetingPoint) => {
        setForm({
            title: point.title,
            schedule: point.schedule,
            location: point.location,
            isPublished: point.isPublished,
            position: point.position,
        });
        setEditingId(point.id);
        setIsCreating(false);
        setFormError(null);
    };

    const closeForm = () => {
        setIsCreating(false);
        setEditingId(null);
        setFormError(null);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);

        if (!form.title.trim()) {
            setFormError("Le nom du point de distribution est obligatoire.");
            return;
        }

        setIsSubmitting(true);

        try {
            if (editingId) {
                await updateMeetingPoint(editingId, form);
            } else {
                await createMeetingPoint(form);
            }

            closeForm();
            reload();
        } catch (caught) {
            setFormError(describeError(caught as Error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (point: MeetingPoint) => {
        setActionError(null);

        try {
            await deleteMeetingPoint(point.id);
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
                    <h1>Points de distribution</h1>

                    <p className="admin-page__description">
                        Les AMAP, marchés et fermes où vous êtes présents, avec leurs
                        horaires.
                    </p>
                </div>

                {!isFormOpen && (
                    <button
                        type="button"
                        className="button button--primary"
                        onClick={startCreate}
                    >
                        Ajouter un point
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
                    <h2>
                        {editingId
                            ? "Modifier le point de distribution"
                            : "Nouveau point de distribution"}
                    </h2>

                    <div className="admin-field">
                        <label htmlFor="point-title">Nom</label>

                        <input
                            id="point-title"
                            type="text"
                            required
                            placeholder="Marché de Trébons"
                            value={form.title}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    title: event.target.value,
                                }))
                            }
                        />
                    </div>

                    <div className="admin-field">
                        <label htmlFor="point-schedule">Horaires</label>

                        <input
                            id="point-schedule"
                            type="text"
                            placeholder="Le mercredi de 16h à 19h"
                            value={form.schedule}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    schedule: event.target.value,
                                }))
                            }
                        />

                        <p className="admin-field__hint">
                            Texte libre : écrivez-le comme vous souhaitez le voir
                            affiché sur le site.
                        </p>
                    </div>

                    <div className="admin-field">
                        <label htmlFor="point-location">Lieu</label>

                        <input
                            id="point-location"
                            type="text"
                            placeholder="54 B Rue des Pyrénées, 65200 Trébons"
                            value={form.location}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    location: event.target.value,
                                }))
                            }
                        />
                    </div>

                    <div className="admin-field-row">
                        <div className="admin-field">
                            <label htmlFor="point-position">Position</label>

                            <input
                                id="point-position"
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

                            <span>Afficher sur le site</span>
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
                isEmpty={points.length === 0}
                emptyMessage="Aucun point de distribution enregistré."
                onRetry={reload}
            >
                <ul className="admin-list">
                    {points.map((point) => (
                        <li key={point.id} className="admin-list__item">
                            <div className="admin-list__content">
                                <h2 className="admin-list__title">
                                    {point.title}

                                    {!point.isPublished && (
                                        <span className="admin-badge admin-badge--draft">
                                            Masqué
                                        </span>
                                    )}
                                </h2>

                                <p className="admin-list__meta">{point.schedule}</p>

                                <p className="admin-list__summary">{point.location}</p>
                            </div>

                            <div className="admin-list__actions">
                                <button
                                    type="button"
                                    className="admin-button"
                                    onClick={() => startEdit(point)}
                                >
                                    Modifier
                                </button>

                                <ConfirmButton
                                    label="Supprimer"
                                    onConfirm={() => handleDelete(point)}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            </AsyncBoundary>
        </div>
    );
}
