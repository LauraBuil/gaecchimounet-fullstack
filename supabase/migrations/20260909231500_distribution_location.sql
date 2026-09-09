alter table public.distribution_dates
    add column if not exists location text not null default '';
