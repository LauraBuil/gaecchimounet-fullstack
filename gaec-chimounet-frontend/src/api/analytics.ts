import { supabase } from "../lib/supabase";
import { assertOk } from "./errors";

export type AudienceStats = {
    periodDays: number;
    pageViews: number;
    visitors: number;
    daily: { date: string; views: number; visitors: number }[];
    popularPages: { path: string; views: number }[];
    devices: { type: "mobile" | "tablet" | "desktop"; views: number }[];
};

export async function fetchAudienceStats(): Promise<AudienceStats> {
    const { data, error } = await supabase.rpc("get_audience_stats", { p_days: 30 });
    assertOk(error);
    return data as AudienceStats;
}
