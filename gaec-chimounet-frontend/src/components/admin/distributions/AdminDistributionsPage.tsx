import { useMemo, useState, type FormEvent } from "react";

import {
    createDistributionDate,
    createWeeklyDistributionDates,
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

const WEEKDAY_NAMES = [
    "dimanche",
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi",
];

type RecurrenceDraft = {
    source: DistributionDate;
    until: string;
};

function shiftDate(
    dateKey: string,
    amount: number,
    unit: "day" | "month" | "year",
) {
    const date = new Date(`${dateKey}T12:00:00`);

    if (unit === "day") date.setDate(date.getDate() + amount);
    if (unit === "month") date.setMonth(date.getMonth() + amount);
    if (unit === "year") date.setFullYear(date.getFullYear() + amount);

    return localDateKey(date);
}

function weeklyOccurrenceCount(sourceDate: string, untilDate: string): number {
    let count = 0;
    let nextDate = shiftDate(sourceDate, 7, "day");

    while (nextDate <= untilDate && count < 52) {
        count += 1;
        nextDate = shiftDate(nextDate, 7, "day");
    }

    return count;
}

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
    const [actionNotice, setActionNotice] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [recurrence, setRecurrence] = useState<RecurrenceDraft | null>(null);
    const [recurrenceError, setRecurrenceError] = useState<string | null>(null);
    const [isCreatingRecurrence, setIsCreatingRecurrence] = useState(false);

    const dates = data ?? [];
    const datesByDay = useMemo(
        () => new Map(dates.map((distribution) => [distribution.date, distribution])),
        [dates],
    );
    const cells = useMemo(() => monthCells(month), [month]);
    const today = localDateKey();
    const isFormOpen = isCreating || editingId !== null;
    const isPanelOpen = isFormOpen || recurrence !== null;
    const recurrenceCount = recurrence
        ? weeklyOccurrenceCount(recurrence.source.date, recurrence.until)
        : 0;

    const startCreate = (date = today) => {
        setForm({ date, location: "", isPublished: true });
        setEditingId(null);
        setIsCreating(true);
        setFormError(null);
        setRecurrence(null);
        setActionNotice(null);
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
        setRecurrence(null);
        setActionNotice(null);
    };

    const startRecurrence = (distribution: DistributionDate) => {
        setEditingId(null);
        setIsCreating(false);
        setRecurrence({
            source: distribution,
            until: shiftDate(distribution.date, 3, "month"),
        });
        setRecurrenceError(null);
        setActionError(null);
        setActionNotice(null);
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

    const closeRecurrence = () => {
        setRecurrence(null);
        setRecurrenceError(null);
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
        setActionNotice(null);
        try {
            await deleteDistributionDate(distribution.id);
            closeForm();
            closeRecurrence();
            reload();
        } catch (caught) {
            setActionError(describeError(caught as Error));
        }
    };

    const handleRecurrence = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!recurrence) return;

        setRecurrenceError(null);
        const minimumDate = shiftDate(recurrence.source.date, 7, "day");
        const maximumDate = shiftDate(recurrence.source.date, 1, "year");

        if (recurrence.until < minimumDate || recurrence.until > maximumDate) {
            setRecurrenceError(
                "Choisissez une date de fin comprise entre la semaine prochaine et un an.",
            );
            return;
        }

        setIsCreatingRecurrence(true);
        try {
            const created = await createWeeklyDistributionDates(
                {
                    date: recurrence.source.date,
                    location: recurrence.source.location,
                    isPublished: recurrence.source.isPublished,
                },
                recurrence.until,
            );
            closeRecurrence();
            setActionNotice(
                created === 0
                    ? "Toutes ces dates étaient déjà enregistrées."
                    : `${created} date${created > 1 ? "s" : ""} ajoutée${created > 1 ? "s" : ""}. Vous pouvez supprimer une semaine exceptionnelle individuellement.`,
            );
            reload();
        } catch (caught) {
            setRecurrenceError(describeError(caught as Error));
        } finally {
            setIsCreatingRecurrence(false);
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
                                {distribution.date >= today && (
                                    <button
                                        type="button"
                                        className="admin-button"
                                        onClick={() => startRecurrence(distribution)}
                                    >
                                        Répéter
                                    </button>
                                )}
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

                {!isPanelOpen && (
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

            {actionNotice && (
                <p className="admin-alert admin-alert--success" role="status">
                    {actionNotice}
                </p>
            )}

            <div
                className={[
                    "admin-distribution-workspace",
                    isPanelOpen ? "admin-distribution-workspace--editing" : "",
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


                {recurrence && (
                    <form
                        className="admin-form admin-form--inline admin-recurrence"
                        onSubmit={handleRecurrence}
                    >
                        <div>
                            <p className="admin-recurrence__eyebrow">
                                Récurrence hebdomadaire
                            </p>
                            <h2>
                                Tous les {WEEKDAY_NAMES[
                                    new Date(`${recurrence.source.date}T12:00:00`).getDay()
                                ]}s
                            </h2>
                            <p className="admin-form__description">
                                À partir du {formatDistributionDate(recurrence.source.date)}
                                {recurrence.source.location
                                    ? ` · ${recurrence.source.location}`
                                    : ""}
                            </p>
                        </div>

                        <div className="admin-field">
                            <label htmlFor="distribution-recurrence-until">
                                Répéter jusqu’au
                            </label>
                            <input
                                id="distribution-recurrence-until"
                                type="date"
                                required
                                min={shiftDate(recurrence.source.date, 7, "day")}
                                max={shiftDate(recurrence.source.date, 1, "year")}
                                value={recurrence.until}
                                onChange={(event) =>
                                    setRecurrence((current) =>
                                        current
                                            ? { ...current, until: event.target.value }
                                            : current,
                                    )
                                }
                            />
                            <p className="admin-field__hint">
                                {recurrenceCount} nouvelle
                                {recurrenceCount > 1 ? "s" : ""} date
                                {recurrenceCount > 1 ? "s" : ""} prévue
                                {recurrenceCount > 1 ? "s" : ""}. Les dates déjà
                                présentes seront ignorées.
                            </p>
                        </div>

                        {recurrenceError && (
                            <p className="admin-alert admin-alert--error" role="alert">
                                {recurrenceError}
                            </p>
                        )}

                        <div className="admin-form__actions">
                            <button
                                type="submit"
                                className="button button--primary"
                                disabled={isCreatingRecurrence}
                            >
                                {isCreatingRecurrence
                                    ? "Création…"
                                    : "Créer les dates"}
                            </button>
                            <button
                                type="button"
                                className="admin-button admin-button--ghost"
                                onClick={closeRecurrence}
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
