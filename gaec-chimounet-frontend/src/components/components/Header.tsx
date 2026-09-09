import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";

import logo from "../../assets/img/logos/logomainseul60px.webp";

const navigationItems = [
    {
        label: "Galerie",
        path: "/galerie",
    },
    {
        label: "Recettes",
        path: "/recettes",
    },
    {
        label: "Contact",
        path: "/contact",
    },
];

export default function Header() {
    const location = useLocation();

    const [menuOpen, setMenuOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleMenuToggle = () => {
        setIsAnimating(true);
        setMenuOpen((currentValue) => !currentValue);
    };

    const closeMenu = () => {
        if (!menuOpen) {
            return;
        }

        setIsAnimating(true);
        setMenuOpen(false);
    };

    const handleAnimationEnd = () => {
        setIsAnimating(false);
    };

    useEffect(() => {
        setMenuOpen(false);
        setIsAnimating(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!menuOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                closeMenu();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [menuOpen]);

    return (
        <header className="header">
            <div className="container header__inner">
                <Link
                    to="/"
                    className="header__logo"
                    aria-label="Gaec Chimounet, retour à l’accueil"
                    onClick={closeMenu}
                >
                    <img
                        className="header__logo-image"
                        src={logo}
                        alt=""
                        aria-hidden="true"
                    />

                    <span className="header__logo-text">
            Gaec Chimounet
          </span>
                </Link>

                <button
                    type="button"
                    className="menu-button"
                    aria-label={
                        menuOpen
                            ? "Fermer le menu de navigation"
                            : "Ouvrir le menu de navigation"
                    }
                    aria-expanded={menuOpen}
                    aria-controls="main-navigation"
                    onClick={handleMenuToggle}
                >
                    <span className="menu-button__line" />
                    <span className="menu-button__line" />
                    <span className="menu-button__line" />
                </button>

                <nav
                    id="main-navigation"
                    className={[
                        "nav",
                        menuOpen ? "nav--open" : "",
                        !menuOpen && isAnimating ? "nav--closing" : "",
                    ]
                        .filter(Boolean)
                        .join(" ")}
                    aria-label="Navigation principale"
                    onAnimationEnd={handleAnimationEnd}
                >
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `nav__link ${isActive ? "nav__link--active" : ""}`
                        }
                        onClick={closeMenu}
                    >
                        Accueil
                    </NavLink>

                    {navigationItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `nav__link ${isActive ? "nav__link--active" : ""}`
                            }
                            onClick={closeMenu}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </header>
    );
}
