import { supabase } from "./supabase";

const SESSION_KEY = "gaec_audience_session";
const OPTOUT_KEY = "gaec_audience_disabled";

export function isAudienceMeasurementDisabled(): boolean {
    return localStorage.getItem(OPTOUT_KEY) === "true";
}

export function setAudienceMeasurementDisabled(disabled: boolean): void {
    if (disabled) {
        localStorage.setItem(OPTOUT_KEY, "true");
        sessionStorage.removeItem(SESSION_KEY);
    } else {
        localStorage.removeItem(OPTOUT_KEY);
    }
}

function getSessionId(): string {
    const current = sessionStorage.getItem(SESSION_KEY);
    if (current) return current;

    const id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
}

function getDeviceType(): "mobile" | "tablet" | "desktop" {
    if (window.matchMedia("(max-width: 600px)").matches) return "mobile";
    if (window.matchMedia("(max-width: 1024px)").matches) return "tablet";
    return "desktop";
}

function getExternalReferrerHost(): string | null {
    if (!document.referrer) return null;
    try {
        const referrer = new URL(document.referrer);
        return referrer.hostname === window.location.hostname ? null : referrer.hostname;
    } catch {
        return null;
    }
}

export async function trackPageView(path: string): Promise<void> {
    const hostname = window.location.hostname.toLowerCase();

    if (
        isAudienceMeasurementDisabled() ||
        (hostname !== "gaecchimounet.fr" && hostname !== "www.gaecchimounet.fr")
    ) {
        return;
    }

    const { error } = await supabase.rpc("track_page_view", {
        p_session_id: getSessionId(),
        p_path: path.slice(0, 300),
        p_referrer_host: getExternalReferrerHost(),
        p_device_type: getDeviceType(),
        p_hostname: hostname,
    });

    if (error && import.meta.env.DEV) {
        console.warn("La mesure d’audience n’a pas pu être enregistrée.", error);
    }
}
