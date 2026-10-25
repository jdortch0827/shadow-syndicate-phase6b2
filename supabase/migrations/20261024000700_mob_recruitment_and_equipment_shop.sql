create or replace function public.ss_mob_shop(p_action text,p_item text,p_count integer,p_request uuid)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare uid uuid:=auth.uid(); wid uuid; price integer; atk integer:=0; def integer:=0; gear_slot text; item_name text; cost bigint; outcome jsonb; prior jsonb; balance bigint; current_mob integer;
begin
 if uid is null then raise exception 'Sign in first'; end if;
 if p_request is null or p_count is null or p_count<1 or p_count>100 then raise exception 'Invalid quantity'; end if;
 select r.result into prior from public.ss_action_receipts r where r.user_id=uid and r.request_id=p_request;
 if found then return prior; end if;
 select m.world_id,m.cash into wid,balance from public.ss_world_members m where m.user_id=uid order by m.updated_at desc limit 1 for update;
 if wid is null then raise exception 'Join Shadow City first'; end if;
 insert into public.ss_mob_profiles(user_id) values(uid) on conflict do nothing;
 select mob_size into current_mob from public.ss_mob_profiles where user_id=uid for update;
 if p_action='recruit' and p_item='mobster' then
  if current_mob+p_count>10000 then raise exception 'Mob size limit reached'; end if;
  cost:=p_count::bigint*100;
  item_name:='Mob recruits';
 elsif p_action='buy' then
  case p_item
   when 'brass_knuckles' then price:=70;atk:=3;def:=1;gear_slot:='weapon';item_name:='Brass Knuckles';
   when 'tommy_gun' then price:=450;atk:=14;def:=3;gear_slot:='weapon';item_name:='Tommy Gun';
   when 'kevlar_vest' then price:=300;atk:=1;def:=11;gear_slot:='armor';item_name:='Kevlar Vest';
   when 'armored_coat' then price:=650;atk:=4;def:=20;gear_slot:='armor';item_name:='Armored Coat';
   when 'getaway_car' then price:=550;atk:=10;def:=6;gear_slot:='vehicle';item_name:='Getaway Car';
   when 'armored_suv' then price:=1200;atk:=15;def:=19;gear_slot:='vehicle';item_name:='Armored SUV';
   else raise exception 'Unknown item'; end case;
  cost:=price::bigint*p_count;
 else raise exception 'Invalid shop action'; end if;
 if balance<cost then raise exception 'Not enough cash'; end if;
 update public.ss_world_members set cash=cash-cost,updated_at=now() where user_id=uid and world_id=wid;
 if p_action='recruit' then
  update public.ss_mob_profiles set mob_size=mob_size+p_count where user_id=uid;
 else
  insert into public.ss_mob_gear(user_id,slot,item_id,owned,attack,defense)
  values(uid,gear_slot,p_item,p_count,atk,def)
  on conflict(user_id,slot,item_id) do update set owned=ss_mob_gear.owned+excluded.owned;
 end if;
 outcome:=jsonb_build_object('action',p_action,'item',p_item,'quantity',p_count,'spent',cost,'cash',balance-cost,'mob_size',case when p_action='recruit' then current_mob+p_count else current_mob end);
 insert into public.ss_action_receipts(user_id,request_id,result) values(uid,p_request,outcome);
 return outcome;
end $$;
revoke all on function public.ss_mob_shop(text,text,integer,uuid) from public,anon;
grant execute on function public.ss_mob_shop(text,text,integer,uuid) to authenticated;