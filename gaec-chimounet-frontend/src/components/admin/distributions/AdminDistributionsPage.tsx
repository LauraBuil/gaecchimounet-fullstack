import { useMemo, useState, type FormEvent } from "react";

import {
    createDistributionDate,
    deleteDistributionDate,
    fetchAllDistributionDates,
    formatDistributionDate,
    localDateKey,
    updateDistributionDate,
} from "../../../api/distributions";
import { describeError } from "../../../api/errors";
import type {
    DistributionDate,
    DistributionDateInput,
} from "../../../data/distributions/distributions.types";
import { useAsyncData } from "../../../hooks/useAsyncData";
import AsyncBoundary from "../shared/AsyncBoundary";
import ConfirmButton from "../shared/ConfirmButton";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const EMPTY_DATE: DistributionDateInput = {
    date: localDateKey(),
    location: "",
    isPublished: true,
};

function monthCells(month: Date): Date[] {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const firstCell = new Date(firstDay);
    firstCell.setDate(firstCell.getDate() - offset);

    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(firstCell);
        date.setDate(firstCell.getDate() + index);
        return date;
    });
}

export default function AdminDistributionsPage() {
    const { data, isLoading, error, reload } = useAsyncData(
        fetchAllDistributionDates,
    );
    const [month, setMonth] = useState(
        () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    );
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState<DistributionDateInput>(EMPTY_DATE);
    const [formError, setFormError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const dates = data ?? [];
    const datesByDay = useMemo(
        () => new Map(dates.map((distribution) => [distribution.date, distribution])),
        [dates],
    );
    const cells = useMemo(() => monthCells(month), [month]);
    const today = localDateKey();
    const isFormOpen = isCreating || editingId !== null;

    const startCreate = (date = today) => {
        setForm({ date, location: "", isPublished: true });
        setEditingId(null);
        setIsCreating(true);
        setFormError(null);
    };

    const startEdit = (distribution: DistributionDate) => {
        const selected = new Date(`${distribution.date}T12:00:00`);
        setMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
        setForm({
            date: distribution.date,
            location: distribution.location,
            isPublished: distribution.isPublished,
        });
        setEditingId(distribution.id);
        setIsCreating(false);
        setFormError(null);
    };

    const selectDay = (date: Date) => {
        const key = localDateKey(date);
        const existing = datesByDay.get(key);

        if (existing) {
            startEdit(existing);
        } else if (key >= today) {
            startCreate(key);
        }
    };

    const closeForm = () => {
        setEditingId(null);
        setIsCreating(false);
        setFormError(null);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);

        if (!form.date) {
            setFormError("Choisissez une date de distribution.");
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingId) {
                await updateDistributionDate(editingId, form);
            } else {
                await createDistributionDate(form);
            }
            closeForm();
            reload();
        } catch (caught) {
            setFormError(describeError(caught as Error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (distribution: DistributionDate) => {
        setActionError(null);
        try {
            await deleteDistributionDate(distribution.id);
            closeForm();
            reload();
        } catch (caught) {
            setActionError(describeError(caught as Error));
        }
    };

    const changeMonth = (difference: number) => {
        setMonth(
            (current) =>
                new Date(current.getFullYear(), current.getMonth() + difference, 1),
        );
    };

    const datesList = (
        <section className="admin-distributions">
            <h2>Dates enregistrées</h2>
            {dates.length === 0 ? (
                <p className="admin-state">Aucune distribution programmée.</p>
            ) : (
                <ul className="admin-list">
                    {dates.map((distribution) => (
                        <li className="admin-list__item" key={distribution.id}>
                            <div className="admin-list__content">
                                <h3 className="admin-list__title">
                                    {formatDistributionDate(distribution.date)}
                                    {!distribution.isPublished && (
                                        <span className="admin-badge admin-badge--draft">
                                            Masquée
                                        </span>
                                    )}
                                    {distribution.date < today && (
                                        <span className="admin-badge admin-badge--draft">
                                            Passée
                                        </span>
                                    )}
                                </h3>
                                {distribution.location && (
                                    <p className="admin-list__summary">
                                        {distribution.location}
                                    </p>
                                )}
                            </div>
                            <div className="admin-list__actions">
                                <button
                                    type="button"
                                    className="admin-button"
                                    onClick={() => startEdit(distribution)}
                                >
                                    Modifier
                                </button>
                                <ConfirmButton
                                    label="Supprimer"
                                    confirmLabel="Oui, supprimer"
                                    onConfirm={() => handleDelete(distribution)}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );

    return (
        <div className="admin-page">
            <header className="admin-page__header">
                <div>
                    <h1>Calendrier des distributions</h1>
                    <p className="admin-page__description">
                        Programmez les prochaines distributions affichées sur
                        l’accueil. La date publiée la plus proche est affichée
                        automatiquement.
                    </p>
                </div>

                {!isFormOpen && (
                    <button
                        type="button"
                        className="button button--primary"
                        onClick={() => startCreate()}
                    >
                        Ajouter une date
                    </button>
                )}
            </header>

            {actionError && (
                <p className="admin-alert admin-alert--error" role="alert">
                    {actionError}
                </p>
            )}

            <div
                className={[
                    "admin-distribution-workspace",
                    isFormOpen ? "admin-distribution-workspace--editing" : "",
                ].filter(Boolean).join(" ")}
            >
                {isFormOpen && (
                    <form className="admin-form admin-form--inline" onSubmit={handleSubmit}>
                    <h2>{editingId ? "Modifier la distribution" : "Nouvelle distribution"}</h2>

                    <div className="admin-field-row">
                        <div className="admin-field">
                            <label htmlFor="distribution-date">Date</label>
                            <input
                                id="distribution-date"
                                type="date"
                                required
                                min={editingId ? undefined : today}
                                value={form.date}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        date: event.target.value,
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
                            <span>
                                Publier
                                <em>La prochaine date publiée apparaît sur l’accueil.</em>
                            </span>
                        </label>
                    </div>

                    <div className="admin-field">
                        <label htmlFor="distribution-location">Lieu</label>
                        <input
                            id="distribution-location"
                            type="text"
                            placeholder="Marché de Trébons"
                            value={form.location}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    location: event.target.value,
                                }))
                            }
                        />
                        <p className="admin-field__hint">
                            Ce lieu sera affiché sous la date sur la page d’accueil.
                        </p>
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

                <AsyncBoundary isLoading={isLoading} error={error} onRetry={reload}>
                    {datesList}
                </AsyncBoundary>
            </div>

            <AsyncBoundary isLoading={isLoading} error={error} onRetry={reload}>
                <section className="admin-calendar" aria-label="Calendrier des distributions">
                    <header className="admin-calendar__header">
                        <button
                            type="button"
                            className="admin-button admin-button--ghost"
                            onClick={() => changeMonth(-1)}
                            aria-label="Mois précédent"
                        >
                            ←
                        </button>
                        <h2>
                            {new Intl.DateTimeFormat("fr-FR", {
                                month: "long",
                                year: "numeric",
                            }).format(month)}
                        </h2>
                        <button
                            type="button"
                            className="admin-button admin-button--ghost"
                            onClick={() => changeMonth(1)}
                            aria-label="Mois suivant"
                        >
                            →
                        </button>
                    </header>

                    <div className="admin-calendar__grid">
                        {WEEKDAYS.map((weekday) => (
                            <span className="admin-calendar__weekday" key={weekday}>
                                {weekday}
                            </span>
                        ))}
                        {cells.map((date) => {
                            const key = localDateKey(date);
                            const distribution = datesByDay.get(key);
                            const outside = date.getMonth() !== month.getMonth();
                            const isPast = key < today && !distribution;

                            return (
                                <button
                                    type="button"
                                    key={key}
                                    className={[
                                        "admin-calendar__day",
                                        outside ? "admin-calendar__day--outside" : "",
                                        key === today ? "admin-calendar__day--today" : "",
                                        distribution ? "admin-calendar__day--scheduled" : "",
                                        distribution && !distribution.isPublished
                                            ? "admin-calendar__day--draft"
                                            : "",
                                    ].filter(Boolean).join(" ")}
                                    disabled={isPast}
                                    onClick={() => selectDay(date)}
                                    aria-label={`${formatDistributionDate(key)}${
                                        distribution ? ", distribution programmée" : ""
                                    }`}
                                >
                                    <span>{date.getDate()}</span>
                                    {distribution && <i aria-hidden="true" />}
                                </button>
                            );
                        })}
                    </div>
                    <p className="admin-calendar__hint">
                        Cliquez sur une date future pour la programmer, ou sur une
                        date marquée pour la modifier.
                    </p>
                </section>

            </AsyncBoundary>
        </div>
    );
}
