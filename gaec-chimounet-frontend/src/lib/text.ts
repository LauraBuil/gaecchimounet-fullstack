/**
 * Retire les accents d'une chaîne.
 * `\p{M}` cible les marques combinantes laissées par la décomposition NFD.
 */
export function stripDiacritics(value: string): string {
    return value.normalize("NFD").replace(/\p{M}/gu, "");
}

/** Normalise pour une comparaison de recherche : sans accents, minuscules, rognée. */
export function normalizeText(value: string): string {
    return stripDiacritics(value).toLowerCase().trim();
}

/** Transforme un libellé en identifiant d'URL : « Salade de chou kale » -> « salade-de-chou-kale ». */
export function slugify(value: string): string {
    return normalizeText(value)
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
