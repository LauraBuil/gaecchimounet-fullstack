import type { PostgrestError } from "@supabase/supabase-js";

/**
 * Traduit les erreurs Supabase en messages affichables.
 *
 * Deux cas méritent un traitement dédié parce qu'ils arriveront en pratique :
 * le slug déjà pris, et le refus par une politique RLS — qui remonterait sinon
 * comme un « new row violates row-level security policy » incompréhensible.
 */
export function describeError(error: PostgrestError | Error | null): string {
    if (!error) {
        return "Une erreur inconnue est survenue.";
    }

    const code = "code" in error ? error.code : undefined;
    const message = error.message ?? "";

    // Les messages levés par nos propres triggers sont déjà rédigés en clair.
    if (message.includes("administrateur")) {
        return message;
    }

    switch (code) {
        case "23505": // unique_violation
            return message.includes("slug")
                ? "Cette adresse (slug) est déjà utilisée par un autre contenu. Modifiez le titre ou le slug."
                : "Cet enregistrement existe déjà.";

        case "23514": // check_violation
            return "Une valeur saisie sort des limites autorisées.";

        case "23503": // foreign_key_violation
            return "Cet élément est encore lié à un autre contenu.";

        case "42501": // insufficient_privilege
            return "Vous n'avez pas les droits nécessaires pour cette action.";

        case "PGRST116": // aucune ligne retournée alors qu'une seule était attendue
            return "Ce contenu n'existe pas ou plus.";
    }

    if (message.includes("row-level security")) {
        return "Vous n'avez pas les droits nécessaires pour cette action.";
    }

    if (message.includes("Failed to fetch") || message.includes("NetworkError")) {
        return "Connexion au serveur impossible. Vérifiez votre accès à Internet.";
    }

    return message || "Une erreur inconnue est survenue.";
}

/** Lève une erreur parlante si la requête Supabase a échoué. */
export function assertOk(error: PostgrestError | null): void {
    if (error) {
        throw new Error(describeError(error));
    }
}
