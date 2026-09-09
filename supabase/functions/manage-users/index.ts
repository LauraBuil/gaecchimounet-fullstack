// ============================================================================
// Edge Function « manage-users »
// ============================================================================
// Inviter ou supprimer un compte exige la clé `service_role`, qui donne un
// accès total à la base. Elle ne peut donc pas vivre dans le bundle React :
// n'importe quel visiteur pourrait la lire dans les sources de la page.
//
// Cette fonction s'exécute chez Supabase. Elle :
//   1. identifie l'appelant à partir de son jeton de session ;
//   2. vérifie dans `profiles` qu'il est bien administrateur ;
//   3. n'expose que deux opérations : inviter, supprimer.
//
// Déploiement :  supabase functions deploy manage-users
// ============================================================================

import { createClient } from "jsr:@supabase/supabase-js@2";

type InvitePayload = {
    action: "invite";
    email: string;
    role: "admin" | "exploitant";
    fullName?: string;
};

type DeletePayload = {
    action: "delete";
    userId: string;
};

type Payload = InvitePayload | DeletePayload;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

// L'origine autorisée est configurable pour éviter un `*` permissif en
// production. Renseignez SITE_URL avec l'adresse du site (ex.
// https://gaec-chimounet.fr) via `supabase secrets set`.
const SITE_URL = Deno.env.get("SITE_URL") ?? "*";

const corsHeaders = {
    "Access-Control-Allow-Origin": SITE_URL,
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
};

function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}

Deno.serve(async (request: Request): Promise<Response> => {
    if (request.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (request.method !== "POST") {
        return json({ error: "Méthode non autorisée." }, 405);
    }

    const authorization = request.headers.get("Authorization");

    if (!authorization) {
        return json({ error: "Authentification requise." }, 401);
    }

    // Client « en tant que l'appelant » : sert uniquement à valider le jeton et
    // à lire le rôle. Il ne peut rien faire de plus que l'utilisateur lui-même.
    const callerClient = createClient(SUPABASE_URL, ANON_KEY, {
        global: { headers: { Authorization: authorization } },
    });

    const {
        data: { user },
        error: userError,
    } = await callerClient.auth.getUser();

    if (userError || !user) {
        return json({ error: "Session invalide ou expirée." }, 401);
    }

    const { data: profile, error: profileError } = await callerClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
        return json({ error: "Impossible de vérifier vos droits." }, 500);
    }

    if (profile?.role !== "admin") {
        return json(
            { error: "Seul un administrateur peut gérer les comptes." },
            403,
        );
    }

    let payload: Payload;

    try {
        const body: unknown = await request.json();

        if (!body || typeof body !== "object" || !("action" in body)) {
            return json({ error: "Requête invalide." }, 400);
        }

        payload = body as Payload;
    } catch {
        return json({ error: "Requête illisible." }, 400);
    }

    // Client privilégié : créé seulement après la vérification du rôle.
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    if (payload.action === "invite") {
        const email = typeof payload.email === "string"
            ? payload.email.trim().toLowerCase()
            : "";

        if (!email.includes("@")) {
            return json({ error: "Adresse e-mail invalide." }, 400);
        }

        if (payload.role !== "admin" && payload.role !== "exploitant") {
            return json({ error: "Rôle inconnu." }, 400);
        }

        const { data, error } = await adminClient.auth.admin.inviteUserByEmail(
            email,
            {
                data: {
                    full_name:
                        typeof payload.fullName === "string"
                            ? payload.fullName.trim()
                            : "",
                },
                redirectTo: SITE_URL === "*" ? undefined : `${SITE_URL}/admin/mot-de-passe`,
            },
        );

        if (error) {
            return json({ error: `Invitation impossible : ${error.message}` }, 400);
        }

        // Le trigger `handle_new_user` a créé le profil avec le rôle par défaut
        // « exploitant ». On applique le rôle demandé par-dessus.
        const { error: roleError } = await adminClient
            .from("profiles")
            .update({
                role: payload.role,
                full_name:
                    typeof payload.fullName === "string"
                        ? payload.fullName.trim() || null
                        : null,
            })
            .eq("id", data.user.id);

        if (roleError) {
            return json(
                {
                    error:
                        "Le compte a été créé mais son rôle n'a pas pu être " +
                        `appliqué : ${roleError.message}`,
                },
                500,
            );
        }

        return json({ id: data.user.id, email });
    }

    if (payload.action === "delete") {
        if (typeof payload.userId !== "string" || !payload.userId) {
            return json({ error: "Identifiant de compte manquant." }, 400);
        }

        if (payload.userId === user.id) {
            return json(
                { error: "Vous ne pouvez pas supprimer votre propre compte." },
                400,
            );
        }

        // La suppression du compte auth entraîne celle du profil par cascade.
        // Le trigger du profil protège toujours le dernier administrateur, et
        // l'opération reste atomique côté base.
        const { error } = await adminClient.auth.admin.deleteUser(payload.userId);

        if (error) {
            return json({ error: `Suppression impossible : ${error.message}` }, 400);
        }

        return json({ deleted: payload.userId });
    }

    return json({ error: "Action inconnue." }, 400);
});
