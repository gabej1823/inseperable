-- Server-authoritative challenge submissions and chapter progression.
-- Run after all previous migrations. Seed only five sample challenges for testing.

insert into public.challenges (id, chapter_number, position, title, kind, prompt, choices, xp) values
('c1',1,1,'The Perfect Weekend','guess','What would your partner most enjoy doing this Saturday?', '["A cozy day at home","Exploring somewhere new","A night out","Time outdoors"]'::jsonb,100),
('c2',1,2,'Our First Impression','conversation','What did you notice first about your partner?',null,100),
('c3',1,3,'A Little Surprise','mission','Do one small, thoughtful thing for your partner today.',null,150),
('c4',1,4,'This or That','choice','Pick the date you would most enjoy together.', '["Coffee and a walk","Cooking together","Live music","A movie night"]'::jsonb,100),
('c5',1,5,'The Memory Lane','conversation','Describe a moment with your partner that always makes you smile.',null,100)
on conflict (id) do nothing;

drop policy if exists "Submit own response" on public.challenge_responses;

create function public.submit_challenge_response(target_challenge text, response jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  target_couple uuid;
  current_chapter int;
  activity public.challenges%rowtype;
  response_count int;
  complete_count int;
  chapter_count int;
  awarded boolean := false;
begin
  if actor is null then raise exception 'Authentication required'; end if;
  if response is null or response = 'null'::jsonb or length(response::text) > 2000 then
    raise exception 'Answer must contain no more than 2000 characters';
  end if;
  select couple_id into target_couple from public.couple_members where user_id = actor;
  if target_couple is null then raise exception 'Connect with your partner first'; end if;

  -- Serialize submissions for one couple; only one transaction can award XP.
  select chapter_number into current_chapter from public.couples where id = target_couple for update;
  if (select count(*) from public.couple_members where couple_id = target_couple) <> 2 then
    raise exception 'Both partners must be connected';
  end if;
  select * into activity from public.challenges where id = target_challenge;
  if not found then raise exception 'Challenge not found'; end if;
  if activity.chapter_number <> current_chapter then raise exception 'This chapter is locked'; end if;
  if exists (select 1 from public.completed_challenges where couple_id = target_couple and challenge_id = target_challenge) then
    raise exception 'Challenge already completed';
  end if;
  if exists (select 1 from public.challenge_responses where couple_id = target_couple and challenge_id = target_challenge and user_id = actor) then
    raise exception 'You already submitted an answer';
  end if;

  insert into public.challenge_responses(couple_id, challenge_id, user_id, answer)
  values (target_couple, target_challenge, actor, response);
  select count(*) into response_count from public.challenge_responses
  where couple_id = target_couple and challenge_id = target_challenge;

  if response_count = 2 then
    insert into public.completed_challenges(couple_id, challenge_id) values (target_couple, target_challenge);
    update public.couples set xp = xp + activity.xp where id = target_couple;
    awarded := true;

    select count(*) into complete_count from public.completed_challenges cc
      join public.challenges ch on ch.id = cc.challenge_id
      where cc.couple_id = target_couple and ch.chapter_number = current_chapter;
    select count(*) into chapter_count from public.challenges where chapter_number = current_chapter;
    if current_chapter < 8 and chapter_count > 0 and complete_count = chapter_count then
      update public.couples set chapter_number = chapter_number + 1 where id = target_couple;
    end if;
  end if;
  return jsonb_build_object('both_answered', response_count = 2, 'xp_awarded', awarded);
end;
$$;

revoke all on function public.submit_challenge_response(text,jsonb) from public;
grant execute on function public.submit_challenge_response(text,jsonb) to authenticated;
