import { readFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(scriptDirectory, "..");

async function readEnvFile() {
    const contents = await readFile(resolve(projectDirectory, ".env"), "utf8");
    return Object.fromEntries(
        contents
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith("#") && line.includes("="))
            .map((line) => {
                const separator = line.indexOf("=");
                return [line.slice(0, separator), line.slice(separator + 1)];
            }),
    );
}

const fileEnv = await readEnvFile();
const supabaseUrl = process.env.SUPABASE_URL || fileEnv.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY || fileEnv.VITE_SUPABASE_ANON_KEY;
const adminEmail = process.env.SUPABASE_ADMIN_EMAIL;
const adminPassword = process.env.SUPABASE_ADMIN_PASSWORD;

if (!supabaseUrl || (!serviceRoleKey && !anonKey)) {
    throw new Error(
        "La configuration Supabase est incomplète dans le fichier .env.",
    );
}

if (!serviceRoleKey && (!adminEmail || !adminPassword)) {
    throw new Error(
        "Lancez npm run seed:supabase:login pour vous authentifier en tant qu’administrateur.",
    );
}

const usesAdminSession = !serviceRoleKey;
const supabase = createClient(supabaseUrl, serviceRoleKey || anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
});

if (usesAdminSession) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
    });

    if (error) throw new Error(`Connexion impossible : ${error.message}`);

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

    if (profileError) {
        throw new Error(`Profil administrateur inaccessible : ${profileError.message}`);
    }
    if (profile.role !== "admin") {
        throw new Error("Ce compte n’a pas le rôle administrateur.");
    }
}

async function readJson(name) {
    return JSON.parse(
        await readFile(resolve(scriptDirectory, "seed-data", name), "utf8"),
    );
}

function mimeType(filename) {
    const extension = filename.toLowerCase().split(".").pop();
    if (extension === "png") return "image/png";
    if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
    if (extension === "avif") return "image/avif";
    return "image/webp";
}

async function uploadImage(folder, filename) {
    const storagePath = `${folder}/initial/${basename(filename)}`;
    const candidates = [
        resolve(projectDirectory, "public", "img", "photos", filename),
        resolve(projectDirectory, "src", "assets", "img", "photos", filename),
    ];
    let bytes;

    for (const source of candidates) {
        try {
            bytes = await readFile(source);
            break;
        } catch (error) {
            if (error?.code !== "ENOENT") throw error;
        }
    }

    if (!bytes) {
        throw new Error(`Image source introuvable : ${filename}`);
    }

    const { error } = await supabase.storage.from("medias").upload(storagePath, bytes, {
        contentType: mimeType(filename),
        cacheControl: "31536000",
        upsert: true,
    });

    if (error) throw error;
    return storagePath;
}

try {
    const products = await readJson("products.json");
    for (const [position, product] of products.entries()) {
        const imagePath = await uploadImage("products", product.filename);
        const { error } = await supabase.from("products").upsert(
            {
                name: product.name,
                slug: product.slug,
                subtitle: product.subtitle,
                image_path: imagePath,
                image_alt: product.imageAlt,
                seasons: product.seasons,
                is_published: true,
                position,
            },
            { onConflict: "slug" },
        );
        if (error) throw error;
    }

    const gallery = await readJson("gallery.json");
    for (const [position, photo] of gallery.entries()) {
        const storagePath = await uploadImage("gallery", photo.filename);
        const { error } = await supabase.from("gallery_images").upsert(
            {
                storage_path: storagePath,
                alt: photo.alt,
                is_published: true,
                position,
            },
            { onConflict: "storage_path" },
        );
        if (error) throw error;
    }

    console.log(
        `Import terminé : ${products.length} produits et ${gallery.length} photos.`,
    );
} finally {
    if (usesAdminSession) {
        await supabase.auth.signOut({ scope: "local" });
    }
}
