create index if not exists distribution_dates_recurrence_parent_idx
    on public.distribution_dates (recurrence_parent_id)
    where recurrence_parent_id is not null;
