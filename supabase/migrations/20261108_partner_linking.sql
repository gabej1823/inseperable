-- Apply after the initial and profile trigger migrations.
-- Invites expire after seven days. Only authenticated users can call these RPCs.

create table public.partner_invites (
  code text primary key check (code ~ '^[A-F0-9]{12}$'),
  couple_id uuid not null references public.couples(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  expires_at timestamptz not null,
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.partner_invites (couple_id);
alter table public.partner_invites enable row level security;
-- No direct client table access. All invitation changes use validated RPCs.

create function public.my_couple_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select couple_id from public.couple_members where user_id = (select auth.uid()) limit 1;
$$;

create function public.get_or_create_partner_invite()
returns text language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  current_couple uuid;
  invite_code text;
begin
  if actor is null then raise exception 'Authentication required'; end if;
  if not exists (select 1 from public.profiles where id = actor) then
    raise exception 'Profile not found';
  end if;

  -- Serialize requests from the same account, including simultaneous taps.
  perform 1 from public.profiles where id = actor for update;
  select couple_id into current_couple from public.couple_members where user_id = actor;
  if current_couple is null then
    insert into public.couples default values returning id into current_couple;
    insert into public.couple_members (couple_id, user_id) values (current_couple, actor);
  end if;
  if (select count(*) from public.couple_members where couple_id = current_couple) >= 2 then
    raise exception 'You are already linked with your partner';
  end if;
  select code into invite_code from public.partner_invites
   where couple_id = current_couple and created_by = actor and redeemed_at is null and expires_at > now()
   order by created_at desc limit 1;
  if invite_code is not null then return invite_code; end if;

  invite_code := upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 12));
  insert into public.partner_invites(code, couple_id, created_by, expires_at)
  values (invite_code, current_couple, actor, now() + interval '7 days');
  return invite_code;
end;
$$;

create function public.join_partner_with_code(invite_code text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  selected_invite public.partner_invites%rowtype;
begin
  if actor is null then raise exception 'Authentication required'; end if;
  if exists (select 1 from public.couple_members where user_id = actor) then
    raise exception 'You already belong to a couple';
  end if;
  select * into selected_invite from public.partner_invites
    where code = upper(trim(invite_code)) and redeemed_at is null and expires_at > now()
    for update;
  if not found then raise exception 'Invalid or expired invitation code'; end if;
  if selected_invite.created_by = actor then raise exception 'You cannot link with yourself'; end if;
  -- Lock the couple before testing capacity; two users cannot join a single invite.
  perform 1 from public.couples where id = selected_invite.couple_id for update;
  if (select count(*) from public.couple_members where couple_id = selected_invite.couple_id) <> 1 then
    raise exception 'This couple is no longer available';
  end if;
  insert into public.couple_members(couple_id, user_id) values (selected_invite.couple_id, actor);
  update public.partner_invites set redeemed_at = now() where code = selected_invite.code;
  return selected_invite.couple_id;
end;
$$;

revoke all on function public.my_couple_id() from public;
revoke all on function public.get_or_create_partner_invite() from public;
revoke all on function public.join_partner_with_code(text) from public;
grant execute on function public.my_couple_id() to authenticated;
grant execute on function public.get_or_create_partner_invite() to authenticated;
grant execute on function public.join_partner_with_code(text) to authenticated;
