-- Regroupe les cinq compteurs du tableau de bord dans un seul aller-retour
-- réseau. La fonction reste SECURITY INVOKER : les politiques RLS continuent
-- donc de filtrer les lignes selon l'utilisateur connecté.
create or replace function public.get_admin_dashboard_counts()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
    select jsonb_build_object(
        'recipes', jsonb_build_object(
            'total', (select count(*) from public.recipes),
            'drafts', (select count(*) from public.recipes where not is_published)
        ),
        'gallery', jsonb_build_object(
            'total', (select count(*) from public.gallery_images),
            'drafts', (select count(*) from public.gallery_images where not is_published)
        ),
        'products', jsonb_build_object(
            'total', (select count(*) from public.products),
            'drafts', (select count(*) from public.products where not is_published)
        ),
        'meetingPoints', jsonb_build_object(
            'total', (select count(*) from public.meeting_points),
            'drafts', (select count(*) from public.meeting_points where not is_published)
        ),
        'distributions', jsonb_build_object(
            'total', (select count(*) from public.distribution_dates),
            'drafts', (select count(*) from public.distribution_dates where not is_published)
        )
    );
$$;

revoke all on function public.get_admin_dashboard_counts() from public, anon;
grant execute on function public.get_admin_dashboard_counts() to authenticated, service_role;
