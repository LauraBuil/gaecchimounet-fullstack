export type QueryLoader<T> = () => Promise<T>;

type CacheEntry = {
    data: unknown;
    expiresAt: number;
};

// Les données publiques changent peu et toutes les mutations du back-office
// invalident explicitement ce cache. Cinq minutes rendent les retours entre
// pages instantanés sans masquer une modification enregistrée.
const CACHE_DURATION_IN_MS = 5 * 60_000;
const cache = new Map<QueryLoader<unknown>, CacheEntry>();
const pending = new Map<QueryLoader<unknown>, Promise<unknown>>();
let cacheGeneration = 0;

export function readCachedQuery<T>(loader: QueryLoader<T>): T | undefined {
    const entry = cache.get(loader as QueryLoader<unknown>);

    if (!entry || entry.expiresAt <= Date.now()) {
        if (entry) {
            cache.delete(loader as QueryLoader<unknown>);
        }

        return undefined;
    }

    return entry.data as T;
}

export function runCachedQuery<T>(
    loader: QueryLoader<T>,
    force = false,
): Promise<T> {
    if (!force) {
        const cached = readCachedQuery(loader);

        if (cached !== undefined) {
            return Promise.resolve(cached);
        }

        const current = pending.get(loader as QueryLoader<unknown>);

        if (current) {
            return current as Promise<T>;
        }
    }

    const requestGeneration = cacheGeneration;
    const request = loader()
        .then((data) => {
            if (requestGeneration === cacheGeneration) {
                cache.set(loader as QueryLoader<unknown>, {
                    data,
                    expiresAt: Date.now() + CACHE_DURATION_IN_MS,
                });
            }

            return data;
        })
        .finally(() => {
            if (pending.get(loader as QueryLoader<unknown>) === request) {
                pending.delete(loader as QueryLoader<unknown>);
            }
        });

    pending.set(loader as QueryLoader<unknown>, request);
    return request;
}

export function preloadQuery<T>(loader: QueryLoader<T>): Promise<T> {
    return runCachedQuery(loader);
}

export function invalidateAllQueries(): void {
    cacheGeneration += 1;
    cache.clear();
    pending.clear();
}
