import { supabase } from "../lib/supabase";
import { assertOk } from "./errors";

export type AdminDashboardCounts = {
    recipes: { total: number; drafts: number };
    gallery: { total: number; drafts: number };
    products: { total: number; drafts: number };
    meetingPoints: { total: number; drafts: number };
    distributions: { total: number; drafts: number };
};

export async function fetchAdminDashboardCounts(): Promise<AdminDashboardCounts> {
    const { data, error } = await supabase.rpc("get_admin_dashboard_counts");

    assertOk(error);

    return data as AdminDashboardCounts;
}
