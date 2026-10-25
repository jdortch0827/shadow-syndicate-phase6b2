create or replace function public.ss_join_alpha(p_handle text)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare v_user uuid := auth.uid(); v_world uuid; v_member public.ss_world_members%rowtype; v_attempt integer; v_x integer; v_y integer;
begin
 if v_user is null then raise exception 'Authentication required'; end if;
 if length(trim(p_handle)) not between 3 and 24 or trim(p_handle) !~ '^[A-Za-z0-9_]+$' then raise exception 'Handle must be 3-24 letters, digits, or underscores'; end if;
 select id into v_world from public.ss_worlds where name='Shadow City · Alpha';
 if v_world is null then raise exception 'Alpha world not available'; end if;
 insert into public.ss_players(user_id,handle) values(v_user,trim(p_handle)) on conflict(user_id) do nothing;
 select * into v_member from public.ss_world_members where world_id=v_world and user_id=v_user;
 if not found then
   for v_attempt in 1..30 loop
     v_x := floor(random()*1000)::integer; v_y := floor(random()*1000)::integer;
     begin
       insert into public.ss_world_members(world_id,user_id,x,y) values(v_world,v_user,v_x,v_y) returning * into v_member;
       exit;
     exception when unique_violation then
       select * into v_member from public.ss_world_members where world_id=v_world and user_id=v_user;
       if found then exit; end if;
     end;
   end loop;
 end if;
 if v_member.user_id is null then raise exception 'World capacity temporarily unavailable'; end if;
 return jsonb_build_object('world_id',v_world,'user_id',v_user,'x',v_member.x,'y',v_member.y);
end $$;
revoke all on function public.ss_join_alpha(text) from public,anon;
grant execute on function public.ss_join_alpha(text) to authenticated;
