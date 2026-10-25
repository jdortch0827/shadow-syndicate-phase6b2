create table public.ss_combat_targets (
 id text primary key, name text not null,
 defense integer not null check(defense>0),
 reward integer not null check(reward>=0),
 minimum_level integer not null default 1
);
insert into public.ss_combat_targets(id,name,defense,reward,minimum_level)
values ('dockside','Dockside Patrol',80,190,1),
('warehouse','Warehouse Guards',210,430,2),
('convoy','Financial Convoy',460,950,3);
alter table public.ss_combat_targets enable row level security;
create policy "targets readable" on public.ss_combat_targets for select to authenticated using(true);
grant select on public.ss_combat_targets to authenticated;
