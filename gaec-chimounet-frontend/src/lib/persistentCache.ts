type StoredValue<T> = {
    expiresAt: number;
    data: T;
};

export function readPersistentCache<T>(key: string): T | undefined {
    try {
        const raw = window.localStorage.getItem(key);

        if (!raw) return undefined;

        const stored = JSON.parse(raw) as Partial<StoredValue<T>>;

        if (typeof stored.expiresAt !== "number" || stored.data === undefined) {
            window.localStorage.removeItem(key);
            return undefined;
        }

        if (stored.expiresAt <= Date.now()) {
            window.localStorage.removeItem(key);
            return undefined;
        }

        return stored.data;
    } catch {
        return undefined;
    }
}

export function writePersistentCache<T>(
    key: string,
    data: T,
    durationInMs: number,
): void {
    try {
        window.localStorage.setItem(
            key,
            JSON.stringify({
                expiresAt: Date.now() + durationInMs,
                data,
            } satisfies StoredValue<T>),
        );
    } catch {
        // Le cache reste une optimisation facultative. Le site fonctionne
        // normalement si le navigateur bloque ou sature le stockage local.
    }
}

export function removePersistentCache(...keys: string[]): void {
    try {
        keys.forEach((key) => window.localStorage.removeItem(key));
    } catch {
        // Rien à faire : la prochaine requête réseau fournira les données.
    }
}
