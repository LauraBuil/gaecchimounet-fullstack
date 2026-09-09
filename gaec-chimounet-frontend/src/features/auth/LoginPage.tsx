import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation } from "react-router";

import { useAuth } from "./AuthContext";

type LocationState = {
    from?: string;
};

export default function LoginPage() {
    const { session, isLoading, signIn, sendPasswordReset } = useAuth();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (isLoading) {
        return (
            <div className="admin-splash">
                <p>Chargement…</p>
            </div>
        );
    }

    if (session) {
        const from = (location.state as LocationState | null)?.from;

        return <Navigate to={from && from.startsWith("/admin") ? from : "/admin"} replace />;
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setNotice(null);
        setIsSubmitting(true);

        try {
            await signIn(email, password);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : String(caught));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePasswordReset = async () => {
        setError(null);
        setNotice(null);

        if (!email.trim()) {
            setError(
                "Renseignez d’abord votre adresse e-mail, puis relancez la réinitialisation.",
            );
            return;
        }

        try {
            await sendPasswordReset(email);
            setNotice(
                "Si un compte existe pour cette adresse, un lien de réinitialisation vient d’être envoyé.",
            );
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : String(caught));
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-card__title">Connexion</h1>

                <p className="auth-card__description">
                    Réservé à l’équipe du GAEC Chimounet.
                </p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="admin-field">
                        <label htmlFor="login-email">Adresse e-mail</label>

                        <input
                            id="login-email"
                            type="email"
                            autoComplete="username"
                            required
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />
                    </div>

                    <div className="admin-field">
                        <label htmlFor="login-password">Mot de passe</label>

                        <input
                            id="login-password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />
                    </div>

                    {error && (
                        <p className="admin-alert admin-alert--error" role="alert">
                            {error}
                        </p>
                    )}

                    {notice && (
                        <p className="admin-alert admin-alert--success" role="status">
                            {notice}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="button button--primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Connexion…" : "Se connecter"}
                    </button>
                </form>

                <button
                    type="button"
                    className="auth-card__link"
                    onClick={() => void handlePasswordReset()}
                >
                    Mot de passe oublié ?
                </button>

                <Link className="auth-card__back" to="/">
                    ← Retour au site
                </Link>
            </div>
        </div>
    );
}
