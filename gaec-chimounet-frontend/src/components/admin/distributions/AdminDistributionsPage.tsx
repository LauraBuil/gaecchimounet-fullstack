import { useMemo, useState, type FormEvent } from "react";

import {
    addDaysToDateKey,
    addMonthsToDateKey,
    createDistributionDate,
    deleteDistributionDate,
    fetchAllDistributionDates,
    formatDistributionDate,
    isWeeklyOccurrence,
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
const WEEKDAY_NAMES = [
    "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi",
];

const EMPTY_DATE: DistributionDateInput = {
    date: localDateKey(),
    location: "",
    isPublished: true,
    repeatsWeekly: false,
    recurrenceMonths: null,
    excludedDates: [],
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

function weeklyLabel(dateKey: string, location: string): string {
    const weekday = WEEKDAY_NAMES[new Date(`${dateKey}T12:00:00`).getDay()];
    return `Tous les ${weekday}s${location.trim() ? ` à ${location.trim()}` : ""}`;
}

function isValidException(
    dateKey: string,
    sourceDate: string,
    recurrenceMonths: 6 | 12,
): boolean {
    if (dateKey < sourceDate) return false;
    if (dateKey > addMonthsToDateKey(sourceDate, recurrenceMonths)) return false;
    return new Date(`${sourceDate}T12:00:00`).getDay()
        === new Date(`${dateKey}T12:00:00`).getDay();
}

function recurrenceLastDate(dateKey: string, months: 6 | 12): string {
    const weekday = new Date(`${dateKey}T12:00:00`).getDay();
    let lastDate = addMonthsToDateKey(dateKey, months);

    while (new Date(`${lastDate}T12:00:00`).getDay() !== weekday) {
        lastDate = addDaysToDateKey(lastDate, -1);
    }

    return lastDate;
}

export default function AdminDistributionsPage() {
    const { data, isLoading, error, reload } = useAsyncData(fetchAllDistributionDates);
    const [month, setMonth] = useState(
        () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    );
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState<DistributionDateInput>(EMPTY_DATE);
    const [exceptionDate, setExceptionDate] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const dates = data ?? [];
    const cells = useMemo(() => monthCells(month), [month]);
    const datesByDay = useMemo(() => {
        const result = new Map<string, DistributionDate>();
        dates
            .filter((distribution) => !distribution.repeatsWeekly)
            .forEach((distribution) => result.set(distribution.date, distribution));
        dates
            .filter((distribution) => distribution.repeatsWeekly)
            .forEach((distribution) => {
                cells.forEach((date) => {
                    const key = localDateKey(date);
                    if (!result.has(key) && isWeeklyOccurrence(distribution, key)) {
                        result.set(key, distribution);
                    }
                });
            });
        return result;
    }, [cells, dates]);
    const today = localDateKey();
    const isFormOpen = isCreating || editingId !== null;
    const recurrenceEnd = form.repeatsWeekly && form.recurrenceMonths
        ? recurrenceLastDate(form.date, form.recurrenceMonths)
        : null;

    const startCreate = (date = today) => {
        setForm({ ...EMPTY_DATE, date });
        setEditingId(null);
        setIsCreating(true);
        setExceptionDate("");
        setFormError(null);
    };

    const startEdit = (distribution: DistributionDate) => {
        const selected = new Date(`${distribution.date}T12:00:00`);
        setMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
        setForm({
            date: distribution.date,
            location: distribution.location,
            isPublished: distribution.isPublished,
            repeatsWeekly: distribution.repeatsWeekly,
            recurrenceMonths: distribution.recurrenceMonths,
            excludedDates: distribution.excludedDates,
        });
        setEditingId(distribution.id);
        setIsCreating(false);
        setExceptionDate("");
        setFormError(null);
    };

    const selectDay = (date: Date) => {
        const key = localDateKey(date);
        const existing = datesByDay.get(key);
        if (existing) startEdit(existing);
        else if (key >= today) startCreate(key);
    };

    const closeForm = () => {
        setEditingId(null);
        setIsCreating(false);
        setExceptionDate("");
        setFormError(null);
    };

    const addException = () => {
        setFormError(null);
        if (!exceptionDate || !form.recurrenceMonths) return;
        if (!isValidException(exceptionDate, form.date, form.recurrenceMonths)) {
            setFormError(
                "L’exception doit correspondre au même jour de la semaine et rester dans la période choisie.",
            );
            return;
        }
        setForm((current) => ({
            ...current,
            excludedDates: [...new Set([...current.excludedDates, exceptionDate])].sort(),
        }));
        setExceptionDate("");
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);
        if (!form.date) {
            setFormError("Choisissez une date de distribution.");
            return;
        }
        if (form.repeatsWeekly && !form.recurrenceMonths) {
            setFormError("Choisissez une durée pour la récurrence.");
            return;
        }
        setIsSubmitting(true);
        try {
            if (editingId) await updateDistributionDate(editingId, form);
            else await createDistributionDate(form);
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
        setMonth((current) =>
            new Date(current.getFullYear(), current.getMonth() + difference, 1));
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
                                    {distribution.repeatsWeekly
                                        ? weeklyLabel(distribution.date, distribution.location)
                                        : formatDistributionDate(distribution.date)}
                                    {distribution.repeatsWeekly && (
                                        <span className="admin-badge">
                                            {distribution.recurrenceMonths === 12 ? "1 an" : "6 mois"}
                                        </span>
                                    )}
                                    {!distribution.isPublished && (
                                        <span className="admin-badge admin-badge--draft">Masquée</span>
                                    )}
                                    {!distribution.repeatsWeekly && distribution.date < today && (
                                        <span className="admin-badge admin-badge--draft">Passée</span>
                                    )}
                                </h3>
                                {distribution.repeatsWeekly ? (
                                    <p className="admin-list__summary">
                                        Du {formatDistributionDate(distribution.date)} au{" "}
                                        {formatDistributionDate(recurrenceLastDate(
                                            distribution.date,
                                            distribution.recurrenceMonths ?? 6,
                                        ))}
                                        {distribution.excludedDates.length > 0
                                            ? ` · ${distribution.excludedDates.length} exception${distribution.excludedDates.length > 1 ? "s" : ""}`
                                            : ""}
                                    </p>
                                ) : distribution.location ? (
                                    <p className="admin-list__summary">{distribution.location}</p>
                                ) : null}
                            </div>
                            <div className="admin-list__actions">
                                <button type="button" className="admin-button"
                                    onClick={() => startEdit(distribution)}>
                                    Modifier
                                </button>
                                <ConfirmButton label="Supprimer" confirmLabel="Oui, supprimer"
                                    onConfirm={() => handleDelete(distribution)} />
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
                        Programmez une date ponctuelle ou une distribution qui se répète
                        chaque semaine.
                    </p>
                </div>
                {!isFormOpen && (
                    <button type="button" className="button button--primary"
                        onClick={() => startCreate()}>
                        Ajouter une date
                    </button>
                )}
            </header>

            {actionError && (
                <p className="admin-alert admin-alert--error" role="alert">{actionError}</p>
            )}

            <div className={[
                "admin-distribution-workspace",
                isFormOpen ? "admin-distribution-workspace--editing" : "",
            ].filter(Boolean).join(" ")}>
                {isFormOpen && (
                    <form className="admin-form admin-form--inline" onSubmit={handleSubmit}>
                        <h2>{editingId ? "Modifier la distribution" : "Nouvelle distribution"}</h2>

                        <div className="admin-field-row">
                            <div className="admin-field">
                                <label htmlFor="distribution-date">Première date</label>
                                <input id="distribution-date" type="date" required
                                    min={editingId ? undefined : today} value={form.date}
                                    onChange={(event) => setForm((current) => ({
                                        ...current,
                                        date: event.target.value,
                                        excludedDates: [],
                                    }))} />
                            </div>
                            <label className="admin-checkbox">
                                <input type="checkbox" checked={form.isPublished}
                                    onChange={(event) => setForm((current) => ({
                                        ...current,
                                        isPublished: event.target.checked,
                                    }))} />
                                <span>Publier<em>La prochaine date apparaît sur l’accueil.</em></span>
                            </label>
                        </div>

                        <div className="admin-field">
                            <label htmlFor="distribution-location">Lieu</label>
                            <input id="distribution-location" type="text"
                                placeholder="Ferme Campagnolle à Laloubère"
                                value={form.location}
                                onChange={(event) => setForm((current) => ({
                                    ...current,
                                    location: event.target.value,
                                }))} />
                        </div>

                        <div className="admin-recurrence-settings">
                            <label className="admin-checkbox admin-checkbox--card">
                                <input type="checkbox" checked={form.repeatsWeekly}
                                    onChange={(event) => setForm((current) => ({
                                        ...current,
                                        repeatsWeekly: event.target.checked,
                                        recurrenceMonths: event.target.checked
                                            ? current.recurrenceMonths ?? 6
                                            : null,
                                        excludedDates: event.target.checked
                                            ? current.excludedDates
                                            : [],
                                    }))} />
                                <span>
                                    {weeklyLabel(form.date, form.location)}
                                    <em>Répéter cette distribution chaque semaine.</em>
                                </span>
                            </label>

                            {form.repeatsWeekly && (
                                <>
                                    <div className="admin-field">
                                        <label htmlFor="distribution-recurrence-duration">Durée</label>
                                        <select id="distribution-recurrence-duration"
                                            value={form.recurrenceMonths ?? 6}
                                            onChange={(event) => setForm((current) => ({
                                                ...current,
                                                recurrenceMonths: Number(event.target.value) as 6 | 12,
                                                excludedDates: [],
                                            }))}>
                                            <option value={6}>Pendant 6 mois</option>
                                            <option value={12}>Pendant un an</option>
                                        </select>
                                        {recurrenceEnd && (
                                            <p className="admin-field__hint">
                                                Jusqu’au {formatDistributionDate(recurrenceEnd)}.
                                            </p>
                                        )}
                                    </div>

                                    <div className="admin-recurrence-exceptions">
                                        <div className="admin-field">
                                            <label htmlFor="distribution-exception">
                                                Ajouter une exception
                                            </label>
                                            <div className="admin-recurrence-exceptions__controls">
                                                <input id="distribution-exception" type="date"
                                                    min={form.date > today ? form.date : today}
                                                    max={recurrenceEnd ?? undefined}
                                                    value={exceptionDate}
                                                    onChange={(event) => setExceptionDate(event.target.value)} />
                                                <button type="button" className="admin-button"
                                                    disabled={!exceptionDate} onClick={addException}>
                                                    Exclure cette date
                                                </button>
                                            </div>
                                            <p className="admin-field__hint">
                                                Pour une semaine où la distribution n’a pas lieu.
                                            </p>
                                        </div>
                                        {form.excludedDates.length > 0 && (
                                            <ul className="admin-exception-list">
                                                {form.excludedDates.map((date) => (
                                                    <li key={date}>
                                                        <span>{formatDistributionDate(date)}</span>
                                                        <button type="button"
                                                            className="admin-button admin-button--ghost"
                                                            onClick={() => setForm((current) => ({
                                                                ...current,
                                                                excludedDates: current.excludedDates
                                                                    .filter((item) => item !== date),
                                                            }))}>
                                                            Retirer
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {formError && (
                            <p className="admin-alert admin-alert--error" role="alert">{formError}</p>
                        )}
                        <div className="admin-form__actions">
                            <button type="submit" className="button button--primary"
                                disabled={isSubmitting}>
                                {isSubmitting ? "Enregistrement…" : "Enregistrer"}
                            </button>
                            <button type="button" className="admin-button admin-button--ghost"
                                onClick={closeForm}>Annuler</button>
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
                        <button type="button" className="admin-button admin-button--ghost"
                            onClick={() => changeMonth(-1)} aria-label="Mois précédent">←</button>
                        <h2>{new Intl.DateTimeFormat("fr-FR", {
                            month: "long",
                            year: "numeric",
                        }).format(month)}</h2>
                        <button type="button" className="admin-button admin-button--ghost"
                            onClick={() => changeMonth(1)} aria-label="Mois suivant">→</button>
                    </header>

                    <div className="admin-calendar__grid">
                        {WEEKDAYS.map((weekday) => (
                            <span className="admin-calendar__weekday" key={weekday}>{weekday}</span>
                        ))}
                        {cells.map((date) => {
                            const key = localDateKey(date);
                            const distribution = datesByDay.get(key);
                            const outside = date.getMonth() !== month.getMonth();
                            const isPast = key < today && !distribution;
                            return (
                                <button type="button" key={key} className={[
                                    "admin-calendar__day",
                                    outside ? "admin-calendar__day--outside" : "",
                                    key === today ? "admin-calendar__day--today" : "",
                                    distribution ? "admin-calendar__day--scheduled" : "",
                                    distribution && !distribution.isPublished
                                        ? "admin-calendar__day--draft"
                                        : "",
                                ].filter(Boolean).join(" ")} disabled={isPast}
                                    onClick={() => selectDay(date)}
                                    aria-label={`${formatDistributionDate(key)}${
                                        distribution ? ", distribution programmée" : ""
                                    }`}>
                                    <span>{date.getDate()}</span>
                                    {distribution && <i aria-hidden="true" />}
                                </button>
                            );
                        })}
                    </div>
                    <p className="admin-calendar__hint">
                        Les récurrences apparaissent ici sans créer une longue liste de dates.
                    </p>
                </section>
            </AsyncBoundary>
        </div>
    );
}
