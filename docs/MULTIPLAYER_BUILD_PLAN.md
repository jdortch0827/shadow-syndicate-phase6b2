# Shadow Syndicate multiplayer architecture and next major batch

## Current boundary
The game is a React/Vite local-save prototype. War Room is deliberately isolated in src/logic/warfare.js so its formulas can be moved behind an authoritative service. The browser MUST NOT be trusted with final troop balances, combat outcomes, currency, timers, or ownership.

## Target services
- Identity: secure managed authentication with verified email and recovery.
- Database: PostgreSQL with transactional state changes, immutable ledger and battle reports.
- Simulation: authoritative server handlers for training, healing, movement, combat, territory capture, rally resolution and cooldowns.
- Live events: subscription/notification channel for marches, alliance chat, rallies, battle completion and territory updates.
- Background jobs: durable queue for timed construction, troop training, march arrival, rallies, hospital completion and periodic world events.
- Client: React UI consuming versioned APIs; optimistic rendering only where safe, reconciliation after server response.

## Proposed core data model
players(id, auth_user_id, display_name, faction, created_at)
worlds(id, name, season, status)
world_memberships(world_id, player_id, home_base_id, joined_at)
bases(id, world_id, player_id, x, y, level, shield_until)
resources(player_id, world_id, cash, energy, materials, updated_at, revision)
troop_stacks(player_id, world_id, unit_type, available, wounded, marching, revision)
buildings(base_id, building_type, level, upgrade_completes_at)
marches(id, world_id, owner_id, source_base_id, target_id, status, arrives_at, payload)
alliances(id, world_id, name, tag, leader_id)
alliance_members(alliance_id, player_id, rank, joined_at)
rallies(id, alliance_id, target_id, leader_id, launches_at, status)
rally_contributions(rally_id, player_id, unit_type, quantity)
territory_cells(world_id, x, y, controlling_alliance_id, owner_base_id)
battle_reports(id, world_id, attacker_id, defender_id, outcome, casualties, rewards, resolved_at)
resource_ledger(id, player_id, world_id, request_id, reason, delta, created_at)
world_events(id, world_id, event_type, starts_at, ends_at, payload)

## Trust and concurrency rules
1. Every write requires authenticated player identity and world membership.
2. Never accept client-submitted final balances or win/loss.
3. Training and spending use a single atomic transaction, row locks and nonnegative constraints.
4. Every write includes a unique idempotency key; duplicate requests do not double-charge.
5. Troops cannot be simultaneously at home, wounded, and on a march.
6. Only server time determines timers and combat resolution.
7. World map cells use uniqueness constraints; capture changes are transactional.
8. Alliance roles must be checked on server for invites, kicks, rallies, territory actions.
9. Public read models expose only nonsecret scouting information.
10. Store server secrets outside the browser and enforce least privilege.
11. Backups, monitoring, rate limits, anti-cheat telemetry, abuse reporting and restore drills precede public launch.

## Milestone A: first two-account slice
- Secure accounts and shared world with two players.
- Persist one base, resources, troop stacks, hospital and battle reports.
- Train, heal and attack with server-authoritative calculations.
- Both clients see correct outcomes after refresh.

## Milestone B: strategy map
- Zoom/pan world map, player bases, ownership, movement, fog-of-war and scout reports.
- Server-resolved marches and battle outcomes.
- Bases, building upgrade timers and defensive garrisons.

## Milestone C: alliance warfare
- Alliance ranks, invitations, chat, reinforcement, rallies, countdowns and shared territory.
- Territory borders, capture rules, contested objectives and alliance diplomacy.
- Multi-player concurrency and load testing.

## Milestone D: polish and launch
- Commander/hero skills, research, events, cross-world competition, onboarding, telemetry.
- Accessibility, mobile performance, balance simulations, fraud prevention and disaster recovery.

## Compatibility
Do not silently import local save balances into competitive worlds. Offer an explicit one-time migration or start competitive worlds fresh. Keep old offline saves available and backed up.
