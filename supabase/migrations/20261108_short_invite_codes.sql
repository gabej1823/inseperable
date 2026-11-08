-- Shorten *new* partner invitations from 12 to 8 hexadecimal characters.
-- Existing 12-character invitations stay valid until their normal expiration.
-- Apply AFTER 20261108_partner_linking.sql.

alter table public.partner_invites drop constraint if exists partner_invites_code_check;
alter table public.partner_invites add constraint partner_invites_code_check
  check (code ~ '^([A-F0-9]{8}|[A-F0-9]{12})$');

create or replace function public.get_or_create_partner_invite()
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

  perform 1 from public.profiles where id = actor for update;
  select couple_id into current_couple from public.couple_members where user_id = actor;
  if current_couple is null then
    insert into public.couples default values returning id into current_couple;
    insert into public.couple_members (couple_id, user_id) values (current_couple, actor);
  end if;
  if (select count(*) from public.couple_members where couple_id = current_couple) >= 2 then
    raise exception 'You are already linked with your partner';
  end if;

  -- Reuse an active short code; older long codes can still be redeemed.
  select code into invite_code from public.partner_invites
   where couple_id = current_couple and created_by = actor
     and length(code) = 8 and redeemed_at is null and expires_at > now()
   order by created_at desc limit 1;
  if invite_code is not null then return invite_code; end if;

  -- 8 random hex characters (roughly 4.3 billion possibilities).
  invite_code := upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8));
  insert into public.partner_invites(code, couple_id, created_by, expires_at)
  values (invite_code, current_couple, actor, now() + interval '7 days');
  return invite_code;
end;
$$;
