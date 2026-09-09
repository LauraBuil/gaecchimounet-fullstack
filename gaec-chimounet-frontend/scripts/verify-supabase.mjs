import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

const projectDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envFile = Object.fromEntries(
    (await readFile(resolve(projectDirectory, ".env"), "utf8"))
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .map((line) => {
            const separator = line.indexOf("=");
            return [line.slice(0, separator), line.slice(separator + 1)];
        }),
);

const url = process.env.SUPABASE_URL || envFile.VITE_SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY || envFile.VITE_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey) {
    throw new Error("VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont requis.");
}

const visitor = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
});

const { data: products, error: productsError } = await visitor
    .from("products")
    .select("id")
    .eq("is_published", true);
if (productsError) throw productsError;

const { data: gallery, error: galleryError } = await visitor
    .from("gallery_images")
    .select("storage_path")
    .eq("is_published", true);
if (galleryError) throw galleryError;

const { error: forbiddenPublicWrite } = await visitor.from("products").insert({
    name: "Interdit",
    slug: `interdit-${randomUUID()}`,
    seasons: [],
});
if (!forbiddenPublicWrite) throw new Error("Une écriture anonyme a été acceptée.");

if (gallery.length > 0) {
    const { data: publicMedia } = visitor.storage
        .from("medias")
        .getPublicUrl(gallery[0].storage_path);
    const mediaResponse = await fetch(publicMedia.publicUrl, { method: "HEAD" });
    if (!mediaResponse.ok) {
        throw new Error(`Un média public est inaccessible (${mediaResponse.status}).`);
    }
}

if (!serviceRoleKey) {
    console.log(
        `Connexion publique réussie : ${products.length} produits, ${gallery.length} photos, médias accessibles et écritures anonymes bloquées.`,
    );
    process.exit(0);
}

const admin = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
});
const { count: existingAdminCount, error: adminCountError } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");
if (adminCountError) throw adminCountError;

const suffix = randomUUID();
const email = `verification-${suffix}@example.test`;
const password = `Test-${suffix}-Aa1!`;

const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
});
if (createError) throw createError;

const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("role")
    .eq("id", created.user.id)
    .single();
if (profileError) throw profileError;
const expectedRole = existingAdminCount === 0 ? "admin" : "exploitant";
if (profile.role !== expectedRole) {
    throw new Error(`Rôle initial incorrect : ${profile.role} au lieu de ${expectedRole}.`);
}

const staff = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
});
const { error: signInError } = await staff.auth.signInWithPassword({ email, password });
if (signInError) throw signInError;

const slug = `verification-${suffix}`;
const { data: recipeId, error: recipeError } = await staff.rpc("save_recipe", {
    p_id: null,
    p_recipe: {
        title: "Recette de vérification",
        slug,
        season: "summer",
        summary: "",
        category: "Test",
        preparation_time_in_minutes: 5,
        cooking_time_in_minutes: 10,
        servings: 2,
        image_path: null,
        image_alt: "",
        tips: "",
        is_published: true,
        position: 0,
        ingredients: [{ quantity: "1", name: "ingrédient" }],
        steps: [{ description: "étape" }],
    },
});
if (recipeError) throw recipeError;

const { data: publicRecipe, error: publicReadError } = await visitor
    .from("recipes")
    .select("id")
    .eq("slug", slug)
    .single();
if (publicReadError) throw publicReadError;
if (publicRecipe.id !== recipeId) throw new Error("Lecture publique incohérente.");

const { error: cleanupError } = await admin.from("recipes").delete().eq("id", recipeId);
if (cleanupError) throw cleanupError;

if (expectedRole === "admin") {
    const { error: deleteLastAdminError } = await admin.auth.admin.deleteUser(created.user.id);
    if (!deleteLastAdminError) throw new Error("Le dernier administrateur a pu être supprimé.");
} else {
    const { error: deleteUserError } = await admin.auth.admin.deleteUser(created.user.id);
    if (deleteUserError) throw deleteUserError;
}

console.log("Vérification Supabase réussie : rôles, transaction et RLS sont actifs.");
