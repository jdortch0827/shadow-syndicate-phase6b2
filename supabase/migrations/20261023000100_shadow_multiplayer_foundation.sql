-- Shadow Syndicate isolated multiplayer schema. Apply ONLY to a dedicated Shadow Syndicate Supabase project.
create table public.ss_worlds (
 id uuid primary key default gen_random_uuid(), name text not null unique, created_at timestamptz not null default now()
);
create table public.ss_players (
 user_id uuid primary key references auth.users(id) on delete cascade,
 handle text not null unique check (char_length(handle) between 3 and 24),
 created_at timestamptz not null default now()
);
create table public.ss_world_members (
 world_id uuid not null references public.ss_worlds(id) on delete cascade,
 user_id uuid not null references public.ss_players(user_id) on delete cascade,
 x integer not null check (x between 0 and 999),
 y integer not null check (y between 0 and 999),
 cash bigint not null default 750 check (cash >= 0),
 energy integer not null default 300 check (energy >= 0),
 level integer not null default 1 check (level between 1 and 1000),
 updated_at timestamptz not null default now(),
 primary key(world_id,user_id),unique(world_id,x,y)
);
create table public.ss_troop_stacks (
 world_id uuid not null,user_id uuid not null,
 unit_type text not null check(unit_type in ('runners','enforcers','specialists')),
 available integer not null default 0 check(available >= 0),
 wounded integer not null default 0 check(wounded >= 0),
 primary key(world_id,user_id,unit_type),
 foreign key(world_id,user_id) references public.ss_world_members(world_id,user_id) on delete cascade
);
create table public.ss_battle_reports (
 id uuid primary key default gen_random_uuid(),world_id uuid not null references public.ss_worlds(id),
 attacker_id uuid not null references public.ss_players(user_id),
 defender_id uuid references public.ss_players(user_id),
 target text not null, won boolean not null, attack integer not null,
 defense integer not null, reward integer not null default 0,
 casualties jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create table public.ss_action_receipts (
 user_id uuid not null references public.ss_players(user_id) on delete cascade,
 request_id uuid not null,
 result jsonb not null,
 created_at timestamptz not null default now(),
 primary key(user_id,request_id)
);
create index ss_battle_attacker_recent on public.ss_battle_reports(attacker_id,created_at desc);
create index ss_members_world on public.ss_world_members(world_id);
alter table public.ss_worlds enable row level security;
alter table public.ss_players enable row level security;
alter table public.ss_world_members enable row level security;
alter table public.ss_troop_stacks enable row level security;
alter table public.ss_battle_reports enable row level security;
alter table public.ss_action_receipts enable row level security;
create policy "worlds read authenticated" on public.ss_worlds for select to authenticated using(true);
create policy "player read authenticated" on public.ss_players for select to authenticated using(true);
create policy "player self create" on public.ss_players for insert to authenticated with check(user_id=(select auth.uid()));
create policy "member read own record" on public.ss_world_members for select to authenticated using(user_id=(select auth.uid()));
create policy "own troop read" on public.ss_troop_stacks for select to authenticated using(user_id=(select auth.uid()));
create policy "own battle reports" on public.ss_battle_reports for select to authenticated using(attacker_id=(select auth.uid()) or defender_id=(select auth.uid()));
create policy "own receipts read" on public.ss_action_receipts for select to authenticated using(user_id=(select auth.uid()));
-- Deliberately NO direct INSERT/UPDATE/DELETE policies on balances, troops, reports, or receipts.
-- A trusted backend with service credentials must perform all gameplay mutations.
revoke all on public.ss_world_members,public.ss_troop_stacks,public.ss_battle_reports,public.ss_action_receipts from anon;
grant select on public.ss_worlds,public.ss_players,public.ss_world_members,public.ss_troop_stacks,public.ss_battle_reports,public.ss_action_receipts to authenticated;
grant insert on public.ss_players to authenticated;
