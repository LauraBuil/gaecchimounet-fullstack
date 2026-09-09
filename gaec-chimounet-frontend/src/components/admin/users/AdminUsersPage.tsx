import { useState, type FormEvent } from "react";

import { describeError } from "../../../api/errors";
import {
    deleteUser,
    fetchStaffMembers,
    inviteUser,
    ROLE_DESCRIPTIONS,
    ROLE_LABELS,
    updateUserRole,
    type StaffMember,
    type UserRole,
} from "../../../api/users";
import { useAuth } from "../../../features/auth/AuthContext";
import { useAsyncData } from "../../../hooks/useAsyncData";
import AsyncBoundary from "../shared/AsyncBoundary";
import ConfirmButton from "../shared/ConfirmButton";

const ROLES: UserRole[] = ["admin", "exploitant"];

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export default function AdminUsersPage() {
    const { profile } = useAuth();
    const { data, isLoading, error, reload } = useAsyncData(fetchStaffMembers);

    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState<UserRole>("exploitant");
    const [inviteError, setInviteError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [isInviting, setIsInviting] = useState(false);

    const members = data ?? [];

    const adminCount = members.filter((member) => member.role === "admin").length;

    const handleInvite = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setInviteError(null);
        setNotice(null);
        setIsInviting(true);

        try {
            await inviteUser(email, role, fullName);

            setNotice(
                `Invitation envoyée à ${email.trim()}. La personne recevra un ` +
                    "e-mail pour choisir son mot de passe.",
            );
            setEmail("");
            setFullName("");
            setRole("exploitant");
            reload();
        } catch (caught) {
            setInviteError(describeError(caught as Error));
        } finally {
            setIsInviting(false);
        }
    };

    const handleRoleChange = async (member: StaffMember, nextRole: UserRole) => {
        setActionError(null);

        try {
            await updateUserRole(member.id, nextRole);
            reload();
        } catch (caught) {
            setActionError(describeError(caught as Error));
            // Recharge pour remettre le select sur la valeur réellement en base.
            reload();
        }
    };

    const handleDelete = async (member: StaffMember) => {
        setActionError(null);

        try {
            await deleteUser(member.id);
            reload();
        } catch (caught) {
            setActionError(describeError(caught as Error));
        }
    };

    return (
        <div className="admin-page">
            <header className="admin-page__header">
                <div>
                    <h1>Utilisateurs</h1>

                    <p className="admin-page__description">
                        Réservé aux administrateurs. {members.length} compte
                        {members.length > 1 ? "s" : ""} actif
                        {members.length > 1 ? "s" : ""}.
                    </p>
                </div>
            </header>

            <section className="admin-roles">
                {ROLES.map((currentRole) => (
                    <article key={currentRole} className="admin-roles__card">
                        <h2>{ROLE_LABELS[currentRole]}</h2>
                        <p>{ROLE_DESCRIPTIONS[currentRole]}</p>
                    </article>
                ))}
            </section>

            <form className="admin-form admin-form--inline" onSubmit={handleInvite}>
                <h2>Inviter une personne</h2>

                <p className="admin-form__description">
                    Un e-mail lui sera envoyé pour définir son mot de passe. Aucun mot
                    de passe ne transite par vous.
                </p>

                <div className="admin-field-row">
                    <div className="admin-field">
                        <label htmlFor="invite-email">Adresse e-mail</label>

                        <input
                            id="invite-email"
                            type="email"
                            required
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />
                    </div>

                    <div className="admin-field">
                        <label htmlFor="invite-name">Nom (optionnel)</label>

                        <input
                            id="invite-name"
                            type="text"
                            value={fullName}
                            onChange={(event) => setFullName(event.target.value)}
                        />
                    </div>

                    <div className="admin-field">
                        <label htmlFor="invite-role">Rôle</label>

                        <select
                            id="invite-role"
                            value={role}
                            onChange={(event) =>
                                setRole(event.target.value as UserRole)
                            }
                        >
                            {ROLES.map((currentRole) => (
                                <option key={currentRole} value={currentRole}>
                                    {ROLE_LABELS[currentRole]}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {inviteError && (
                    <p className="admin-alert admin-alert--error" role="alert">
                        {inviteError}
                    </p>
                )}

                {notice && (
                    <p className="admin-alert admin-alert--success" role="status">
                        {notice}
                    </p>
                )}

                <div className="admin-form__actions">
                    <button
                        type="submit"
                        className="button button--primary"
                        disabled={isInviting}
                    >
                        {isInviting ? "Envoi…" : "Envoyer l’invitation"}
                    </button>
                </div>
            </form>

            {actionError && (
                <p className="admin-alert admin-alert--error" role="alert">
                    {actionError}
                </p>
            )}

            <AsyncBoundary
                isLoading={isLoading}
                error={error}
                isEmpty={members.length === 0}
                emptyMessage="Aucun compte trouvé."
                onRetry={reload}
            >
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th scope="col">Compte</th>
                                <th scope="col">Rôle</th>
                                <th scope="col">Créé le</th>
                                <th scope="col">
                                    <span className="visually-hidden">Actions</span>
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {members.map((member) => {
                                const isSelf = member.id === profile?.id;

                                // Le dernier administrateur ne peut pas être
                                // rétrogradé : la base le refuserait, autant
                                // désactiver le contrôle plutôt que de laisser
                                // l'utilisateur découvrir l'erreur.
                                const isLastAdmin =
                                    member.role === "admin" && adminCount <= 1;

                                return (
                                    <tr key={member.id}>
                                        <td>
                                            <strong>
                                                {member.fullName || member.email}
                                            </strong>

                                            {member.fullName && (
                                                <span className="admin-table__sub">
                                                    {member.email}
                                                </span>
                                            )}

                                            {isSelf && (
                                                <span className="admin-badge">
                                                    Vous
                                                </span>
                                            )}
                                        </td>

                                        <td>
                                            <select
                                                aria-label={`Rôle de ${member.email}`}
                                                value={member.role}
                                                disabled={isLastAdmin}
                                                onChange={(event) =>
                                                    void handleRoleChange(
                                                        member,
                                                        event.target
                                                            .value as UserRole,
                                                    )
                                                }
                                            >
                                                {ROLES.map((currentRole) => (
                                                    <option
                                                        key={currentRole}
                                                        value={currentRole}
                                                    >
                                                        {ROLE_LABELS[currentRole]}
                                                    </option>
                                                ))}
                                            </select>

                                            {isLastAdmin && (
                                                <span className="admin-table__sub">
                                                    Dernier administrateur
                                                </span>
                                            )}
                                        </td>

                                        <td>{formatDate(member.createdAt)}</td>

                                        <td className="admin-table__actions">
                                            {isSelf ? (
                                                <span className="admin-table__sub">
                                                    —
                                                </span>
                                            ) : (
                                                <ConfirmButton
                                                    label="Supprimer"
                                                    onConfirm={() =>
                                                        handleDelete(member)
                                                    }
                                                    disabled={isLastAdmin}
                                                />
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </AsyncBoundary>
        </div>
    );
}
