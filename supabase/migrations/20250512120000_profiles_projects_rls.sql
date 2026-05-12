-- =============================================================================
-- Project Spec Generator — Schéma Supabase (profil + projets + RLS)
-- Exécuter dans : SQL Editor > New query (ou supabase db push)
-- =============================================================================

-- gen_random_uuid() : activer « pgcrypto » dans Supabase > Database > Extensions si besoin.

-- -----------------------------------------------------------------------------
-- 1. Profils (1 ligne par utilisateur auth)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Profil applicatif lié à auth.users';

-- -----------------------------------------------------------------------------
-- 2. Projets / specs (aligné avec le client : idea, spec, timestamp + sections)
-- -----------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  idea text not null default '',
  spec text not null default '',
  -- Document complet Markdown (comme aujourd’hui dans l’app)

  -- Sections structurées (clés = ids dans App.tsx : summary, business, mvp, …)
  section_summary text,
  section_business text,
  section_mvp text,
  section_stories text,
  section_architecture text,
  section_schema text,
  section_api text,
  section_ui text,
  section_stack text,
  section_roadmap text,
  section_risks text,

  language text not null default 'fr',
  included_sections text[] not null default '{}',

  "timestamp" timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.projects is 'Historique des specs générées par utilisateur';
comment on column public.projects.spec is 'Markdown complet (export / affichage)';
comment on column public.projects.section_summary is 'Résumé du projet';
comment on column public.projects.section_business is 'Objectifs business';
comment on column public.projects.section_mvp is 'MVP';
comment on column public.projects.section_stories is 'User Stories';
comment on column public.projects.section_architecture is 'Architecture système';
comment on column public.projects.section_schema is 'Modèle de données';
comment on column public.projects.section_api is 'API Endpoints';
comment on column public.projects.section_ui is 'Pages UI';
comment on column public.projects.section_stack is 'Stack technique';
comment on column public.projects.section_roadmap is 'Roadmap';
comment on column public.projects.section_risks is 'Risques & mitigation';

create index if not exists projects_user_id_timestamp_idx
  on public.projects (user_id, "timestamp" desc);

-- Si la table existait déjà sans les nouvelles colonnes, les ajouter sans erreur :
alter table public.projects add column if not exists section_summary text;
alter table public.projects add column if not exists section_business text;
alter table public.projects add column if not exists section_mvp text;
alter table public.projects add column if not exists section_stories text;
alter table public.projects add column if not exists section_architecture text;
alter table public.projects add column if not exists section_schema text;
alter table public.projects add column if not exists section_api text;
alter table public.projects add column if not exists section_ui text;
alter table public.projects add column if not exists section_stack text;
alter table public.projects add column if not exists section_roadmap text;
alter table public.projects add column if not exists section_risks text;
alter table public.projects add column if not exists language text not null default 'fr';
alter table public.projects add column if not exists included_sections text[] not null default '{}';
alter table public.projects add column if not exists created_at timestamptz not null default now();
alter table public.projects add column if not exists updated_at timestamptz not null default now();

-- -----------------------------------------------------------------------------
-- 3. updated_at automatique
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 4. Création du profil à l’inscription
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_handle_profile on auth.users;
create trigger on_auth_user_created_handle_profile
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Rétro-remplir les profils pour les comptes déjà créés (sans erreur si déjà là)
insert into public.profiles (id, display_name, avatar_url)
select
  u.id,
  coalesce(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(coalesce(u.email, ''), '@', 1)
  ),
  u.raw_user_meta_data->>'avatar_url'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- -----------------------------------------------------------------------------
-- 5. Row Level Security — profiles
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Pas de DELETE côté client : le profil disparaît avec auth.users (cascade).

-- -----------------------------------------------------------------------------
-- 6. Row Level Security — projects
-- -----------------------------------------------------------------------------
alter table public.projects enable row level security;

drop policy if exists "projects_select_own" on public.projects;
create policy "projects_select_own"
  on public.projects for select
  using (auth.uid() = user_id);

drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own"
  on public.projects for insert
  with check (auth.uid() = user_id);

drop policy if exists "projects_update_own" on public.projects;
create policy "projects_update_own"
  on public.projects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "projects_delete_own" on public.projects;
create policy "projects_delete_own"
  on public.projects for delete
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 7. Accès lecture pour le rôle anonyme : aucun (on ne crée pas de policy → deny)
--    L’API anon utilise auth.uid() null → pas d’accès aux tables sans connexion.
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- 8. Droits API (clé anon + JWT utilisateur = rôle authenticated)
-- -----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.projects to authenticated;

-- -----------------------------------------------------------------------------
-- 9. (Optionnel) Realtime
-- -----------------------------------------------------------------------------
-- alter publication supabase_realtime add table public.profiles;
