import { Link } from 'react-router'
import MailTo from '../adds/MailTo.tsx'
// import marmotte from '../../assets/img/bg_img/marmottefrancis_flickr.png'

export default function LegalMentions() {

    // <button id="scrollToTopButton">
    //     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
    //          classNameName="w-6 h-6">
    //         <path classNameName="svg-color" stroke-linecap="round" stroke-linejoin="round"
    //               d="M15 11.25l-3-3m0 0l-3 3m3-3v7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    //     </svg>
    // </button>
    // <script src="js/buttonup.js"></script>

    return (
        <section className="background-image-mentions">
            {/*<img className='' src={marmotte} alt='image de marmotte dans la montagne Pyrénéenne - Photographe Francis Buil'/>*/}
            <h1 className="h1para2-mentions background-color">Mentions légales</h1>
            <div className="backgroundleft backgroundright background-color padding">
                <p className="mention-legales text-mention"><span className="lettrine-mention">1.</span> Informations
                    générales<br/><br/>
                    Ce site web est la propriété de Gaec Chimounet, une entreprise enregistrée 54B rue des Pyrénées,
                    65200
                    TREBONS, numéro de SIRET 82516372800025 (ci-après dénommée "l'entreprise", "nous" ou "notre"). Ces
                    mentions
                    légales régissent votre utilisation de notre site web. En accédant à ce site et en l'utilisant, vous
                    acceptez d'être lié par les présentes mentions légales. Si vous n'acceptez pas ces conditions,
                    veuillez
                    ne
                    pas utiliser notre site.
                </p>

                <p className="mention-legales text-mention"><span className="lettrine-mention">2.</span> Collecte et utilisation
                    des informations<br/><br/>
                    Nous nous engageons à respecter la confidentialité de vos informations personnelles. Toutes les
                    informations
                    que vous nous fournissez seront traitées conformément à notre politique de confidentialité. Veuillez
                    consulter notre <Link to="/politique-de-confidentialite">politique de confidentialité</Link> pour plus de détails sur la collecte et l'utilisation
                    de
                    vos
                    données personnelles.
                </p>

                <p className="mention-legales text-mention"><span className="lettrine-mention">3.</span> Propriété
                    intellectuelle<br/><br/>
                    Tous les contenus présents sur ce site, tels que les textes, les graphiques, les logos, les images,
                    les
                    clips audio, les vidéos, les données, les interfaces utilisateur, les logiciels, les codes et autres
                    éléments, sont la propriété exclusive de l'entreprise ou sont utilisés avec la permission des
                    détenteurs
                    des
                    droits. Ils sont protégés par les lois nationales et internationales sur le droit d'auteur et les
                    autres
                    lois relatives à la propriété intellectuelle. Vous n'êtes pas autorisé à reproduire, distribuer,
                    afficher,
                    transmettre, modifier, créer des œuvres dérivées, vendre ou exploiter de quelque manière que ce soit
                    tout
                    contenu, en tout ou en partie, sans notre autorisation écrite préalable.
                </p>

                <p className="mention-legales text-mention"><span className="lettrine-mention">4.</span> Commandes de panier de
                    légumes<br/><br/>
                    Lorsque vous passez une commande pour un panier de légumes via notre site web, vous vous engagez à
                    venir
                    chercher votre commande au lieu de rendez-vous prévu, à la date et à l'heure spécifiées. En cas de
                    non-retrait de
                    votre commande, vous comprenez et acceptez que des frais de majoration financière puissent être
                    appliqués
                    pour compenser la perte de denrées alimentaires périssables.
                </p>

                <p className="mention-legales text-mention"><span className="lettrine-mention">5.</span> Limitation de
                    responsabilité<br/><br/>
                    Nous mettons tout en œuvre pour assurer l'exactitude et la fiabilité des informations présentes sur
                    notre
                    site web. Cependant, nous ne pouvons garantir l'absence d'erreurs, d'interruptions, de virus ou
                    d'autres
                    problèmes techniques. En conséquence, nous déclinons toute responsabilité pour tout préjudice
                    résultant
                    de
                    l'utilisation de ce site web.
                </p>

                <p className="mention-legales text-mention"><span className="lettrine-mention">6.</span> Modifications des
                    mentions légales<br/><br/>
                    Nous nous réservons le droit de modifier ces mentions légales à tout moment, sans préavis. Les
                    modifications
                    prendront effet dès leur publication sur notre site web. Il est de votre responsabilité de consulter
                    régulièrement cette page pour prendre connaissance des éventuelles modifications.
                </p>

                <p className="mention-legales text-mention"><span className="lettrine-mention">7.</span> Droit applicable et
                    juridiction compétente<br/><br/>
                    Ces mentions légales sont régies par les lois en vigueur dans votre pays. Tout litige découlant de
                    l'utilisation de ce site web sera soumis à la compétence exclusive des tribunaux de Tarbes.
                </p>

                <p className="mention-legales text-mention">Si vous avez des questions supplémentaires concernant nos
                    mentions légales,
                    veuillez nous contacter par mail à l'adresse suivante :
                    <MailTo email="gaecchimounet@gmail.com" className="mail" />.
                </p>
            </div>
        </section>
    )
}
