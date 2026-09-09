import { Link } from "react-router";

import { fetchAllGalleryImages } from "../../api/gallery";
import { fetchAllMeetingPoints } from "../../api/meetingPoints";
import { fetchAllProducts } from "../../api/products";
import { fetchAllRecipes } from "../../api/recipes";
import { ROLE_DESCRIPTIONS } from "../../api/users";
import { useAuth } from "../../features/auth/AuthContext";
import { useAsyncData } from "../../hooks/useAsyncData";
import AsyncBoundary from "./shared/AsyncBoundary";

type Counts = {
    recipes: { total: number; drafts: number };
    gallery: { total: number; drafts: number };
    products: { total: number; drafts: number };
    meetingPoints: { total: number; drafts: number };
};

function summarize<T extends { isPublished: boolean }>(items: T[]) {
    return {
        total: items.length,
        drafts: items.filter((item) => !item.isPublished).length,
    };
}

async function loadCounts(): Promise<Counts> {
    // Les quatre lectures sont indépendantes : en parallèle, le tableau de bord
    // s'affiche au temps de la plus lente et non de leur somme.
    const [recipes, gallery, products, meetingPoints] = await Promise.all([
        fetchAllRecipes(),
        fetchAllGalleryImages(),
        fetchAllProducts(),
        fetchAllMeetingPoints(),
    ]);

    return {
        recipes: summarize(recipes),
        gallery: summarize(gallery),
        products: summarize(products),
        meetingPoints: summarize(meetingPoints),
    };
}

export default function AdminDashboard() {
    const { profile } = useAuth();
    const { data, isLoading, error, reload } = useAsyncData(loadCounts);

    const cards: {
        to: string;
        label: string;
        counts: { total: number; drafts: number } | undefined;
        unit: [string, string];
    }[] = [
        {
            to: "/admin/recettes",
            label: "Recettes",
            counts: data?.recipes,
            unit: ["recette", "recettes"],
        },
        {
            to: "/admin/galerie",
            label: "Galerie photos",
            counts: data?.gallery,
            unit: ["photo", "photos"],
        },
        {
            to: "/admin/produits",
            label: "Produits",
            counts: data?.products,
            unit: ["produit", "produits"],
        },
        {
            to: "/admin/points-de-distribution",
            label: "Points de distribution",
            counts: data?.meetingPoints,
            unit: ["point", "points"],
        },
    ];

    return (
        <div className="admin-page">
            <header className="admin-page__header">
                <div>
                    <h1>
                        Bonjour {profile?.fullName || profile?.email}
                    </h1>

                    <p className="admin-page__description">
                        {profile ? ROLE_DESCRIPTIONS[profile.role] : ""}
                    </p>
                </div>
            </header>

            <AsyncBoundary isLoading={isLoading} error={error} onRetry={reload}>
                <div className="admin-cards">
                    {cards.map((card) => (
                        <Link key={card.to} className="admin-card" to={card.to}>
                            <span className="admin-card__label">{card.label}</span>

                            <strong className="admin-card__value">
                                {card.counts?.total ?? 0}
                            </strong>

                            <span className="admin-card__unit">
                                {(card.counts?.total ?? 0) > 1
                                    ? card.unit[1]
                                    : card.unit[0]}

                                {(card.counts?.drafts ?? 0) > 0 && (
                                    <em>
                                        {" "}
                                        dont {card.counts?.drafts} non publié
                                        {(card.counts?.drafts ?? 0) > 1 ? "s" : ""}
                                    </em>
                                )}
                            </span>
                        </Link>
                    ))}
                </div>
            </AsyncBoundary>

            <section className="admin-help">
                <h2>Comment ça marche</h2>

                <ul>
                    <li>
                        Un contenu <strong>non publié</strong> reste invisible sur le
                        site : pratique pour préparer une recette avant de la mettre
                        en ligne.
                    </li>
                    <li>
                        L’<strong>ordre d’affichage</strong> se règle avec le champ
                        « Position » : la valeur la plus basse apparaît en premier.
                    </li>
                    <li>
                        Les photos sont mises en ligne telles quelles, sans
                        compression automatique. Envoyez-les de préférence en{" "}
                        <strong>WebP</strong> : à qualité équivalente le fichier
                        pèse environ deux fois moins, et le site se charge
                        d’autant plus vite.
                    </li>
                </ul>
            </section>
        </div>
    );
}
