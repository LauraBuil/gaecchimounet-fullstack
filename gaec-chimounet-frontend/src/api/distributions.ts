import type {
    DistributionDate,
    DistributionDateInput,
} from "../data/distributions/distributions.types";
import { supabase } from "../lib/supabase";
import { invalidateAllQueries } from "../lib/queryCache";
import { assertOk } from "./errors";

const DISTRIBUTION_SELECT = [
    "id",
    "distribution_date",
    "location",
    "is_published",
    "repeats_weekly",
    "recurrence_months",
    "excluded_dates",
    "recurrence_parent_id",
].join(", ");

type DistributionDateRow = {
    id: string;
    distribution_date: string;
    location: string;
    is_published: boolean;
    repeats_weekly: boolean;
    recurrence_months: 6 | 12 | null;
    excluded_dates: string[];
    recurrence_parent_id: string | null;
};

function toDistributionDate(row: DistributionDateRow): DistributionDate {
    return {
        id: row.id,
        date: row.distribution_date,
        location: row.location,
        isPublished: row.is_published,
        repeatsWeekly: row.repeats_weekly,
        recurrenceMonths: row.recurrence_months,
        excludedDates: row.excluded_dates ?? [],
        recurrenceParentId: row.recurrence_parent_id,
    };
}

export function localDateKey(date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function formatDistributionDate(date: string): string {
    const parsed = new Date(`${date}T12:00:00`);
    const formatted = new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(parsed);

    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export async function fetchNextDistributionDate(): Promise<DistributionDate | null> {
    const { data, error } = await supabase
        .from("distribution_dates")
        .select(DISTRIBUTION_SELECT)
        .eq("is_published", true)
        .is("recurrence_parent_id", null)
        .order("distribution_date");

    assertOk(error);

    const today = localDateKey();
    const candidates = ((data as DistributionDateRow[] | null) ?? [])
        .map(toDistributionDate)
        .filter((distribution) => distribution.recurrenceParentId === null)
        .map((distribution) => {
            if (!distribution.repeatsWeekly) {
                return distribution.date >= today ? distribution : null;
            }

            const occurrence = nextWeeklyOccurrence(distribution, today);
            return occurrence ? { ...distribution, date: occurrence } : null;
        })
        .filter((distribution): distribution is DistributionDate => distribution !== null)
        .sort((left, right) => left.date.localeCompare(right.date));

    return candidates[0] ?? null;
}

export async function fetchAllDistributionDates(): Promise<DistributionDate[]> {
    const { data, error } = await supabase
        .from("distribution_dates")
        .select(DISTRIBUTION_SELECT)
        .is("recurrence_parent_id", null)
        .order("distribution_date");

    assertOk(error);
    return ((data as DistributionDateRow[] | null) ?? [])
        .map(toDistributionDate)
        .filter((distribution) => distribution.recurrenceParentId === null);
}

function toRow(input: DistributionDateInput) {
    return {
        distribution_date: input.date,
        location: input.location.trim(),
        is_published: input.isPublished,
        repeats_weekly: input.repeatsWeekly,
        recurrence_months: input.repeatsWeekly ? input.recurrenceMonths : null,
        excluded_dates: input.repeatsWeekly ? input.excludedDates : [],
    };
}

export function addDaysToDateKey(dateKey: string, days: number): string {
    const date = new Date(`${dateKey}T12:00:00`);
    date.setDate(date.getDate() + days);
    return localDateKey(date);
}

export function addMonthsToDateKey(dateKey: string, months: number): string {
    const date = new Date(`${dateKey}T12:00:00`);
    date.setMonth(date.getMonth() + months);
    return localDateKey(date);
}

export function isWeeklyOccurrence(
    distribution: DistributionDate,
    dateKey: string,
): boolean {
    if (!distribution.repeatsWeekly || !distribution.recurrenceMonths) return false;
    if (dateKey < distribution.date) return false;
    if (dateKey > addMonthsToDateKey(distribution.date, distribution.recurrenceMonths)) {
        return false;
    }
    if (distribution.excludedDates.includes(dateKey)) return false;

    const source = new Date(`${distribution.date}T12:00:00`);
    const candidate = new Date(`${dateKey}T12:00:00`);
    return source.getDay() === candidate.getDay();
}

function nextWeeklyOccurrence(
    distribution: DistributionDate,
    today: string,
): string | null {
    let candidate = distribution.date;

    while (candidate < today) {
        candidate = addDaysToDateKey(candidate, 7);
    }

    while (distribution.excludedDates.includes(candidate)) {
        candidate = addDaysToDateKey(candidate, 7);
    }

    const endDate = addMonthsToDateKey(
        distribution.date,
        distribution.recurrenceMonths ?? 0,
    );
    return candidate <= endDate ? candidate : null;
}

export async function createDistributionDate(
    input: DistributionDateInput,
): Promise<string> {
    const { data, error } = await supabase
        .from("distribution_dates")
        .insert(toRow(input))
        .select("id")
        .single();

    assertOk(error);

    invalidateAllQueries();
    return (data as { id: string }).id;
}

export async function updateDistributionDate(
    id: string,
    input: DistributionDateInput,
): Promise<void> {
    const { error } = await supabase
        .from("distribution_dates")
        .update(toRow(input))
        .eq("id", id);

    assertOk(error);

    if (input.repeatsWeekly) {
        const { error: occurrenceError } = await supabase
            .from("distribution_dates")
            .update({
                location: input.location.trim(),
                is_published: input.isPublished,
            })
            .eq("recurrence_parent_id", id);

        assertOk(occurrenceError);
    } else {
        const { error: occurrenceError } = await supabase
            .from("distribution_dates")
            .delete()
            .eq("recurrence_parent_id", id);

        assertOk(occurrenceError);
    }

    invalidateAllQueries();
}

export async function deleteDistributionDate(id: string): Promise<void> {
    const { error } = await supabase
        .from("distribution_dates")
        .delete()
        .eq("id", id);

    assertOk(error);

    invalidateAllQueries();
}
