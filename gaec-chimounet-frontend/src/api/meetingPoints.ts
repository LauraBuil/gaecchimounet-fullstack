import type {
    MeetingPoint,
    MeetingPointInput,
} from "../data/meetingPoints/meetingPoints.types";
import { supabase } from "../lib/supabase";
import { assertOk } from "./errors";

const MEETING_POINT_SELECT =
    "id, title, schedule, location, is_published, position";

type MeetingPointRow = {
    id: string;
    title: string;
    schedule: string;
    location: string;
    is_published: boolean;
    position: number;
};

function toMeetingPoint(row: MeetingPointRow): MeetingPoint {
    return {
        id: row.id,
        title: row.title,
        schedule: row.schedule,
        location: row.location,
        isPublished: row.is_published,
        position: row.position,
    };
}

export async function fetchPublishedMeetingPoints(): Promise<MeetingPoint[]> {
    const { data, error } = await supabase
        .from("meeting_points")
        .select(MEETING_POINT_SELECT)
        .eq("is_published", true)
        .order("position");

    assertOk(error);

    return (data as MeetingPointRow[] | null)?.map(toMeetingPoint) ?? [];
}

export async function fetchAllMeetingPoints(): Promise<MeetingPoint[]> {
    const { data, error } = await supabase
        .from("meeting_points")
        .select(MEETING_POINT_SELECT)
        .order("position");

    assertOk(error);

    return (data as MeetingPointRow[] | null)?.map(toMeetingPoint) ?? [];
}

function toRow(input: MeetingPointInput) {
    return {
        title: input.title.trim(),
        schedule: input.schedule.trim(),
        location: input.location.trim(),
        is_published: input.isPublished,
        position: input.position,
    };
}

export async function createMeetingPoint(
    input: MeetingPointInput,
): Promise<string> {
    const { data, error } = await supabase
        .from("meeting_points")
        .insert(toRow(input))
        .select("id")
        .single();

    assertOk(error);

    return (data as { id: string }).id;
}

export async function updateMeetingPoint(
    id: string,
    input: MeetingPointInput,
): Promise<void> {
    const { error } = await supabase
        .from("meeting_points")
        .update(toRow(input))
        .eq("id", id);

    assertOk(error);
}

export async function deleteMeetingPoint(id: string): Promise<void> {
    const { error } = await supabase
        .from("meeting_points")
        .delete()
        .eq("id", id);

    assertOk(error);
}
