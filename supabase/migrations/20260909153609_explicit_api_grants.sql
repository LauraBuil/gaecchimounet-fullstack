-- Les projets Supabase récents n'exposent plus automatiquement les nouvelles
-- tables au Data API. Les GRANT ouvrent uniquement les opérations utiles ; les
-- politiques RLS de 0002_rls.sql continuent de filtrer chaque ligne.

grant usage on schema public to anon, authenticated, service_role;

grant select on table
    public.recipes,
    public.recipe_ingredients,
    public.recipe_steps,
    public.products,
    public.gallery_images,
    public.meeting_points
to anon;

grant select, insert, update, delete on table
    public.recipes,
    public.recipe_ingredients,
    public.recipe_steps,
    public.products,
    public.gallery_images,
    public.meeting_points
to authenticated;

grant select, update on table public.profiles to authenticated;

grant select, insert, update, delete on all tables in schema public
to service_role;

-- Les fonctions SECURITY DEFINER sont fermées par défaut puis ouvertes au
-- strict nécessaire. Les fonctions de rôle vérifient toujours auth.uid().
revoke execute on all functions in schema public from public, anon, authenticated;

grant execute on function public.is_staff() to anon, authenticated;
grant execute on function public.auth_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.save_recipe(jsonb, uuid) to authenticated;

grant execute on all functions in schema public to service_role;

-- Les futurs objets restent privés tant qu'une migration ne les expose pas
-- explicitement.
alter default privileges for role postgres in schema public
    revoke select, insert, update, delete on tables from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
    revoke usage, select on sequences from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
    revoke execute on functions from public, anon, authenticated, service_role;
