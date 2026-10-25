create or replace function public.ss_seed_mob_profile() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$ begin insert into public.ss_mob_profiles(user_id) values(new.user_id) on conflict(user_id) do nothing; return new; end $$;
revoke all on function public.ss_seed_mob_profile() from public,anon,authenticated;
drop trigger if exists ss_seed_mob_profile_on_join on public.ss_world_members;
create trigger ss_seed_mob_profile_on_join after insert on public.ss_world_members for each row execute function public.ss_seed_mob_profile();
insert into public.ss_mob_profiles(user_id) select distinct user_id from public.ss_world_members on conflict(user_id) do nothing;