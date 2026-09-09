import { Link } from "react-router";

export default function NotFoundPage() {
    return (
        <main className="section">
            <div className="container section-state">
                <p className="eyebrow eyebrow--dark">Erreur 404</p>
                <h1>Cette page n’existe pas</h1>
                <p>
                    L’adresse est peut-être incorrecte ou la page a été déplacée.
                </p>
                <Link className="button button--primary" to="/">
                    Revenir à l’accueil
                </Link>
            </div>
        </main>
    );
}
