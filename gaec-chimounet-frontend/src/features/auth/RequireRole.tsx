import { Link, Navigate, Outlet, useLocation } from "react-router";

import { useAuth } from "./AuthContext";

type RequireRoleProps = {
    /** « staff » : admin ou exploitant. « admin » : administrateur seulement. */
    level: "staff" | "admin";
};

/**
 * Garde de route pour le back-office.
 *
 * À bien garder en tête : ce composant ne protège rien côté données. Il évite
 * simplement d'afficher des écrans inutilisables. La vraie protection est
 * assurée par les politiques RLS de Postgres, qui refuseraient les écritures
 * même si quelqu'un contournait cette garde.
 */
export default function RequireRole({ level }: RequireRoleProps) {
    const { session, isLoading, isStaff, isAdmin, signOut } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="admin-splash">
                <p>Chargement…</p>
            </div>
        );
    }

    if (!session) {
        // `state` permet de revenir sur la page demandée après connexion.
        return (
            <Navigate
                to="/admin/connexion"
                replace
                state={{ from: location.pathname }}
            />
        );
    }

    if (!isStaff) {
        return (
            <div className="admin-splash">
                <h1>Accès non autorisé</h1>

                <p>
                    Ce compte est connecté mais n’a aucun rôle attribué. Demandez à
                    un administrateur de vous accorder les droits « exploitant ».
                </p>

                <button
                    type="button"
                    className="button button--primary"
                    onClick={() => void signOut()}
                >
                    Se déconnecter
                </button>
            </div>
        );
    }

    if (level === "admin" && !isAdmin) {
        return (
            <div className="admin-splash">
                <h1>Réservé aux administrateurs</h1>

                <p>
                    La gestion des comptes utilisateurs est réservée aux
                    administrateurs. Vous pouvez en revanche gérer tout le contenu
                    du site.
                </p>

                <Link className="button button--primary" to="/admin">
                    Retour au tableau de bord
                </Link>
            </div>
        );
    }

    return <Outlet />;
}
