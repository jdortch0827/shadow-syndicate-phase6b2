-- Phase 1.68 - Social Underworld
-- ADDITIVE ONLY. No changes to player savings, accounts, battles, or the economy.
-- Already applied to Supabase project rmvjvvhnusgrwhpkkelz as:
-- shadow_social_street_chat_player_walls_and_blocks
-- shadow_social_safety_block_and_post_cooldowns
-- Policies are dropped before recreation to make this repository record safe to reapply.
create table if not exists public.ss_street_messages (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references public.ss_worlds(id) on delete cascade,
  author_id uuid not null references public.ss_players(user_id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists ss_street_messages_world_recent on public.ss_street_messages(world_id,created_at desc);
alter table public.ss_street_messages enable row level security;
grant select,insert on public.ss_street_messages to authenticated;
drop policy if exists "World members read street chat" on public.ss_street_messages;
create policy "World members read street chat" on public.ss_street_messages for select to authenticated
using (exists(select 1 from public.ss_world_members m where m.world_id=ss_street_messages.world_id and m.user_id=(select auth.uid())));
drop policy if exists "World members post as self" on public.ss_street_messages;
create policy "World members post as self" on public.ss_street_messages for insert to authenticated
with check (author_id=(select auth.uid()) and exists(select 1 from public.ss_world_members m where m.world_id=ss_street_messages.world_id and m.user_id=(select auth.uid())));

create table if not exists public.ss_social_blocks (
  blocker_id uuid not null references public.ss_players(user_id) on delete cascade,
  blocked_id uuid not null references public.ss_players(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(blocker_id,blocked_id),
  constraint ss_social_no_self_block check(blocker_id<>blocked_id)
);
alter table public.ss_social_blocks enable row level security;
grant select,insert,delete on public.ss_social_blocks to authenticated;
drop policy if exists "Block owners read" on public.ss_social_blocks;
drop policy if exists "Block participants see the block" on public.ss_social_blocks;
create policy "Block participants see the block" on public.ss_social_blocks for select to authenticated
using(blocker_id=(select auth.uid()) or blocked_id=(select auth.uid()));
drop policy if exists "Block owners add" on public.ss_social_blocks;
create policy "Block owners add" on public.ss_social_blocks for insert to authenticated
with check(blocker_id=(select auth.uid()));
drop policy if exists "Block owners remove" on public.ss_social_blocks;
create policy "Block owners remove" on public.ss_social_blocks for delete to authenticated
using(blocker_id=(select auth.uid()));

create table if not exists public.ss_player_wall_posts (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references public.ss_players(user_id) on delete cascade,
 author_id uuid not null references public.ss_players(user_id) on delete cascade,
 body text not null check(char_length(btrim(body)) between 1 and 500),
 created_at timestamptz not null default now()
);
create index if not exists ss_player_wall_posts_owner_recent on public.ss_player_wall_posts(owner_id,created_at desc);
alter table public.ss_player_wall_posts enable row level security;
grant select,insert,delete on public.ss_player_wall_posts to authenticated;
drop policy if exists "Members read public player walls" on public.ss_player_wall_posts;
create policy "Members read public player walls" on public.ss_player_wall_posts for select to authenticated
using(exists(select 1 from public.ss_world_members m where m.user_id=(select auth.uid())));
drop policy if exists "Members sign walls unless blocked" on public.ss_player_wall_posts;
create policy "Members sign walls unless blocked" on public.ss_player_wall_posts for insert to authenticated
with check(author_id=(select auth.uid()) and
 exists(select 1 from public.ss_world_members m where m.user_id=(select auth.uid())) and
 not exists(select 1 from public.ss_social_blocks b where
 (b.blocker_id=owner_id and b.blocked_id=(select auth.uid())) or
 (b.blocker_id=(select auth.uid()) and b.blocked_id=owner_id)));
drop policy if exists "Wall author may delete own post" on public.ss_player_wall_posts;
create policy "Wall author may delete own post" on public.ss_player_wall_posts for delete to authenticated
using(author_id=(select auth.uid()) or owner_id=(select auth.uid()));

create table if not exists public.ss_social_reports (
 id uuid primary key default gen_random_uuid(),
 reporter_id uuid not null references public.ss_players(user_id) on delete cascade,
 content_type text not null check(content_type in ('chat','wall')),
 content_id uuid not null,
 reason text not null check(char_length(btrim(reason)) between 3 and 250),
 created_at timestamptz not null default now(),
 unique(reporter_id,content_type,content_id)
);
alter table public.ss_social_reports enable row level security;
grant select,insert on public.ss_social_reports to authenticated;
drop policy if exists "Reporters read own reports" on public.ss_social_reports;
create policy "Reporters read own reports" on public.ss_social_reports for select to authenticated
using(reporter_id=(select auth.uid()));
drop policy if exists "Reporters submit own reports" on public.ss_social_reports;
create policy "Reporters submit own reports" on public.ss_social_reports for insert to authenticated
with check(reporter_id=(select auth.uid()) and exists(select 1 from public.ss_world_members m where m.user_id=(select auth.uid())));

create or replace function public.ss_social_throttle_chat() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
 if exists(select 1 from public.ss_street_messages where author_id=new.author_id and created_at>now()-interval '3 seconds')
 then raise exception 'Wait a few seconds between messages.' using errcode='23514'; end if;
 return new;
end;$$;
drop trigger if exists ss_social_chat_throttle on public.ss_street_messages;
create trigger ss_social_chat_throttle before insert on public.ss_street_messages for each row execute function public.ss_social_throttle_chat();
create or replace function public.ss_social_throttle_wall() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
 if exists(select 1 from public.ss_player_wall_posts where author_id=new.author_id and created_at>now()-interval '5 seconds')
 then raise exception 'Give the street a moment before posting again.' using errcode='23514';end if;
 return new;
end;$$;
drop trigger if exists ss_social_wall_throttle on public.ss_player_wall_posts;
create trigger ss_social_wall_throttle before insert on public.ss_player_wall_posts for each row execute function public.ss_social_throttle_wall();
