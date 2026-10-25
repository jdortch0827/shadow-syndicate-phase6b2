
create or replace function public.ss_mob_attack(p_defender uuid,p_request uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); wid uuid; a public.ss_mob_profiles%rowtype; d public.ss_mob_profiles%rowtype;
 attacker_power integer; defender_power integer; won boolean; payout integer; outcome jsonb; previous jsonb;
begin
 if uid is null then raise exception 'Login required'; end if;
 if p_request is null or p_defender is null or p_defender=uid then raise exception 'Invalid attack'; end if;
 select result into previous from public.ss_action_receipts where user_id=uid and request_id=p_request;
 if found then return previous; end if;
 select world_id into wid from public.ss_world_members where user_id=uid limit 1;
 if wid is null or not exists(select 1 from public.ss_world_members where user_id=p_defender and world_id=wid) then raise exception 'Target not in your world'; end if;
 insert into public.ss_mob_profiles(user_id) values(uid),(p_defender) on conflict do nothing;
 -- Lock both profiles in a stable order to avoid simultaneous attack deadlocks.
 perform 1 from public.ss_mob_profiles where user_id in(uid,p_defender) order by user_id for update;
 select * into a from public.ss_mob_profiles where user_id=uid;
 select * into d from public.ss_mob_profiles where user_id=p_defender;
 if a.hospital_until>now() then raise exception 'You are hospitalized'; end if;
 if d.hospital_until>now() then raise exception 'Target is hospitalized'; end if;
 if a.last_attack_at>now()-interval '15 seconds' then raise exception 'Attack cooldown active'; end if;
 attacker_power:=a.attack_points + a.mob_size*3 + coalesce((select sum(least(owned,a.mob_size)*attack) from public.ss_mob_gear where user_id=uid),0);
 defender_power:=d.defense_points + d.mob_size*3 + coalesce((select sum(least(owned,d.mob_size)*defense) from public.ss_mob_gear where user_id=p_defender),0);
 -- Stable server-only randomized advantage, never trusted from browser.
 won:=(attacker_power*(0.85+random()*0.30)) >= (defender_power*(0.85+random()*0.30));
 payout:=case when won then least(500,50+greatest(0,d.mob_size-a.mob_size)*5) else 0 end;
 update public.ss_mob_profiles set wins=wins+case when won then 1 else 0 end,losses=losses+case when won then 0 else 1 end,last_attack_at=now() where user_id=uid;
 update public.ss_mob_profiles set wins=wins+case when won then 0 else 1 end,losses=losses+case when won then 1 else 0 end where user_id=p_defender;
 update public.ss_world_members set cash=cash+payout where user_id=uid and world_id=wid;
 insert into public.ss_mob_rivals(user_id,rival_id,attacks,wins,last_fight_at) values(uid,p_defender,1,case when won then 1 else 0 end,now())
 on conflict(user_id,rival_id) do update set attacks=ss_mob_rivals.attacks+1,wins=ss_mob_rivals.wins+excluded.wins,last_fight_at=now();
 insert into public.ss_battle_reports(world_id,attacker_id,defender_id,target,won,attack,defense,reward,casualties)
 values(wid,uid,p_defender,'mob-pvp',won,attacker_power,defender_power,payout,'{}'::jsonb);
 outcome:=jsonb_build_object('won',won,'attack',attacker_power,'defense',defender_power,'cash',payout,'defender_id',p_defender);
 insert into public.ss_action_receipts(user_id,request_id,result) values(uid,p_request,outcome);
 return outcome;
end $$;
revoke all on function public.ss_mob_attack(uuid,uuid) from public,anon;
grant execute on function public.ss_mob_attack(uuid,uuid) to authenticated;
