// Images
import logoBalf from "../../assets/img/logos/logo-balf.png";
import logoOignon from "../../assets/img/logos/logooignon_1.png";
import logoBio from "../../assets/img/logos/logobio_1.png";
import heroImage from "../../assets/img/bg_img/DSC045421.webp";

const certifications = [
    {
        src: logoBio,
        alt: "Logo Agriculture Biologique",
        className: "hero__certification-image--bio",
    },
    {
        src: logoOignon,
        alt: "Logo de l’Oignon de Trébons",
        className: "hero__certification-image--oignon",
    },
    {
        src: logoBalf,
        alt: "Logo Bienvenue à la Ferme",
        className: "hero__certification-image--balf",
    },
];

export default function Hero() {
    return (
        <section id="accueil" className="hero">
            <img
                className="hero__background"
                src={heroImage}
                alt=""
                aria-hidden="true"
            />

            <div className="hero__overlay" aria-hidden="true" />

            <div className="container hero__content">
                <div className="hero__copy">
                    <p className="eyebrow">Production biologique et locale</p>

                    <h1 className="hero__title">
                        Des légumes bio,
                        <br />
                        et de saison.
                    </h1>

                    <p className="hero__description">
                        Le GAEC Chimounet est une exploitation familiale des
                        Hautes-Pyrénées. Nous cultivons en pleine terre des légumes
                        biologiques, locaux et de saison, dans le respect des sols et de la
                        biodiversité.
                    </p>

                    <p className="hero__description hero__description--secondary">
                        Labellisés Agriculture Biologique et membres du réseau Bienvenue à
                        la Ferme, nous privilégions une production à taille humaine,
                        enracinée dans notre terroir.
                    </p>

                    <div className="hero__actions">
                        <a className="button button--primary" href="#legumes">
                            Découvrir nos légumes
                        </a>

                        <a className="button button--light" href="#commander">
                            Comment commander
                        </a>
                    </div>
                </div>

                <aside className="hero__aside" aria-label="Labels et période de commande">
                    <div className="order-badge">
                        <strong>Commandez</strong>
                        <span>du vendredi</span>
                        <span>au mardi</span>
                    </div>

                    <div className="hero__certifications">
                        {certifications.map((certification) => (
                            <img
                                key={certification.alt}
                                className={`hero__certification-image ${certification.className}`}
                                src={certification.src}
                                alt={certification.alt}
                            />
                        ))}
                    </div>
                </aside>
            </div>
        </section>
    );
}