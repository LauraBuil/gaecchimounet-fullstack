-- ============================================================================
-- GAEC Chimounet — Bucket Storage pour les photos
-- ============================================================================
-- Un seul bucket public, organisé par préfixes :
--   gallery/   photos de la galerie
--   recipes/   visuels des recettes
--   products/  visuels des produits
--
-- Le bucket est public en LECTURE (les photos doivent s'afficher pour les
-- visiteurs, et le CDN Supabase ne met en cache que les objets publics).
-- L'écriture reste réservée au staff via les politiques ci-dessous.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'medias',
    'medias',
    true,
    10485760, -- 10 Mo par fichier : large pour une photo, assez bas pour
              -- éviter qu'un envoi accidentel de RAW sature le quota.
    array['image/webp', 'image/jpeg', 'image/png', 'image/avif']
)
on conflict (id) do update
set public             = excluded.public,
    file_size_limit    = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- ----------------------------------------------------------------------------
-- Politiques d'accès aux objets
-- ----------------------------------------------------------------------------

-- Lecture : tout le monde, y compris les visiteurs non connectés.
drop policy if exists "medias: lecture publique" on storage.objects;
create policy "medias: lecture publique"
    on storage.objects for select
    to anon, authenticated
    using (bucket_id = 'medias');

-- Envoi : staff uniquement, et seulement dans les trois dossiers prévus.
-- Sans cette contrainte de préfixe, le bucket se transformerait vite en
-- fourre-tout impossible à ranger.
drop policy if exists "medias: envoi par le staff" on storage.objects;
create policy "medias: envoi par le staff"
    on storage.objects for insert
    to authenticated
    with check (
        bucket_id = 'medias'
        and public.is_staff()
        and (storage.foldername(name))[1] in ('gallery', 'recipes', 'products')
    );

drop policy if exists "medias: remplacement par le staff" on storage.objects;
create policy "medias: remplacement par le staff"
    on storage.objects for update
    to authenticated
    using (bucket_id = 'medias' and public.is_staff())
    with check (bucket_id = 'medias' and public.is_staff());

drop policy if exists "medias: suppression par le staff" on storage.objects;
create policy "medias: suppression par le staff"
    on storage.objects for delete
    to authenticated
    using (bucket_id = 'medias' and public.is_staff());
