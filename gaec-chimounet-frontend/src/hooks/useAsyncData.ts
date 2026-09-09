import { useCallback, useEffect, useRef, useState } from "react";

import { describeError } from "../api/errors";

type AsyncState<T> = {
    data: T | null;
    isLoading: boolean;
    error: string | null;
    reload: () => void;
};

/**
 * Charge une donnée asynchrone en suivant les états chargement / erreur.
 *
 * Le compteur `requestId` écarte les réponses obsolètes : sans lui, un
 * rechargement rapide pourrait voir la réponse de la requête précédente
 * arriver en dernier et écraser la plus récente.
 */
export function useAsyncData<T>(
    loader: () => Promise<T>,
    dependencies: unknown[] = [],
): AsyncState<T> {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);

    const requestId = useRef(0);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;

        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        const currentRequest = ++requestId.current;

        setIsLoading(true);
        setError(null);

        loader()
            .then((result) => {
                if (!isMounted.current || currentRequest !== requestId.current) {
                    return;
                }

                setData(result);
            })
            .catch((caught: unknown) => {
                if (!isMounted.current || currentRequest !== requestId.current) {
                    return;
                }

                setError(
                    describeError(
                        caught instanceof Error ? caught : new Error(String(caught)),
                    ),
                );
            })
            .finally(() => {
                if (!isMounted.current || currentRequest !== requestId.current) {
                    return;
                }

                setIsLoading(false);
            });
        // `loader` est recréé à chaque rendu par les appelants : on se fie aux
        // dépendances explicites plutôt qu'à son identité.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...dependencies, reloadToken]);

    const reload = useCallback(() => {
        setReloadToken((token) => token + 1);
    }, []);

    return { data, isLoading, error, reload };
}
