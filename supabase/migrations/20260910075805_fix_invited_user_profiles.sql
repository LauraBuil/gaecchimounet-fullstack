-- GoTrue peut renseigner invited_at après l'insertion initiale dans auth.users.
-- Le déclencheur INSERT historique ne voit alors pas encore l'invitation.
drop trigger if exists on_auth_user_invited on auth.users;
create trigger on_auth_user_invited
    after update of invited_at on auth.users
    for each row
    when (old.invited_at is null and new.invited_at is not null)
    execute function public.handle_new_user();

-- Répare les invitations déjà acceptées qui n'ont pas obtenu de profil.
insert into public.profiles (id, email, full_name, role)
select
    users.id,
    users.email,
    nullif(users.raw_user_meta_data ->> 'full_name', ''),
    'exploitant'::public.user_role
from auth.users as users
where users.invited_at is not null
  and not exists (
      select 1
      from public.profiles as profiles
      where profiles.id = users.id
  )
on conflict (id) do nothing;
