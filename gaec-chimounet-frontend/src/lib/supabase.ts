import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// On échoue au démarrage plutôt qu'au premier appel réseau : un build déployé
// sans ces variables afficherait sinon des pages vides sans explication.
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        "Configuration Supabase manquante. Renseignez VITE_SUPABASE_URL et " +
            "VITE_SUPABASE_ANON_KEY dans le fichier .env avant de lancer le build.",
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Le jeton de connexion arrive dans l'URL après un lien de
        // réinitialisation de mot de passe.
        detectSessionInUrl: true,
    },
});

export const MEDIA_BUCKET = "medias";
