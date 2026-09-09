-- Dates ponctuelles affichées dans la carte « Prochaine distribution ».
create table if not exists public.distribution_dates (
    id                uuid primary key default gen_random_uuid(),
    distribution_date date        not null unique,
    is_published      boolean     not null default true,
    created_at        timestamptz not null default now(),
    updated_at        timestamptz not null default now()
);

create index if not exists distribution_dates_published_date_idx
    on public.distribution_dates (is_published, distribution_date);

drop trigger if exists distribution_dates_touch_updated_at
    on public.distribution_dates;
create trigger distribution_dates_touch_updated_at
    before update on public.distribution_dates
    for each row execute function public.touch_updated_at();

alter table public.distribution_dates enable row level security;

drop policy if exists "distribution_dates: lecture publique du publie"
    on public.distribution_dates;
create policy "distribution_dates: lecture publique du publie"
    on public.distribution_dates for select
    to anon, authenticated
    using (is_published or public.is_staff());

drop policy if exists "distribution_dates: ecriture par le staff"
    on public.distribution_dates;
create policy "distribution_dates: ecriture par le staff"
    on public.distribution_dates for all
    to authenticated
    using (public.is_staff())
    with check (public.is_staff());

grant select on table public.distribution_dates to anon;
grant select, insert, update, delete on table public.distribution_dates
    to authenticated;
grant select, insert, update, delete on table public.distribution_dates
    to service_role;
