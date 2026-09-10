import { Link } from "react-router";

import MailTo from "../adds/MailTo.tsx";

const sections = [
    ["Informations générales", <p>Ce site est édité par le GAEC Chimounet, situé au 54 B rue des Pyrénées, 65200 Trébons, et immatriculé sous le numéro SIRET 82516372800025. Son utilisation implique l’acceptation des présentes mentions légales.</p>],
    ["Données personnelles", <p>Les informations liées à l’utilisation du site sont traitées conformément à notre <Link to="/politique-de-confidentialite">politique de confidentialité</Link>, qui précise les données utilisées et les droits des visiteurs.</p>],
    ["Propriété intellectuelle", <p>Les textes, images, logos, vidéos, éléments graphiques et logiciels du site appartiennent au GAEC Chimounet ou sont utilisés avec l’autorisation de leurs auteurs. Toute reproduction ou exploitation nécessite une autorisation écrite préalable.</p>],
    ["Commandes de paniers", <p>Toute commande doit être retirée au lieu, à la date et à l’heure convenus. En cas de non-retrait, une majoration peut être appliquée afin de compenser la perte éventuelle de denrées périssables.</p>],
    ["Responsabilité", <p>Nous veillons à fournir des informations exactes et un site disponible. Des erreurs, interruptions ou incidents techniques peuvent toutefois survenir. Le GAEC Chimounet ne peut être tenu responsable des dommages résultant d’un usage inadapté du site.</p>],
    ["Mise à jour", <p>Ces mentions peuvent être modifiées pour tenir compte de l’évolution du site ou de la réglementation. La version publiée sur cette page est celle qui s’applique.</p>],
    ["Droit applicable", <p>Le site et les présentes mentions sont soumis au droit français. Tout litige relève des juridictions compétentes, notamment celles de Tarbes lorsque les règles applicables le permettent.</p>],
] as const;

export default function LegalMentions() {
    return (
        <main className="legal-page">
            <header className="legal-hero">
                <div className="container legal-hero__content">
                    <p className="eyebrow">Informations du site</p>
                    <h1>Mentions légales</h1>
                    <p className="legal-hero__intro">Les informations relatives à l’éditeur du site et aux conditions de son utilisation.</p>
                </div>
            </header>
            <div className="legal-content">
                <article className="container legal-document">
                    {sections.map(([title, content], index) => (
                        <section className="legal-section" key={title}>
                            <span className="legal-section__number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                            <div><h2>{title}</h2>{content}</div>
                        </section>
                    ))}
                    <p className="legal-contact">Une question concernant ces mentions ? Écrivez-nous à <MailTo email="gaecchimounet@gmail.com" className="mail" />.</p>
                </article>
            </div>
        </main>
    );
}
