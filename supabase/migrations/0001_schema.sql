-- ============================================================================
-- GAEC Chimounet — Schéma initial
-- ============================================================================
-- À exécuter dans le SQL Editor de Supabase (Dashboard > SQL Editor > New query).
-- Ce fichier est idempotent : on peut le relancer sans casser une base existante.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Types énumérés
-- ----------------------------------------------------------------------------

-- Rôles applicatifs.
--   admin      : gestion des comptes utilisateurs, en plus de tout le contenu.
--   exploitant : gestion complète du contenu (recettes, photos, produits,
--                points de distribution), mais pas des comptes.
do $$
begin
    if not exists (select 1 from pg_type where typname = 'user_role') then
        create type public.user_role as enum ('admin', 'exploitant');
    end if;
end
$$;

-- Saisons, partagées par les recettes et les produits.
do $$
begin
    if not exists (select 1 from pg_type where typname = 'season') then
        create type public.season as enum ('spring', 'summer', 'autumn', 'winter');
    end if;
end
$$;

-- ----------------------------------------------------------------------------
-- Fonction utilitaire : mise à jour automatique de updated_at
-- ----------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- profiles — extension de auth.users avec le rôle applicatif
-- ----------------------------------------------------------------------------
-- On ne stocke JAMAIS le rôle dans les métadonnées de auth.users : celles-ci
-- sont modifiables par l'utilisateur lui-même, ce qui permettrait à un
-- exploitant de s'auto-promouvoir administrateur. Une table à part, protégée
-- par RLS, est la seule source de vérité.

create table if not exists public.profiles (
    id          uuid primary key references auth.users (id) on delete cascade,
    email       text        not null,
    full_name   text,
    role        public.user_role not null default 'exploitant',
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
    before update on public.profiles
    for each row execute function public.touch_updated_at();

-- Création automatique du profil à l'inscription.
-- Le tout premier compte créé devient administrateur : cela permet d'amorcer
-- le système sans avoir à bricoler la base à la main. Tous les suivants sont
-- exploitants par défaut, un admin pouvant ensuite les promouvoir.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    assigned_role public.user_role;
begin
    if exists (select 1 from public.profiles) then
        assigned_role := 'exploitant';
    else
        assigned_role := 'admin';
    end if;

    insert into public.profiles (id, email, full_name, role)
    values (
        new.id,
        new.email,
        nullif(new.raw_user_meta_data ->> 'full_name', ''),
        assigned_role
    )
    on conflict (id) do nothing;

    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Fonctions de rôle (SECURITY DEFINER)
-- ----------------------------------------------------------------------------
-- Ces fonctions contournent RLS pour lire le rôle de l'appelant. Sans cela,
-- une politique sur `profiles` qui interroge `profiles` provoquerait une
-- récursion infinie. `stable` permet à Postgres de ne les évaluer qu'une fois
-- par requête.

create or replace function public.auth_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
    select role from public.profiles where id = auth.uid();
$$;

-- Peut gérer le contenu : recettes, photos, produits, points de distribution.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select public.auth_role() in ('admin', 'exploitant');
$$;

-- Peut gérer les comptes utilisateurs.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select public.auth_role() = 'admin';
$$;

-- ----------------------------------------------------------------------------
-- recipes — recettes
-- ----------------------------------------------------------------------------

create table if not exists public.recipes (
    id                            uuid primary key default gen_random_uuid(),
    title                         text        not null,
    slug                          text        not null unique,
    summary                       text        not null default '',
    category                      text        not null default '',
    season                        public.season not null,
    preparation_time_in_minutes   integer     not null default 0 check (preparation_time_in_minutes >= 0),
    cooking_time_in_minutes       integer     not null default 0 check (cooking_time_in_minutes >= 0),
    servings                      integer     not null default 4 check (servings > 0),
    -- Chemin dans le bucket Storage `medias` (ex. « recipes/salade-kale.webp »),
    -- pas une URL complète : l'URL publique se reconstruit côté client, ce qui
    -- évite de figer le domaine Supabase en base.
    image_path                    text,
    image_alt                     text        not null default '',
    tips                          text,
    is_published                  boolean     not null default true,
    position                      integer     not null default 0,
    created_at                    timestamptz not null default now(),
    updated_at                    timestamptz not null default now()
);

-- durationInMinutes du front était la somme préparation + cuisson : on la
-- calcule ici plutôt que de la stocker, pour qu'elle ne puisse pas diverger.
alter table public.recipes
    drop column if exists duration_in_minutes;
alter table public.recipes
    add column duration_in_minutes integer
    generated always as (preparation_time_in_minutes + cooking_time_in_minutes) stored;

create index if not exists recipes_published_position_idx
    on public.recipes (is_published, position, created_at desc);

drop trigger if exists recipes_touch_updated_at on public.recipes;
create trigger recipes_touch_updated_at
    before update on public.recipes
    for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- recipe_ingredients / recipe_steps
-- ----------------------------------------------------------------------------
-- `on delete cascade` : supprimer une recette emporte ses ingrédients et ses
-- étapes, sans laisser de lignes orphelines.

create table if not exists public.recipe_ingredients (
    id        uuid primary key default gen_random_uuid(),
    recipe_id uuid    not null references public.recipes (id) on delete cascade,
    quantity  text    not null default '',
    name      text    not null,
    position  integer not null default 0
);

create index if not exists recipe_ingredients_recipe_idx
    on public.recipe_ingredients (recipe_id, position);

create table if not exists public.recipe_steps (
    id          uuid primary key default gen_random_uuid(),
    recipe_id   uuid    not null references public.recipes (id) on delete cascade,
    description text    not null,
    position    integer not null default 0
);

create index if not exists recipe_steps_recipe_idx
    on public.recipe_steps (recipe_id, position);

-- ----------------------------------------------------------------------------
-- products — catalogue de légumes
-- ----------------------------------------------------------------------------

create table if not exists public.products (
    id           uuid primary key default gen_random_uuid(),
    name         text        not null,
    slug         text        not null unique,
    subtitle     text        not null default '',
    image_path   text,
    image_alt    text        not null default '',
    seasons      public.season[] not null default '{}',
    is_published boolean     not null default true,
    position     integer     not null default 0,
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now()
);

create index if not exists products_published_position_idx
    on public.products (is_published, position);

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
    before update on public.products
    for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- gallery_images — galerie photos
-- ----------------------------------------------------------------------------

create table if not exists public.gallery_images (
    id           uuid primary key default gen_random_uuid(),
    storage_path text        not null unique,
    alt          text        not null default '',
    is_published boolean     not null default true,
    position     integer     not null default 0,
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now()
);

create index if not exists gallery_images_published_position_idx
    on public.gallery_images (is_published, position);

drop trigger if exists gallery_images_touch_updated_at on public.gallery_images;
create trigger gallery_images_touch_updated_at
    before update on public.gallery_images
    for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- meeting_points — points de distribution (AMAP, marchés)
-- ----------------------------------------------------------------------------

create table if not exists public.meeting_points (
    id           uuid primary key default gen_random_uuid(),
    title        text        not null,
    schedule     text        not null default '',
    location     text        not null default '',
    is_published boolean     not null default true,
    position     integer     not null default 0,
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now()
);

create index if not exists meeting_points_published_position_idx
    on public.meeting_points (is_published, position);

drop trigger if exists meeting_points_touch_updated_at on public.meeting_points;
create trigger meeting_points_touch_updated_at
    before update on public.meeting_points
    for each row execute function public.touch_updated_at();
