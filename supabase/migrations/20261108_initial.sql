-- Inseparable initial schema. Run only in the NEW Inseparable Supabase project.
-- All client-accessible tables are protected with row-level security.

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  avatar_config jsonb not null default '{}'::jsonb,
  photo_path text,
  created_at timestamptz not null default now()
);

create table public.couples (
  id uuid primary key default gen_random_uuid(),
  chapter_number int not null default 1 check (chapter_number between 1 and 8),
  xp int not null default 0 check (xp >= 0),
  created_at timestamptz not null default now()
);

create table public.couple_members (
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (couple_id, user_id)
);

create table public.challenges (
  id text primary key,
  chapter_number int not null check (chapter_number between 1 and 8),
  position int not null check (position > 0),
  title text not null,
  kind text not null check (kind in ('guess','conversation','mission','choice')),
  prompt text not null,
  choices jsonb,
  xp int not null check (xp between 0 and 1000),
  unique (chapter_number, position)
);

create table public.challenge_responses (
  couple_id uuid not null references public.couples(id) on delete cascade,
  challenge_id text not null references public.challenges(id),
  user_id uuid not null references public.profiles(id) on delete cascade,
  answer jsonb not null,
  submitted_at timestamptz not null default now(),
  primary key (couple_id, challenge_id, user_id)
);

create table public.completed_challenges (
  couple_id uuid not null references public.couples(id) on delete cascade,
  challenge_id text not null references public.challenges(id),
  completed_at timestamptz not null default now(),
  primary key (couple_id, challenge_id)
);

create index on public.couple_members (user_id);
create index on public.challenge_responses (couple_id, challenge_id);

create function public.is_couple_member(target_couple uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.couple_members where couple_id = target_couple and user_id = (select auth.uid()));
$$;

create function public.both_partners_answered(target_couple uuid, target_challenge text)
returns boolean language sql stable security definer set search_path = '' as $$
  select (select count(*) from public.couple_members where couple_id = target_couple) = 2
     and (select count(*) from public.challenge_responses where couple_id = target_couple and challenge_id = target_challenge) = 2;
$$;

alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.couple_members enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_responses enable row level security;
alter table public.completed_challenges enable row level security;

create policy "Read own profile and connected partner" on public.profiles for select to authenticated using (
  id = (select auth.uid()) or exists (
    select 1 from public.couple_members a join public.couple_members b on a.couple_id = b.couple_id
    where a.user_id = (select auth.uid()) and b.user_id = profiles.id
  )
);
create policy "Create own profile" on public.profiles for insert to authenticated with check (id = (select auth.uid()));
create policy "Update own profile" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "Read own couple" on public.couples for select to authenticated using (public.is_couple_member(id));
create policy "Read partner membership" on public.couple_members for select to authenticated using (public.is_couple_member(couple_id));
create policy "Read challenge catalog" on public.challenges for select to authenticated using (true);

-- Deliberately disallow direct writes to couples/membership, completion and XP.
-- Implement transactional, permission-checked RPCs for invitations, link/unlink,
-- response submission, completion and chapter unlocking before launching multiplayer.
create policy "Submit own response" on public.challenge_responses for insert to authenticated with check (
  user_id = (select auth.uid()) and public.is_couple_member(couple_id)
);
create policy "Read own or revealed responses" on public.challenge_responses for select to authenticated using (
  public.is_couple_member(couple_id) and
  (user_id = (select auth.uid()) or public.both_partners_answered(couple_id, challenge_id))
);
create policy "Read couple completions" on public.completed_challenges for select to authenticated using (public.is_couple_member(couple_id));

-- No delete/update on responses: answers are locked once submitted.
