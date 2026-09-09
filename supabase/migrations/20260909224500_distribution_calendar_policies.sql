-- Sépare les opérations d’écriture pour éviter qu’une politique FOR ALL ne
-- soit aussi évaluée lors des lectures authentifiées.
drop policy if exists "distribution_dates: ecriture par le staff"
    on public.distribution_dates;

create policy "distribution_dates: creation par le staff"
    on public.distribution_dates for insert
    to authenticated
    with check (public.is_staff());

create policy "distribution_dates: modification par le staff"
    on public.distribution_dates for update
    to authenticated
    using (public.is_staff())
    with check (public.is_staff());

create policy "distribution_dates: suppression par le staff"
    on public.distribution_dates for delete
    to authenticated
    using (public.is_staff());
