import type {
    DistributionDate,
    DistributionDateInput,
} from "../data/distributions/distributions.types";
import { supabase } from "../lib/supabase";
import { invalidateAllQueries } from "../lib/queryCache";
import { assertOk } from "./errors";

const DISTRIBUTION_SELECT = "id, distribution_date, location, is_published";

type DistributionDateRow = {
    id: string;
    distribution_date: string;
    location: string;
    is_published: boolean;
};

function toDistributionDate(row: DistributionDateRow): DistributionDate {
    return {
        id: row.id,
        date: row.distribution_date,
        location: row.location,
        isPublished: row.is_published,
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
        .gte("distribution_date", localDateKey())
        .order("distribution_date")
        .limit(1)
        .maybeSingle();

    assertOk(error);
    return data ? toDistributionDate(data as DistributionDateRow) : null;
}

export async function fetchAllDistributionDates(): Promise<DistributionDate[]> {
    const { data, error } = await supabase
        .from("distribution_dates")
        .select(DISTRIBUTION_SELECT)
        .order("distribution_date");

    assertOk(error);
    return (data as DistributionDateRow[] | null)?.map(toDistributionDate) ?? [];
}

function toRow(input: DistributionDateInput) {
    return {
        distribution_date: input.date,
        location: input.location.trim(),
        is_published: input.isPublished,
    };
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
