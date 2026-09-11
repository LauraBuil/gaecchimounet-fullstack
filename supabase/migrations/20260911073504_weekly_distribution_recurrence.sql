alter table public.distribution_dates
    add column if not exists repeats_weekly boolean not null default false,
    add column if not exists recurrence_months smallint,
    add column if not exists excluded_dates date[] not null default '{}',
    add column if not exists recurrence_parent_id uuid
        references public.distribution_dates (id) on delete cascade;

alter table public.distribution_dates
    drop constraint if exists distribution_dates_recurrence_duration_check;

alter table public.distribution_dates
    add constraint distribution_dates_recurrence_duration_check check (
        (repeats_weekly and recurrence_months in (6, 12))
        or (not repeats_weekly and recurrence_months is null)
    );

-- Les occurrences créées avant l'ajout des règles restent en base pour que
-- l'ancienne version du site continue de fonctionner jusqu'à sa mise à jour.
-- La nouvelle interface les regroupe sous leur règle parente.
with parent as (
    select id
    from public.distribution_dates
    where distribution_date = date '2026-09-10'
      and location = 'Ferme Campagnolle à Laloubère'
)
update public.distribution_dates as occurrence
set recurrence_parent_id = parent.id
from parent
where occurrence.distribution_date > date '2026-09-10'
  and occurrence.distribution_date <= date '2026-12-17'
  and occurrence.location = 'Ferme Campagnolle à Laloubère'
  and extract(isodow from occurrence.distribution_date) = 4;

with parent as (
    select id
    from public.distribution_dates
    where distribution_date = date '2026-09-16'
      and location = 'Marché de Trébons'
)
update public.distribution_dates as occurrence
set recurrence_parent_id = parent.id
from parent
where occurrence.distribution_date > date '2026-09-16'
  and occurrence.distribution_date <= date '2026-12-16'
  and occurrence.location = 'Marché de Trébons'
  and extract(isodow from occurrence.distribution_date) = 3;

update public.distribution_dates
set repeats_weekly = true,
    recurrence_months = 6
where (distribution_date = date '2026-09-10'
       and location = 'Ferme Campagnolle à Laloubère')
   or (distribution_date = date '2026-09-16'
       and location = 'Marché de Trébons');
