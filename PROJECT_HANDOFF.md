# Shadow Syndicate — Project Handoff
Updated: 2026-10-24
Repository: https://github.com/jdortch0827/shadow-syndicate-phase6b2
Hosting: Netlify shadowsyndicate (verify latest deployment before claiming live).
Latest user-shown build: Phase 1.67 Unified Underground; verify actual repository/deploy version.

## Vision
Build a polished multiplayer mobile crime strategy game with the classic mob-game social experience. Preserve real player data and gameplay systems.

## Verified repository inspection
- src/App.jsx handles the main game and navigation; src/pages includes HomePage, JobsPage, FightPage, EmpirePage, MorePage, PvpHub, SettingsPage and StorePage.
- src/logic/streetChat.js, src/data/mockPlayers, PvP systems, and Supabase multiplayer migrations exist.
- App.jsx has a chat tab and StreetChatPanel currently described as local prototype chatter, not confirmed player-to-player messaging.
- Account navigation and avatar upload handlers exist in App.jsx but user reports failures.
- Database migration files are present through 20261024000700_seed_mob_recruitment_and_equipment_shop.sql.

## Bugs and requests (not yet fixed)
1. Top Account button reportedly not working.
2. Player avatar upload error (see screenshots in Continue Working chat).
3. Chat is not discoverable; cannot browse other players or leave comments on their profile walls.

## Social gameplay requirements
- Visible Street Chat: authenticated, persisted messages among actual players, not simulated chat.
- Player directory, public profiles with avatar, level, class, faction, PvP record.
- Clickable names in chat, combat reports and leaderboards.
- Public walls for playful rival trash talk, with reporting, blocking, rate limiting and moderation.
- Crew chat, direct messages, notifications, rival challenges and rematches.
- Mobile-first UI consistent with existing game visual design.

## Next engineering actions
1. Inspect current commit and deployed Netlify version.
2. Reproduce/fix Account button and avatar error.
3. Inspect existing chat navigation and make it prominent.
4. Implement Supabase-backed social tables and row-level security with tests for two different authenticated players.
5. Test cross-account persistence, blocking, sanitization, responsiveness, and existing gameplay regressions.

## Universal conversation handoff rule
Applies to ALL user projects. Proactively warn before a conversation becomes too long. Supply a copyable handoff with last verified commit/deploy, progress, pending bugs, links, data safety, and exact next task. Keep repository handoff files updated when possible. Exact remaining chat space cannot be measured.