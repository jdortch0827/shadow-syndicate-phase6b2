CREATE OR REPLACE FUNCTION public.ss_heal(p_kind text, p_count integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare uid uuid:=auth.uid(); wid uuid; price integer; ready integer;
begin
 if uid is null then raise exception 'Login required'; end if;
 if p_count is null or p_count < 1 or p_count > 100 then raise exception 'Invalid count'; end if;
 if p_kind='runners' then price:=40;
 elsif p_kind='enforcers' then price:=120;
 elsif p_kind='specialists' then price:=300;
 else raise exception 'Invalid unit'; end if;
 select world_id into wid from public.ss_world_members where user_id=uid limit 1;
 if wid is null then raise exception 'Join world first'; end if;
 update public.ss_troop_stacks set wounded=wounded-p_count,available=available+p_count
 where world_id=wid and user_id=uid and unit_type=p_kind and wounded>=p_count
 returning available into ready;
 if not found then raise exception 'Not enough wounded troops'; end if;
 update public.ss_world_members set cash=cash-price*p_count
 where world_id=wid and user_id=uid and cash>=price*p_count;
 if not found then raise exception 'Insufficient cash'; end if;
 return jsonb_build_object('healed',p_count,'unit',p_kind,'available',ready);
end $function$
;

CREATE OR REPLACE FUNCTION public.ss_raid(p_target text, p_runners integer, p_enforcers integer, p_specialists integer, p_request uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare uid uuid:=auth.uid(); wid uuid; lvl integer; def integer; bounty integer; minlvl integer; atk integer; won boolean; result jsonb; old_result jsonb;
declare n integer; kind text; loss integer; total integer:=0; lost jsonb:='{}'::jsonb;
begin
 if uid is null then raise exception 'Login required'; end if;
 if p_request is null then raise exception 'Request ID required'; end if;
 if p_runners is null or p_enforcers is null or p_specialists is null or
 p_runners<0 or p_enforcers<0 or p_specialists<0 or
 p_runners>100000 or p_enforcers>100000 or p_specialists>100000 then raise exception 'Invalid deployment'; end if;
 total:=p_runners+p_enforcers+p_specialists;
 if total<1 then raise exception 'Deploy troops first'; end if;
 select world_id,level into wid,lvl from public.ss_world_members where user_id=uid order by updated_at limit 1 for update;
 if wid is null then raise exception 'Join world first'; end if;
 select result into old_result from public.ss_action_receipts where user_id=uid and request_id=p_request;
 if found then return old_result; end if;
 select defense,reward,minimum_level into def,bounty,minlvl from public.ss_combat_targets where id=p_target;
 if def is null then raise exception 'Unknown target'; end if;
 if lvl<minlvl then raise exception 'Level too low'; end if;
 if exists(select 1 from public.ss_battle_reports where attacker_id=uid and target=p_target and created_at>now()-interval '60 seconds') then raise exception 'Target cooling down'; end if;
 for kind,n in select 'runners',p_runners union all select 'enforcers',p_enforcers union all select 'specialists',p_specialists loop
   if n>0 then
     update public.ss_troop_stacks set available=available-n
     where world_id=wid and user_id=uid and unit_type=kind and available>=n;
     if not found then raise exception 'Not enough %',kind; end if;
   end if;
 end loop;
 update public.ss_world_members set energy=energy-8 where world_id=wid and user_id=uid and energy>=8;
 if not found then raise exception 'Insufficient energy'; end if;
 atk:=p_runners*4+p_enforcers*10+p_specialists*22;
 won:=atk>=def;
 for kind,n in select 'runners',p_runners union all select 'enforcers',p_enforcers union all select 'specialists',p_specialists loop
   if n>0 then
     loss:=least(n,ceil(n*(case when won then 0.12 else 0.38 end))::integer);
     update public.ss_troop_stacks set available=available+n-loss,wounded=wounded+loss
     where world_id=wid and user_id=uid and unit_type=kind;
     lost:=jsonb_set(lost,array[kind],to_jsonb(loss));
   end if;
 end loop;
 if won then update public.ss_world_members set cash=cash+bounty where world_id=wid and user_id=uid; end if;
 insert into public.ss_battle_reports(world_id,attacker_id,target,won,attack,defense,reward,casualties)
 values(wid,uid,p_target,won,atk,def,case when won then bounty else 0 end,lost);
 result:=jsonb_build_object('won',won,'attack',atk,'defense',def,'reward',case when won then bounty else 0 end,'wounded',lost);
 insert into public.ss_action_receipts(user_id,request_id,result) values(uid,p_request,result);
 return result;
end $function$
;

CREATE OR REPLACE FUNCTION public.ss_train(p_kind text, p_count integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare uid uuid := auth.uid(); wid uuid; price integer; power_cost integer; owned integer;
begin
 if uid is null then raise exception 'Login required'; end if;
 if p_count is null or p_count < 1 or p_count > 25 then raise exception 'Invalid count'; end if;
 if p_kind = 'runners' then price:=80; power_cost:=2;
 elsif p_kind = 'enforcers' then price:=240; power_cost:=4;
 elsif p_kind = 'specialists' then price:=600; power_cost:=7;
 else raise exception 'Invalid unit'; end if;
 select world_id into wid from public.ss_world_members where user_id=uid limit 1;
 if wid is null then raise exception 'Join world first'; end if;
 update public.ss_world_members set cash=cash-price*p_count,energy=energy-power_cost*p_count
 where world_id=wid and user_id=uid and cash>=price*p_count and energy>=power_cost*p_count;
 if not found then raise exception 'Insufficient resources'; end if;
 insert into public.ss_troop_stacks(world_id,user_id,unit_type,available)
 values(wid,uid,p_kind,p_count)
 on conflict(world_id,user_id,unit_type) do update set available=ss_troop_stacks.available+excluded.available
 returning available into owned;
 return jsonb_build_object('trained',p_count,'unit',p_kind,'available',owned);
end $function$
;