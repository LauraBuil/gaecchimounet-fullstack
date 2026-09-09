-- ============================================================================
-- GAEC Chimounet — Row Level Security
-- ============================================================================
-- C'est ici que vivent réellement les permissions. Tout ce qui est caché dans
-- l'interface React n'est que du confort : un visiteur peut appeler l'API
-- Supabase directement avec la clé anonyme (elle est publique par nature, elle
-- est dans le bundle JS). Seules ces politiques empêchent une écriture non
-- autorisée.
--
-- Modèle retenu :
--   anon           -> lecture seule du contenu publié
--   exploitant     -> lecture + écriture complète sur le contenu
--   admin          -> idem, plus la gestion des comptes utilisateurs
-- ============================================================================

alter table public.profiles           enable row level security;
alter table public.recipes            enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.recipe_steps       enable row level security;
alter table public.products           enable row level security;
alter table public.gallery_images     enable row level security;
alter table public.meeting_points     enable row level security;

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------

drop policy if exists "profiles: lecture par le staff" on public.profiles;
create policy "profiles: lecture par le staff"
    on public.profiles for select
    to authenticated
    using (id = auth.uid() or public.is_staff());

-- Un utilisateur peut corriger son propre nom, mais PAS son rôle.
-- `with check` interdit que la ligne résultante porte un rôle différent de
-- celui d'origine : c'est ce qui bloque l'auto-promotion en admin.
drop policy if exists "profiles: mise a jour de son propre profil" on public.profiles;
create policy "profiles: mise a jour de son propre profil"
    on public.profiles for update
    to authenticated
    using (id = auth.uid())
    with check (id = auth.uid() and role = public.auth_role());

drop policy if exists "profiles: gestion complete par un admin" on public.profiles;
create policy "profiles: gestion complete par un admin"
    on public.profiles for all
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());

-- Filet de sécurité : empêche le dernier administrateur de se rétrograder ou
-- d'être rétrogradé, ce qui rendrait la gestion des comptes définitivement
-- inaccessible. Un trigger est nécessaire ici — une politique RLS ne peut pas
-- compter les autres lignes de façon fiable.
create or replace function public.prevent_last_admin_removal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    remaining_admins integer;
begin
    if tg_op = 'UPDATE' and old.role = 'admin' and new.role <> 'admin' then
        select count(*) into remaining_admins
        from public.profiles
        where role = 'admin' and id <> old.id;

        if remaining_admins = 0 then
            raise exception
                'Impossible de retirer le rôle administrateur : ce compte est le dernier administrateur.';
        end if;
    end if;

    if tg_op = 'DELETE' and old.role = 'admin' then
        select count(*) into remaining_admins
        from public.profiles
        where role = 'admin' and id <> old.id;

        if remaining_admins = 0 then
            raise exception
                'Impossible de supprimer le dernier compte administrateur.';
        end if;
    end if;

    return case tg_op when 'DELETE' then old else new end;
end;
$$;

drop trigger if exists profiles_protect_last_admin on public.profiles;
create trigger profiles_protect_last_admin
    before update or delete on public.profiles
    for each row execute function public.prevent_last_admin_removal();

-- ----------------------------------------------------------------------------
-- Contenu : un motif identique pour chaque table
-- ----------------------------------------------------------------------------
-- Lecture publique restreinte aux lignes publiées, écriture réservée au staff.
-- Le staff lit aussi les brouillons, d'où la politique de select séparée.

-- recipes ---------------------------------------------------------------------

drop policy if exists "recipes: lecture publique du publie" on public.recipes;
create policy "recipes: lecture publique du publie"
    on public.recipes for select
    to anon, authenticated
    using (is_published or public.is_staff());

drop policy if exists "recipes: ecriture par le staff" on public.recipes;
create policy "recipes: ecriture par le staff"
    on public.recipes for all
    to authenticated
    using (public.is_staff())
    with check (public.is_staff());

-- recipe_ingredients ----------------------------------------------------------
-- La visibilité suit celle de la recette parente : inutile d'exposer les
-- ingrédients d'un brouillon.

drop policy if exists "recipe_ingredients: lecture publique du publie" on public.recipe_ingredients;
create policy "recipe_ingredients: lecture publique du publie"
    on public.recipe_ingredients for select
    to anon, authenticated
    using (
        public.is_staff()
        or exists (
            select 1 from public.recipes r
            where r.id = recipe_id and r.is_published
        )
    );

drop policy if exists "recipe_ingredients: ecriture par le staff" on public.recipe_ingredients;
create policy "recipe_ingredients: ecriture par le staff"
    on public.recipe_ingredients for all
    to authenticated
    using (public.is_staff())
    with check (public.is_staff());

-- recipe_steps ----------------------------------------------------------------

drop policy if exists "recipe_steps: lecture publique du publie" on public.recipe_steps;
create policy "recipe_steps: lecture publique du publie"
    on public.recipe_steps for select
    to anon, authenticated
    using (
        public.is_staff()
        or exists (
            select 1 from public.recipes r
            where r.id = recipe_id and r.is_published
        )
    );

drop policy if exists "recipe_steps: ecriture par le staff" on public.recipe_steps;
create policy "recipe_steps: ecriture par le staff"
    on public.recipe_steps for all
    to authenticated
    using (public.is_staff())
    with check (public.is_staff());

-- products --------------------------------------------------------------------

drop policy if exists "products: lecture publique du publie" on public.products;
create policy "products: lecture publique du publie"
    on public.products for select
    to anon, authenticated
    using (is_published or public.is_staff());

drop policy if exists "products: ecriture par le staff" on public.products;
create policy "products: ecriture par le staff"
    on public.products for all
    to authenticated
    using (public.is_staff())
    with check (public.is_staff());

-- gallery_images --------------------------------------------------------------

drop policy if exists "gallery_images: lecture publique du publie" on public.gallery_images;
create policy "gallery_images: lecture publique du publie"
    on public.gallery_images for select
    to anon, authenticated
    using (is_published or public.is_staff());

drop policy if exists "gallery_images: ecriture par le staff" on public.gallery_images;
create policy "gallery_images: ecriture par le staff"
    on public.gallery_images for all
    to authenticated
    using (public.is_staff())
    with check (public.is_staff());

-- meeting_points --------------------------------------------------------------

drop policy if exists "meeting_points: lecture publique du publie" on public.meeting_points;
create policy "meeting_points: lecture publique du publie"
    on public.meeting_points for select
    to anon, authenticated
    using (is_published or public.is_staff());

drop policy if exists "meeting_points: ecriture par le staff" on public.meeting_points;
create policy "meeting_points: ecriture par le staff"
    on public.meeting_points for all
    to authenticated
    using (public.is_staff())
    with check (public.is_staff());
