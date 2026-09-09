import { Link } from 'react-router'
import logo from "../../assets/img/logos/logomainseul60px.webp";

export default function Footer() {
    return (
        <footer
            id="contact"
            className="footer"
        >
            <div className="container footer__grid">
                <div className="footer__brand">
                    <div className="footer__brand-heading">
                        <img
                            src={logo}
                            alt=""
                            aria-hidden="true"
                        />

                        <strong>GAEC Chimounet</strong>
                    </div>

                    <p>
                        Des légumes biologiques, locaux et de saison,
                        cultivés dans les Hautes-Pyrénées.
                    </p>
                </div>

                <div className="footer__column">
                    <strong>Nous contacter</strong>

                    <a href="tel:+33687728446">
                        06 87 72 84 46
                    </a>

                    <a href="mailto:gaecchimounet@gmail.com">
                        gaecchimounet@gmail.com
                    </a>

                    <address>
                        Hautes-Pyrénées
                        <br />
                        France
                    </address>
                </div>
            </div>

            <div className="container footer__bottom">
        <span>
          © {new Date().getFullYear()} GAEC Chimounet - App web conçue et développée par Laura Buil
        </span>

                <div>
                    <Link to="/mentions-legales">Mentions légales</Link>
                    {" · "}
                    <Link to="/politique-de-confidentialite">
                        Politique de confidentialité
                    </Link>
                </div>
            </div>
        </footer>
    );
}
