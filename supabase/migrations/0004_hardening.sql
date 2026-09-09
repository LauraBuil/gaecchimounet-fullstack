-- Empêche une inscription publique accidentellement activée de créer un compte
-- exploitant. Le premier compte amorce l'application en tant qu'administrateur ;
-- les comptes suivants ne reçoivent un profil que s'ils viennent d'une invitation.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    assigned_role public.user_role;
begin
    if not exists (select 1 from public.profiles) then
        assigned_role := 'admin';
    elsif new.invited_at is not null then
        assigned_role := 'exploitant';
    else
        return new;
    end if;

    insert into public.profiles (id, email, full_name, role)
    values (
        new.id,
        new.email,
        nullif(new.raw_user_meta_data ->> 'full_name', ''),
        assigned_role
    )
    on conflict (id) do nothing;

    return new;
end;
$$;

-- Sauvegarde atomique d'une recette et de ses listes. Une erreur annule toutes
-- les modifications au lieu de laisser une recette partiellement enregistrée.
create or replace function public.save_recipe(p_recipe jsonb, p_id uuid default null)
returns uuid
language plpgsql
set search_path = public
as $$
declare
    saved_id uuid;
begin
    if not public.is_staff() then
        raise exception 'Accès non autorisé.' using errcode = '42501';
    end if;

    if nullif(trim(p_recipe ->> 'title'), '') is null
       or nullif(trim(p_recipe ->> 'slug'), '') is null then
        raise exception 'Le titre et le slug sont obligatoires.' using errcode = '22023';
    end if;

    if p_id is null then
        insert into public.recipes (
            title, slug, season, summary, category,
            preparation_time_in_minutes, cooking_time_in_minutes, servings,
            image_path, image_alt, tips, is_published, position
        ) values (
            trim(p_recipe ->> 'title'), trim(p_recipe ->> 'slug'),
            (p_recipe ->> 'season')::public.season,
            trim(coalesce(p_recipe ->> 'summary', '')),
            trim(coalesce(p_recipe ->> 'category', '')),
            coalesce((p_recipe ->> 'preparation_time_in_minutes')::integer, 0),
            coalesce((p_recipe ->> 'cooking_time_in_minutes')::integer, 0),
            coalesce((p_recipe ->> 'servings')::integer, 4),
            nullif(p_recipe ->> 'image_path', ''),
            trim(coalesce(p_recipe ->> 'image_alt', '')),
            nullif(trim(coalesce(p_recipe ->> 'tips', '')), ''),
            coalesce((p_recipe ->> 'is_published')::boolean, true),
            coalesce((p_recipe ->> 'position')::integer, 0)
        ) returning id into saved_id;
    else
        update public.recipes set
            title = trim(p_recipe ->> 'title'),
            slug = trim(p_recipe ->> 'slug'),
            season = (p_recipe ->> 'season')::public.season,
            summary = trim(coalesce(p_recipe ->> 'summary', '')),
            category = trim(coalesce(p_recipe ->> 'category', '')),
            preparation_time_in_minutes = coalesce((p_recipe ->> 'preparation_time_in_minutes')::integer, 0),
            cooking_time_in_minutes = coalesce((p_recipe ->> 'cooking_time_in_minutes')::integer, 0),
            servings = coalesce((p_recipe ->> 'servings')::integer, 4),
            image_path = nullif(p_recipe ->> 'image_path', ''),
            image_alt = trim(coalesce(p_recipe ->> 'image_alt', '')),
            tips = nullif(trim(coalesce(p_recipe ->> 'tips', '')), ''),
            is_published = coalesce((p_recipe ->> 'is_published')::boolean, true),
            position = coalesce((p_recipe ->> 'position')::integer, 0)
        where id = p_id;

        if not found then
            raise exception 'Recette introuvable.' using errcode = 'P0002';
        end if;

        saved_id := p_id;
        delete from public.recipe_ingredients where recipe_id = saved_id;
        delete from public.recipe_steps where recipe_id = saved_id;
    end if;

    insert into public.recipe_ingredients (recipe_id, quantity, name, position)
    select saved_id,
           trim(coalesce(item.value ->> 'quantity', '')),
           trim(item.value ->> 'name'),
           item.ordinality - 1
    from jsonb_array_elements(coalesce(p_recipe -> 'ingredients', '[]'::jsonb))
         with ordinality as item(value, ordinality)
    where nullif(trim(item.value ->> 'name'), '') is not null;

    insert into public.recipe_steps (recipe_id, description, position)
    select saved_id,
           trim(item.value ->> 'description'),
           item.ordinality - 1
    from jsonb_array_elements(coalesce(p_recipe -> 'steps', '[]'::jsonb))
         with ordinality as item(value, ordinality)
    where nullif(trim(item.value ->> 'description'), '') is not null;

    return saved_id;
end;
$$;

revoke all on function public.save_recipe(jsonb, uuid) from public, anon;
grant execute on function public.save_recipe(jsonb, uuid) to authenticated;
