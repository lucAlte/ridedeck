-- RideDeck : tables et règles de sécurité
-- À coller dans Supabase > SQL Editor > New query, puis cliquer sur Run (une seule fois).

-- Réglages, parcours personnalisés et options de parcours : une ligne par utilisateur
create table if not exists public.user_data (
  user_id       uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  settings      jsonb not null default '{}'::jsonb,
  custom_routes jsonb not null default '[]'::jsonb,
  route_opts    jsonb not null default '{}'::jsonb,
  updated_at    timestamptz not null default now()
);

-- Historique : une ligne par séance
create table if not exists public.sessions (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id         text not null,
  date       timestamptz not null,
  data       jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);
create index if not exists sessions_user_date on public.sessions (user_id, date desc);

-- Sécurité : chaque utilisateur ne voit et ne modifie que ses propres données
alter table public.user_data enable row level security;
alter table public.sessions  enable row level security;

drop policy if exists "user_data: propriétaire" on public.user_data;
create policy "user_data: propriétaire" on public.user_data
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "sessions: propriétaire" on public.sessions;
create policy "sessions: propriétaire" on public.sessions
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
