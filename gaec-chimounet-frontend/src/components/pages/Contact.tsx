import {
    EnvelopeIcon,
    MapPinIcon,
    PhoneIcon,
} from "@heroicons/react/24/outline";
import MeetingPoints from '../components/MeetingPoints.tsx'

export default function Contact() {
    return (
        <div className="contact-page">
            <section className="contact-hero">
                <div className="container contact-hero__content">
                    <p className="eyebrow">Rencontrons-nous</p>

                    <h1 className="contact-hero__title">
                        Contact et points de vente
                    </h1>

                    <p className="contact-hero__description">
                        Une question sur nos légumes, nos disponibilités ou nos
                        lieux de distribution ? Nous sommes à votre écoute.
                    </p>
                </div>
            </section>

            <section className="section contact-section">
                <div className="container contact-section__layout">
                    <div className="contact-section__content">
                        <p className="eyebrow eyebrow--dark">
                            Nous contacter
                        </p>

                        <h2>Parlons de vos besoins</h2>

                        <p className="contact-section__introduction">
                            Vous pouvez nous contacter directement par téléphone
                            ou par e-mail. Nous vous répondrons dès que notre
                            travail sur l’exploitation nous le permet.
                        </p>

                        <div className="contact-details">
                            <article className="contact-card">
                                <span
                                    className="contact-card__icon"
                                    aria-hidden="true"
                                >
                                    <MapPinIcon />
                                </span>

                                <div>
                                    <h3>Adresse</h3>

                                    <address>
                                        54 B Rue des Pyrénées
                                        <br />
                                        65200 Trébons
                                    </address>
                                </div>
                            </article>

                            <a href="tel:+33687728446" className="contact-card clickable">
                                <span
                                    className="contact-card__icon"
                                    aria-hidden="true"
                                >
                                    <PhoneIcon />
                                </span>

                                <div>
                                    <h3>Téléphone</h3>

                                    <div>
                                        06 87 72 84 46
                                    </div>
                                </div>
                            </a>

                            <a href="mailto:gaecchimounet@gmail.com" className="contact-card clickable">
                                <span
                                    className="contact-card__icon"
                                    aria-hidden="true"
                                >
                                    <EnvelopeIcon />
                                </span>

                                <div>
                                    <h3>E-mail</h3>

                                    <div>
                                        gaecchimounet@gmail.com
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>

                    <aside className="contact-highlight">
                        <span className="contact-highlight__label">
                            GAEC Chimounet
                        </span>

                        <h2>Des légumes bio au plus près de chez vous</h2>

                        <p>
                            Nous privilégions la vente directe et les circuits
                            courts pour vous proposer des légumes frais,
                            récoltés au rythme des saisons.
                        </p>

                        <a
                            className="button button--primary"
                            href="mailto:gaecchimounet@gmail.com"
                        >
                            Nous écrire
                        </a>
                    </aside>
                </div>
            </section>

            <section className="section about-section">
                <div className="container about-section__layout">
                    <div className="about-section__heading">
                        <p className="eyebrow eyebrow--dark">
                            À propos de nous
                        </p>

                        <h2>
                            Nous sommes
                            <br />
                            Christophe &amp; Aude
                        </h2>
                    </div>

                    <div className="about-section__content">
                        <p>
                            Toute la semaine, nous travaillons sur notre
                            exploitation pour produire des légumes bio et de
                            saison.
                        </p>

                        <p>
                            L’exploitation est en bio depuis 2005 et nous
                            l’avons reprise au courant de l’année 2020.
                        </p>

                        <blockquote>
                            Cultiver avec soin, respecter les saisons et rester
                            proches des personnes qui consomment nos produits.
                        </blockquote>
                    </div>
                </div>
            </section>

            <MeetingPoints />
        </div>
    );
}