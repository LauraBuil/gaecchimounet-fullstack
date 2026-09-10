import { supabase } from "../lib/supabase";
import { assertOk, describeError } from "./errors";

export type UserRole = "admin" | "exploitant";

export type StaffMember = {
    id: string;
    email: string;
    fullName: string | null;
    role: UserRole;
    createdAt: string;
};

export const ROLE_LABELS: Record<UserRole, string> = {
    admin: "Administrateur",
    exploitant: "Exploitant",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
    admin: "Gère le contenu et les comptes utilisateurs.",
    exploitant: "Gère le contenu du site : recettes, photos, produits, points de distribution.",
};

type ProfileRow = {
    id: string;
    email: string;
    full_name: string | null;
    role: UserRole;
    created_at: string;
};

function toStaffMember(row: ProfileRow): StaffMember {
    return {
        id: row.id,
        email: row.email,
        fullName: row.full_name,
        role: row.role,
        createdAt: row.created_at,
    };
}

/** RLS ne renverra la liste complète qu'au staff ; un visiteur obtient un tableau vide. */
export async function fetchStaffMembers(): Promise<StaffMember[]> {
    const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, role, created_at")
        .order("created_at");

    assertOk(error);

    return (data as ProfileRow[] | null)?.map(toStaffMember) ?? [];
}

/**
 * Modifie le rôle d'un compte.
 * Seul un admin y parvient : la politique RLS bloque les autres, et un trigger
 * empêche de retirer le rôle au dernier administrateur.
 */
export async function updateUserRole(
    id: string,
    role: UserRole,
): Promise<void> {
    const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", id);

    assertOk(error);
}

/** Met à jour son propre nom affiché. */
export async function updateOwnName(
    id: string,
    fullName: string,
): Promise<void> {
    const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName.trim() || null })
        .eq("id", id);

    assertOk(error);
}

/**
 * Appelle l'Edge Function `manage-users`.
 *
 * Inviter et supprimer un compte exigent la clé `service_role`, qui ne doit
 * jamais se trouver dans un bundle navigateur. La fonction s'exécute côté
 * Supabase, vérifie que l'appelant est bien administrateur, et n'expose que ces
 * deux opérations.
 */
async function callUserFunction<T>(
    action: "invite" | "delete",
    payload: Record<string, unknown>,
): Promise<T> {
    const { data, error } = await supabase.functions.invoke("manage-users", {
        body: { action, ...payload },
    });

    if (error) {
        // Le corps de la réponse porte un message plus précis que l'erreur
        // générique « non-2xx status code » remontée par le client.
        const context = (error as { context?: Response }).context;

        if (context) {
            const body = await context
                .clone()
                .json()
                .catch(() => null);

            if (body && typeof body.error === "string") {
                throw new Error(body.error);
            }
        }

        throw new Error(describeError(error as Error));
    }

    return data as T;
}

export async function inviteUser(
    email: string,
    role: UserRole,
    fullName: string,
): Promise<void> {
    await callUserFunction("invite", {
        email: email.trim().toLowerCase(),
        role,
        fullName: fullName.trim(),
        redirectTo: `${window.location.origin}/admin/mot-de-passe`,
    });
}

export async function deleteUser(id: string): Promise<void> {
    await callUserFunction("delete", { userId: id });
}
