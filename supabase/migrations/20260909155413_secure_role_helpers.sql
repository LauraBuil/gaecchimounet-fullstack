-- La lecture privilégiée du rôle vit dans un schéma non exposé au Data API.
-- Les fonctions publiques restent SECURITY INVOKER et ne révèlent qu'un rôle
-- ou un booléen concernant l'utilisateur courant.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

create or replace function private.auth_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
    select role
    from public.profiles
    where id = (select auth.uid());
$$;

revoke all on function private.auth_role() from public;
grant execute on function private.auth_role() to anon, authenticated, service_role;

create or replace function public.auth_role()
returns public.user_role
language sql
stable
security invoker
set search_path = ''
as $$
    select private.auth_role();
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
    select private.auth_role() in ('admin', 'exploitant');
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
    select private.auth_role() = 'admin';
$$;

alter function public.touch_updated_at() set search_path = public;

-- Évite de recalculer auth.uid() pour chaque profil parcouru.
drop policy if exists "profiles: lecture par le staff" on public.profiles;
create policy "profiles: lecture par le staff"
    on public.profiles for select
    to authenticated
    using (id = (select auth.uid()) or public.is_staff());

drop policy if exists "profiles: mise a jour de son propre profil" on public.profiles;
create policy "profiles: mise a jour de son propre profil"
    on public.profiles for update
    to authenticated
    using (id = (select auth.uid()))
    with check (
        id = (select auth.uid())
        and role = public.auth_role()
    );
