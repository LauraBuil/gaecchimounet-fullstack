import { invalidateAllQueries } from "../lib/queryCache";
import { supabase } from "../lib/supabase";
import { assertOk } from "./errors";

export type SiteSettings = {
    showProductPrices: boolean;
};

export async function fetchSiteSettings(): Promise<SiteSettings> {
    const { data, error } = await supabase
        .from("site_settings")
        .select("show_product_prices")
        .eq("id", "global")
        .single();

    assertOk(error);

    if (!data) {
        throw new Error("Les réglages du site sont introuvables.");
    }

    return {
        showProductPrices: data.show_product_prices,
    };
}

export async function updateProductPriceVisibility(
    showProductPrices: boolean,
): Promise<void> {
    const { error } = await supabase
        .from("site_settings")
        .update({ show_product_prices: showProductPrices })
        .eq("id", "global");

    assertOk(error);
    invalidateAllQueries();
}
