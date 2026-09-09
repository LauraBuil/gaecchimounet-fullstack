import MailTo from "../adds/MailTo.tsx";

export default function PrivacyPolicyPage() {
    return (
        <main className="background-image-mentions">
            <h1 className="h1para2-mentions background-color">
                Politique de confidentialité
            </h1>

            <div className="backgroundleft backgroundright background-color padding">
                <p className="mention-legales text-mention">
                    <span className="lettrine-mention">1.</span> Responsable du
                    traitement
                    <br />
                    <br />
                    Le GAEC Chimounet, situé 54 B rue des Pyrénées, 65200 Trébons,
                    est responsable des données traitées sur ce site. Pour toute
                    question, vous pouvez écrire à{" "}
                    <MailTo email="gaecchimounet@gmail.com" className="mail" />.
                </p>

                <p className="mention-legales text-mention">
                    <span className="lettrine-mention">2.</span> Visiteurs du site
                    <br />
                    <br />
                    Le site public ne contient ni formulaire de contact, ni outil
                    publicitaire, ni mesure d’audience. Nous ne demandons aucune
                    donnée personnelle pour consulter les produits, les recettes
                    ou la galerie.
                </p>

                <p className="mention-legales text-mention">
                    <span className="lettrine-mention">3.</span> Espace de gestion
                    <br />
                    <br />
                    L’espace réservé à l’équipe utilise une adresse e-mail et un
                    mot de passe pour authentifier les personnes autorisées. Ces
                    informations sont traitées par Supabase pour sécuriser l’accès
                    et maintenir la session. Elles sont conservées tant que le
                    compte reste nécessaire, puis supprimées par un administrateur.
                </p>

                <p className="mention-legales text-mention">
                    <span className="lettrine-mention">4.</span> Liens externes
                    <br />
                    <br />
                    Les commandes sont réalisées sur la plateforme Kuupanda. En
                    suivant ce lien, vous quittez ce site et les données transmises
                    relèvent alors de la politique de confidentialité de cette
                    plateforme.
                </p>

                <p className="mention-legales text-mention">
                    <span className="lettrine-mention">5.</span> Vos droits
                    <br />
                    <br />
                    Vous pouvez demander l’accès, la rectification ou la suppression
                    de vos données, ainsi que la limitation de leur traitement, en
                    nous contactant par e-mail. Vous pouvez également adresser une
                    réclamation à la CNIL.
                </p>
            </div>
        </main>
    );
}
