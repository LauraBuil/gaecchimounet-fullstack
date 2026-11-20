import { supabase } from "../lib/supabase";
import { assertOk } from "./errors";
import { fetchKuupandaProducts } from "./kuupanda";

export type AdminDashboardCounts = {
    recipes: { total: number; drafts: number };
    gallery: { total: number; drafts: number };
    products: { total: number; drafts: number };
    meetingPoints: { total: number; drafts: number };
    distributions: { total: number; drafts: number };
};

export async function fetchAdminDashboardCounts(): Promise<AdminDashboardCounts> {
    const [{ data, error }, kuupandaProducts] = await Promise.all([
        supabase.rpc("get_admin_dashboard_counts"),
        fetchKuupandaProducts(),
    ]);

    assertOk(error);

    const counts = data as AdminDashboardCounts;

    // La table `products` ne contient plus que les anciennes fiches éditoriales.
    // Le catalogue réellement géré et affiché vient désormais de Kuupanda.
    return {
        ...counts,
        products: {
            total: kuupandaProducts.length,
            drafts: 0,
        },
    };
}
