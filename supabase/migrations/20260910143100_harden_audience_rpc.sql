-- Les fonctions exposées restent SECURITY INVOKER. Les opérations privilégiées
-- vivent dans le schéma privé, qui n'est pas publié par la Data API.
create or replace function private.collect_page_view(
    p_session_id uuid,
    p_path text,
    p_referrer_host text,
    p_device_type text,
    p_hostname text
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
    if lower(coalesce(p_hostname, '')) not in ('gaecchimounet.fr', 'www.gaecchimounet.fr') then return; end if;
    if p_session_id is null
        or p_path is null
        or char_length(p_path) not between 1 and 300
        or left(p_path, 1) <> '/'
        or (p_referrer_host is not null and char_length(p_referrer_host) not between 1 and 255)
        or p_device_type not in ('mobile', 'tablet', 'desktop')
    then return; end if;

    insert into private.page_views (session_id, path, referrer_host, device_type)
    values (p_session_id, p_path, nullif(lower(p_referrer_host), ''), p_device_type);

    if random() < 0.02 then
        delete from private.page_views where created_at < now() - interval '13 months';
    end if;
end;
$$;

revoke all on function private.collect_page_view(uuid, text, text, text, text) from public;
grant execute on function private.collect_page_view(uuid, text, text, text, text) to anon, authenticated;

create or replace function public.track_page_view(
    p_session_id uuid, p_path text, p_referrer_host text, p_device_type text, p_hostname text
)
returns void language sql volatile security invoker set search_path = ''
as $$ select private.collect_page_view(p_session_id, p_path, p_referrer_host, p_device_type, p_hostname); $$;

create or replace function private.read_audience_stats(p_days integer)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare
    v_days integer := greatest(1, least(coalesce(p_days, 30), 365));
    v_start timestamptz;
    v_result jsonb;
begin
    if not coalesce(public.is_staff(), false) then
        raise exception 'Accès réservé à l’équipe' using errcode = '42501';
    end if;
    v_start := date_trunc('day', now()) - make_interval(days => v_days - 1);
    select jsonb_build_object(
        'periodDays', v_days,
        'pageViews', (select count(*) from private.page_views where created_at >= v_start),
        'visitors', (select count(distinct session_id) from private.page_views where created_at >= v_start),
        'daily', coalesce((select jsonb_agg(jsonb_build_object('date', calendar.metric_day::date, 'views', coalesce(stats.views, 0), 'visitors', coalesce(stats.visitors, 0)) order by calendar.metric_day)
            from generate_series(date_trunc('day', v_start), date_trunc('day', now()), interval '1 day') as calendar(metric_day)
            left join (select date_trunc('day', created_at) as metric_day, count(*) as views, count(distinct session_id) as visitors from private.page_views where created_at >= v_start group by 1) stats on stats.metric_day = calendar.metric_day), '[]'::jsonb),
        'popularPages', coalesce((select jsonb_agg(jsonb_build_object('path', page.path, 'views', page.views) order by page.views desc) from (select path, count(*) views from private.page_views where created_at >= v_start group by path order by views desc limit 8) page), '[]'::jsonb),
        'devices', coalesce((select jsonb_agg(jsonb_build_object('type', device.device_type, 'views', device.views) order by device.views desc) from (select device_type, count(*) views from private.page_views where created_at >= v_start group by device_type) device), '[]'::jsonb)
    ) into v_result;
    return v_result;
end;
$$;

revoke all on function private.read_audience_stats(integer) from public;
grant execute on function private.read_audience_stats(integer) to authenticated, service_role;

create or replace function public.get_audience_stats(p_days integer default 30)
returns jsonb language sql stable security invoker set search_path = ''
as $$ select private.read_audience_stats(p_days); $$;
