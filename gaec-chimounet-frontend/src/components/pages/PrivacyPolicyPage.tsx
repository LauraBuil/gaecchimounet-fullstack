import { useState } from "react";

import { isAudienceMeasurementDisabled, setAudienceMeasurementDisabled } from "../../lib/analytics";
import MailTo from "../adds/MailTo.tsx";

export default function PrivacyPolicyPage() {
    const [isDisabled, setIsDisabled] = useState(isAudienceMeasurementDisabled);
    const toggleMeasurement = () => {
        const nextValue = !isDisabled;
        setAudienceMeasurementDisabled(nextValue);
        setIsDisabled(nextValue);
    };

    const sections = [
        ["Responsable du traitement", <p>Le GAEC Chimounet, 54 B rue des Pyrénées, 65200 Trébons, est responsable des données traitées sur ce site. Vous pouvez nous écrire à <MailTo email="gaecchimounet@gmail.com" className="mail" />.</p>],
        ["Mesure de fréquentation", <div><p>Nous comptons les visites pour connaître les pages consultées et améliorer le site. Nous enregistrons le chemin de la page, le type d’appareil, le domaine du site d’origine lorsqu’il existe et un identifiant aléatoire limité à l’onglet ouvert. Nous ne stockons ni adresse IP, ni nom, ni adresse e-mail, ni profil publicitaire. Les données brutes sont supprimées après treize mois et ne sont accessibles qu’à l’équipe.</p><button type="button" className="button button--secondary legal-optout" onClick={toggleMeasurement}>{isDisabled ? "Réactiver la mesure d’audience" : "Refuser la mesure d’audience"}</button><p className="legal-optout__status" aria-live="polite">{isDisabled ? "La mesure d’audience est désactivée sur cet appareil." : "La mesure d’audience est actuellement active."}</p></div>],
        ["Consultation du site public", <p>Aucun formulaire ne collecte vos coordonnées sur ce site et aucun outil publicitaire n’est utilisé. Vous pouvez consulter les produits, recettes et photos sans créer de compte.</p>],
        ["Espace de gestion", <p>L’espace réservé à l’équipe utilise une adresse e-mail et un mot de passe pour authentifier les personnes autorisées. Supabase traite ces informations afin de sécuriser l’accès et maintenir la session. Elles sont supprimées lorsque le compte n’est plus nécessaire.</p>],
        ["Liens externes", <p>Les commandes sont réalisées sur Kuupanda. Lorsque vous suivez ce lien, vous quittez notre site et les données transmises relèvent de la politique de cette plateforme.</p>],
        ["Vos droits", <p>Vous pouvez demander l’accès, la rectification, l’effacement ou la limitation du traitement de vos données en nous contactant par e-mail. Vous pouvez également adresser une réclamation à la CNIL.</p>],
    ] as const;

    return (
        <main className="legal-page">
            <header className="legal-hero">
                <div className="container legal-hero__content">
                    <p className="eyebrow">Vos données</p>
                    <h1>Politique de confidentialité</h1>
                    <p className="legal-hero__intro">Nous limitons les informations collectées à ce qui est utile au fonctionnement et à l’amélioration du site.</p>
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
                    <p className="legal-contact">Pour exercer vos droits, écrivez-nous à <MailTo email="gaecchimounet@gmail.com" className="mail" />.</p>
                </article>
            </div>
        </main>
    );
}
