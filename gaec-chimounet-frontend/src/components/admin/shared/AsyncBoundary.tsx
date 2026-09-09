import type { ReactNode } from "react";

type AsyncBoundaryProps = {
    isLoading: boolean;
    error: string | null;
    isEmpty?: boolean;
    emptyMessage?: ReactNode;
    onRetry?: () => void;
    children: ReactNode;
};

/** Affiche les états chargement / erreur / vide, ou le contenu. */
export default function AsyncBoundary({
    isLoading,
    error,
    isEmpty = false,
    emptyMessage = "Aucun élément pour le moment.",
    onRetry,
    children,
}: AsyncBoundaryProps) {
    if (isLoading) {
        return (
            <p className="admin-state" role="status">
                Chargement…
            </p>
        );
    }

    if (error) {
        return (
            <div className="admin-alert admin-alert--error" role="alert">
                <p>{error}</p>

                {onRetry && (
                    <button
                        type="button"
                        className="admin-button admin-button--ghost"
                        onClick={onRetry}
                    >
                        Réessayer
                    </button>
                )}
            </div>
        );
    }

    if (isEmpty) {
        return <p className="admin-state">{emptyMessage}</p>;
    }

    return <>{children}</>;
}
