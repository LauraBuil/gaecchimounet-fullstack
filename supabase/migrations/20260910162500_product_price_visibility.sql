create table if not exists public.site_settings (
    id                  text primary key default 'global',
    show_product_prices boolean not null default true,
    updated_at          timestamptz not null default now(),
    constraint site_settings_singleton check (id = 'global')
);

insert into public.site_settings (id, show_product_prices)
values ('global', true)
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

drop policy if exists "site_settings: lecture publique" on public.site_settings;
create policy "site_settings: lecture publique"
    on public.site_settings for select
    to anon, authenticated
    using (true);

drop policy if exists "site_settings: mise a jour par le staff" on public.site_settings;
create policy "site_settings: mise a jour par le staff"
    on public.site_settings for update
    to authenticated
    using (public.is_staff())
    with check (public.is_staff());

drop trigger if exists site_settings_touch_updated_at on public.site_settings;
create trigger site_settings_touch_updated_at
    before update on public.site_settings
    for each row execute function public.touch_updated_at();

grant select on table public.site_settings to anon, authenticated;
grant update on table public.site_settings to authenticated;
grant select, insert, update, delete on table public.site_settings to service_role;
