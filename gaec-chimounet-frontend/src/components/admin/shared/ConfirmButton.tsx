import { useEffect, useRef, useState } from "react";

type ConfirmButtonProps = {
    label: string;
    confirmLabel?: string;
    busyLabel?: string;
    onConfirm: () => void | Promise<void>;
    disabled?: boolean;
};

/**
 * Bouton d'action destructive à double détente.
 *
 * Le premier clic remplace le libellé par « Confirmer », le second déclenche
 * l'action. Préféré à `window.confirm`, qui bloque l'onglet et ne peut pas être
 * mis en forme, et à une vraie modale, superflue ici.
 */
export default function ConfirmButton({
    label,
    confirmLabel = "Confirmer",
    busyLabel = "Suppression…",
    onConfirm,
    disabled = false,
}: ConfirmButtonProps) {
    const [isArmed, setIsArmed] = useState(false);
    const [isBusy, setIsBusy] = useState(false);
    const timeoutRef = useRef<number | null>(null);

    // Se réarme tout seul : évite qu'un bouton reste en état « Confirmer »
    // après un clic accidentel, avec le risque d'une suppression au clic suivant.
    useEffect(() => {
        if (!isArmed) {
            return;
        }

        timeoutRef.current = window.setTimeout(() => setIsArmed(false), 5000);

        return () => {
            if (timeoutRef.current !== null) {
                window.clearTimeout(timeoutRef.current);
            }
        };
    }, [isArmed]);

    const handleClick = async () => {
        if (!isArmed) {
            setIsArmed(true);
            return;
        }

        setIsArmed(false);
        setIsBusy(true);

        try {
            await onConfirm();
        } finally {
            setIsBusy(false);
        }
    };

    return (
        <button
            type="button"
            className={[
                "admin-button",
                isArmed ? "admin-button--danger-armed" : "admin-button--danger",
            ].join(" ")}
            disabled={disabled || isBusy}
            onClick={() => void handleClick()}
        >
            {isBusy ? busyLabel : isArmed ? confirmLabel : label}
        </button>
    );
}
