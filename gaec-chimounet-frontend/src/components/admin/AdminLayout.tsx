import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";

import { fetchAllDistributionDates } from "../../api/distributions";
import { fetchAllGalleryImages } from "../../api/gallery";
import { fetchAllMeetingPoints } from "../../api/meetingPoints";
import { fetchAllProducts } from "../../api/products";
import { fetchAllRecipes } from "../../api/recipes";
import { fetchStaffMembers, ROLE_LABELS } from "../../api/users";
import logo from "../../assets/img/logos/logomainseul60px.webp";
import { useAuth } from "../../features/auth/AuthContext";
import { preloadQuery, type QueryLoader } from "../../lib/queryCache";

const NAV_ITEMS: {
    to: string;
    label: string;
    adminOnly?: boolean;
}[] = [
    { to: "/admin", label: "Tableau de bord" },
    { to: "/admin/recettes", label: "Recettes" },
    { to: "/admin/galerie", label: "Galerie photos" },
    { to: "/admin/produits", label: "Produits" },
    { to: "/admin/points-de-distribution", label: "Points de distribution" },
    { to: "/admin/distributions", label: "Calendrier des distributions" },
    { to: "/admin/utilisateurs", label: "Utilisateurs", adminOnly: true },
];

export default function AdminLayout() {
    const { profile, isAdmin, signOut } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate("/admin/connexion", { replace: true });
    };

    const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            const loaders: QueryLoader<unknown>[] = [
                fetchAllRecipes,
                fetchAllGalleryImages,
                fetchAllProducts,
                fetchAllMeetingPoints,
                fetchAllDistributionDates,
                ...(isAdmin ? [fetchStaffMembers] : []),
            ];

            void Promise.allSettled(loaders.map((loader) => preloadQuery(loader)));
        }, 250);

        return () => window.clearTimeout(timeout);
    }, [isAdmin]);

    return (
        <div className="admin-shell">
            <header className="admin-topbar">
                <button
                    type="button"
                    className="admin-topbar__toggle"
                    aria-expanded={isMenuOpen}
                    aria-controls="admin-navigation"
                    onClick={() => setIsMenuOpen((open) => !open)}
                >
                    {isMenuOpen ? "Fermer" : "Menu"}
                </button>

                <Link
                    className="admin-topbar__brand"
                    to="/"
                    aria-label="GAEC Chimounet, retourner au site"
                >
                    <img src={logo} alt="" aria-hidden="true" />
                    <span>Gaec Chimounet</span>
                </Link>

                <div className="admin-topbar__user">
                    {profile && (
                        <span className="admin-topbar__identity">
                            {profile.fullName || profile.email}

                            <span className="admin-badge">
                                <span className="admin-label--desktop">
                                    {ROLE_LABELS[profile.role]}
                                </span>

                                <span className="admin-label--mobile">
                                    {profile.role === "admin" ? "Admin" : "Exploitant"}
                                </span>
                            </span>
                        </span>
                    )}

                    <Link className="admin-topbar__site-link" to="/">
                        Voir le site
                    </Link>

                    <button
                        type="button"
                        className="admin-button admin-button--ghost"
                        onClick={() => void handleSignOut()}
                    >
                        <span className="admin-label--desktop">Se déconnecter</span>
                        <span className="admin-label--mobile">Déconnexion</span>
                    </button>
                </div>
            </header>

            <div className="admin-body">
                <nav
                    id="admin-navigation"
                    className={[
                        "admin-nav",
                        isMenuOpen ? "admin-nav--open" : "",
                    ]
                        .filter(Boolean)
                        .join(" ")}
                >
                    <ul>
                        {visibleItems.map((item) => (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    // `end` sur le tableau de bord seulement :
                                    // sans cela « /admin » resterait actif sur
                                    // toutes les sous-pages.
                                    end={item.to === "/admin"}
                                    className={({ isActive }) =>
                                        [
                                            "admin-nav__link",
                                            isActive ? "admin-nav__link--active" : "",
                                        ]
                                            .filter(Boolean)
                                            .join(" ")
                                    }
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <main className="admin-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
