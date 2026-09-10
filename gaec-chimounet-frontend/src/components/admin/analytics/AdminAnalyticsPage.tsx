import { fetchAudienceStats, type AudienceStats } from "../../../api/analytics";
import { useAsyncData } from "../../../hooks/useAsyncData";
import AsyncBoundary from "../shared/AsyncBoundary";

const DEVICE_LABELS = { mobile: "Téléphone", tablet: "Tablette", desktop: "Ordinateur" };
const PAGE_LABELS: Record<string, string> = {
    "/": "Accueil", "/galerie": "Galerie", "/recettes": "Recettes",
    "/produits": "Produits", "/contact": "Contact",
    "/mentions-legales": "Mentions légales",
    "/politique-de-confidentialite": "Politique de confidentialité",
};

function formatDay(date: string): string {
    return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(`${date}T12:00:00`));
}

export default function AdminAnalyticsPage() {
    const { data, isLoading, error, reload } = useAsyncData<AudienceStats>(fetchAudienceStats);
    const maximum = Math.max(...(data?.daily.map((day) => day.views) ?? [0]), 1);
    const pagesPerVisitor = data?.visitors ? data.pageViews / data.visitors : 0;

    return (
        <div className="admin-page admin-analytics">
            <header className="admin-page__header"><div><h1>Statistiques de visites</h1><p className="admin-page__description">Les 30 derniers jours, sans publicité ni identification des visiteurs.</p></div><button type="button" className="admin-button admin-button--ghost" onClick={reload}>Actualiser</button></header>
            <AsyncBoundary isLoading={isLoading} error={error} onRetry={reload}>
                {data && <>
                    <div className="admin-analytics__metrics">
                        <article><span>Visiteurs</span><strong>{data.visitors}</strong><small>sessions anonymes</small></article>
                        <article><span>Pages vues</span><strong>{data.pageViews}</strong><small>consultations</small></article>
                        <article><span>Pages par visite</span><strong>{pagesPerVisitor.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}</strong><small>en moyenne</small></article>
                    </div>
                    <section className="admin-analytics__panel"><h2>Visites quotidiennes</h2><div className="admin-analytics__chart" role="img" aria-label="Nombre de pages vues chaque jour pendant les 30 derniers jours">{data.daily.map((day) => <div className="admin-analytics__bar-column" key={day.date} title={`${formatDay(day.date)} : ${day.views} page${day.views > 1 ? "s" : ""} vue${day.views > 1 ? "s" : ""}`}><span className="admin-analytics__bar-value">{day.views || ""}</span><span className="admin-analytics__bar" style={{ height: `${Math.max((day.views / maximum) * 100, day.views ? 5 : 1)}%` }} /></div>)}</div><p className="admin-analytics__axis"><span>Du {data.daily[0] ? formatDay(data.daily[0].date) : "–"}</span><span>au {data.daily.length ? formatDay(data.daily[data.daily.length - 1].date) : "–"}</span></p></section>
                    <div className="admin-analytics__columns">
                        <section className="admin-analytics__panel"><h2>Pages les plus consultées</h2>{data.popularPages.length ? <ol className="admin-analytics__ranking">{data.popularPages.map((page) => <li key={page.path}><span>{PAGE_LABELS[page.path] ?? page.path}</span><strong>{page.views}</strong></li>)}</ol> : <p className="admin-analytics__empty">Aucune visite enregistrée pour le moment.</p>}</section>
                        <section className="admin-analytics__panel"><h2>Appareils utilisés</h2>{data.devices.length ? <ul className="admin-analytics__ranking">{data.devices.map((device) => <li key={device.type}><span>{DEVICE_LABELS[device.type]}</span><strong>{device.views}</strong></li>)}</ul> : <p className="admin-analytics__empty">Aucune visite enregistrée pour le moment.</p>}</section>
                    </div>
                </>}
            </AsyncBoundary>
        </div>
    );
}
