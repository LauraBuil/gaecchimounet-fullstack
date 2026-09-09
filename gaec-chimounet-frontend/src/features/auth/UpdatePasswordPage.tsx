import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";

import { useAuth } from "./AuthContext";

const MIN_PASSWORD_LENGTH = 8;

/**
 * Écran de définition du mot de passe.
 *
 * Sert dans deux cas : après un lien d'invitation, et après un lien de
 * réinitialisation. Dans les deux cas Supabase a déjà ouvert une session à
 * l'arrivée sur la page (via le fragment de l'URL), il ne reste qu'à choisir un
 * mot de passe.
 */
export default function UpdatePasswordPage() {
    const { session, isLoading, updatePassword } = useAuth();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (password.length < MIN_PASSWORD_LENGTH) {
            setError(
                `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`,
            );
            return;
        }

        if (password !== confirmation) {
            setError("Les deux mots de passe ne correspondent pas.");
            return;
        }

        setIsSubmitting(true);

        try {
            await updatePassword(password);
            navigate("/admin", { replace: true });
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : String(caught));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="admin-splash">
                <p>Chargement…</p>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="auth-page">
                <div className="auth-card">
                    <h1 className="auth-card__title">Lien expiré</h1>

                    <p className="auth-card__description">
                        Ce lien de connexion n’est plus valable. Demandez un nouveau
                        lien depuis l’écran de connexion.
                    </p>

                    <Link className="button button--primary" to="/admin/connexion">
                        Retour à la connexion
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-card__title">Choisir un mot de passe</h1>

                <p className="auth-card__description">
                    Connecté en tant que {session.user.email}.
                </p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="admin-field">
                        <label htmlFor="new-password">Nouveau mot de passe</label>

                        <input
                            id="new-password"
                            type="password"
                            autoComplete="new-password"
                            required
                            minLength={MIN_PASSWORD_LENGTH}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />

                        <p className="admin-field__hint">
                            Au moins {MIN_PASSWORD_LENGTH} caractères.
                        </p>
                    </div>

                    <div className="admin-field">
                        <label htmlFor="confirm-password">Confirmation</label>

                        <input
                            id="confirm-password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={confirmation}
                            onChange={(event) => setConfirmation(event.target.value)}
                        />
                    </div>

                    {error && (
                        <p className="admin-alert admin-alert--error" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="button button--primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Enregistrement…" : "Enregistrer"}
                    </button>
                </form>
            </div>
        </div>
    );
}
