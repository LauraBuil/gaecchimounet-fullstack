const baseUrl = (process.argv[2] || "").replace(/\/$/, "");

if (!baseUrl.startsWith("https://")) {
    throw new Error("Indiquez l’adresse HTTPS du site à vérifier.");
}

const routes = [
    "/",
    "/galerie",
    "/recettes",
    "/recettes/omelette-blettes-herbes-fraiches",
    "/produits",
    "/contact",
    "/mentions-legales",
    "/politique-de-confidentialite",
    "/admin/connexion",
];

for (const route of routes) {
    const response = await fetch(`${baseUrl}${route}`, { redirect: "error" });
    const html = await response.text();

    if (!response.ok) {
        throw new Error(`${route} répond avec le statut ${response.status}.`);
    }

    if (!response.headers.get("content-type")?.includes("text/html")) {
        throw new Error(`${route} ne renvoie pas une page HTML.`);
    }

    if (!html.includes('id="root"')) {
        throw new Error(`${route} ne contient pas le point de montage de l’application.`);
    }
}

const imageResponse = await fetch(
    `${baseUrl}/img/recipes/omelette-blettes-herbes-fraiches.webp?v=1`,
);

if (!imageResponse.ok) {
    throw new Error(`L’image témoin répond avec le statut ${imageResponse.status}.`);
}

if (imageResponse.headers.get("content-type") !== "image/webp") {
    throw new Error("L’image témoin n’est pas servie au format WebP.");
}

const cacheControl = imageResponse.headers.get("cache-control") || "";

if (!cacheControl.includes("max-age=31536000")) {
    throw new Error("Le cache longue durée des images n’est pas actif.");
}

console.log(
    `Test réussi sur ${baseUrl} : ${routes.length} pages et l’image témoin sont accessibles.`,
);
