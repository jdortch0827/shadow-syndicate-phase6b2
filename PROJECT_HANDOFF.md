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
---

## Phase 1.68 Social Underworld — October 24, 2026 (CT)
Source project: https://github.com/jdortch0827/shadow-syndicate-phase6b2
Production: https://shadowsyndicate.netlify.app
Supabase: Shadow Syndicate project rmvjvvhnusgrwhpkkelz
Netlify site: shadowsyndicate ID 8cf3383b-063b-4545-9eb0-f7d48deffaa8
Latest production verified during implementation: READY on commit 0d85101a4a003b30d0ca4567ad1e0f7197767e51; recheck published commit as additional test commits may have landed.

### Implemented
- New direct Street nav button, mobile and desktop, plus Home shortcut.
- Real shared Street Chat, searchable player directory, and public player profile walls via authenticated Supabase REST.
- Player names clickable on fights, rivalry records and leaderboards. Block/unblock and report controls.
- Authenticated social DB tables: ss_street_messages, ss_player_wall_posts, ss_social_blocks, ss_social_reports. RLS, membership policies, block constraints, post cooldowns, non-destructive schema additions.
- Social components: src/components/SocialUnderworld.jsx, src/components/socialUnderworld.css, src/lib/socialUnderworld.js.
- Integrated: src/components/Underground.jsx, src/components/MultiplayerLobby.jsx, src/App.jsx, src/data/navConfig.js, src/index.css.
- Source database migration: supabase/migrations/20261025000000_social_underworld.sql. Already applied live in two migrations named shadow_social_street_chat_player_walls_and_blocks and shadow_social_safety_block_and_post_cooldowns.
- Fixed Account button scroll location and changed avatar upload to compress ordinary images and show async error feedback (user-device validation pending).
- Synced app release files to Phase 1.68 (src/data/phase.js, public/version.json, public/sw.js and public/manifest.json).
- New automated source-level tests: tests/social-underworld.test.js.

### Verification and important caveats
- Netlify production build verified READY for one Phase 1.68 code commit. Confirm latest deployment after any following commit.
- Supabase tables/policies checked; RLS is enabled. No two-account authenticated send/receive test yet. The database currently showed only one joined player.
- Online Underground uses a separate Supabase login from local game prototype. Migration/unification pending; NEVER reset or overwrite local saves or silently change player identity.
- Online profile avatars not yet linked to local images. More social features pending: private DMs, crew chat, moderation review UI, real notifications.
- Prototype scripted local chat still exists under legacy chat tab; do not mistake that for shared player chat.
- Supabase security adviser flags pre-existing SECURITY DEFINER APIs and leaked-password protection disabled; review later without breaking existing combat functions.
- Account button/avatar upload fixes need user-device verification.

### Immediate next steps
1. Verify final main branch and production deployment commits match, build/test status.
2. Test chat and personal walls using two real authenticated accounts, confirm cross-session persistence, blocking, reporting, mobile UX.
3. Check Account and upload behavior on actual phone.
4. Plan secure account linking and online avatar storage, then DMs, crew chat, notifications, moderation dashboard.

### Universal rule for every project
Warn proactively when chats grow long. Update handoff before limits, with latest verifiable commit/deploy, progress, pending bugs, links, data-safety notes and exact next tasks. Exact remaining capacity is not measurable.
