create table public.ss_map_markers (
 world_id uuid not null references public.ss_worlds(id) on delete cascade,
 user_id uuid not null references public.ss_players(user_id) on delete cascade,
 x integer not null check (x between 0 and 999),
 y integer not null check (y between 0 and 999),
 primary key (world_id,user_id), unique(world_id,x,y)
);
alter table public.ss_map_markers enable row level security;
create policy "authenticated map visibility" on public.ss_map_markers for select to authenticated using(true);
grant select on public.ss_map_markers to authenticated;
create function public.ss_sync_map_marker() returns trigger language plpgsql set search_path=public,pg_temp as $$
begin
 insert into public.ss_map_markers(world_id,user_id,x,y) values(new.world_id,new.user_id,new.x,new.y)
 on conflict(world_id,user_id) do update set x=excluded.x,y=excluded.y;
 return new;
end $$;
create trigger ss_world_member_marker after insert or update of x,y on public.ss_world_members
for each row execute function public.ss_sync_map_marker();
insert into public.ss_map_markers(world_id,user_id,x,y)
select world_id,user_id,x,y from public.ss_world_members on conflict(world_id,user_id) do nothing;
