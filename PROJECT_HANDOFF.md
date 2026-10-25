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

---

## Phase 1.69 — Login Recovery Hotfix (October 24 CT / October 25 UTC)
**Trigger:** User screenshot from Android of production Phase 1.68 sign-in with email rejected, banner showing only "1 Accounts", two redundant Sign In buttons, and hard-coded prototype admin login/password/PIN publicly displayed.

### Root cause verified
- Production main branch was using device/origin-specific LOCAL accounts, username+password in localStorage. Each Netlify origin has separate localStorage.
- Existing Preview #3 PR branch `fix-real-single-auth` had Phase 1.67 email/Supabase login; main Phase 1.68 had lost this login path. PR https://github.com/jdortch0827/shadow-syndicate-phase6b2/pull/3 remains OPEN and unmerged.
- Supabase Shadow Syndicate project `rmvjvvhnusgrwhpkkelz` confirmed the email in user's screenshot is already registered (no password inspected).
- The sole count was a hard-coded locally seeded admin, not proof that the user's online account was deleted.

### Hotfixes committed
- Main now accepts server-verified Supabase email sign-in via existing `signInShadowAccount`, and also retains legacy username+password login on the browser where local record exists. Session uses stable Supabase user ID mapping in local browser.
- Fresh installations no longer auto-seed `admin/admin123`. Default admin credentials/PIN removed from public login screen. Previously stored local accounts are not deleted.
- Auth screen offers one submit Sign In (no duplicate), honest online-vs-legacy explanation, password-reset email request, online account registration, and legacy PIN reset.
- Existing saves and local user records are preserved. Global legacy `SAVE_KEY` no longer overwritten by per-user autosave or update-refresh path.
- Distinct version Phase 1.69 with synchronized `src/data/phase.js`, `public/version.json`, `public/sw.js`, and `public/manifest.json` to force client update.
- Preview #3 branch now contains `public/recover-save.html` at https://deploy-preview-3--shadowsyndicate.netlify.app/recover-save.html . CI `netlify/shadowsyndicate/deploy-preview` reported SUCCESS for commit 8d6ba41923fadb94f44c54be36234aa49a9885c3.
- The preview page allows user-controlled export of old started-boss saves from original preview-origin localStorage. No passwords or credential tables are copied; export is JSON saved on device.
- Main Phase 1.69 now has `SaveTransferControls` on new-boss setup and Account page to import that backup after online sign-in, preserving the old boss. Existing active local save requires confirmation, and a backup is made before replacement.
- Account page also supports download of current saved boss for future recovery.
- Regression tests `tests/account-recovery.test.js` cover online login, legacy login, absence of hard-coded admin seed, explicit recovery, release version.
- Earlier CI reported SUCCESS on main commit 235afcf32851e5826fe929f8e1ab465ca3cd11fe (recovery import), and on e761319e59c67b5f42ee89d89468d9975c593744 (login UI); additional runs may have been cancelled by workflow concurrency as later commits arrived. Recheck FINAL build/test statuses before claiming fully verified.

### MUST verify next
1. Production site published commit equals last GitHub main commit, Netlify READY; CI tests/build SUCCESS for final commit, not merely intermediate.
2. Android user can sign in using same ONLINE email/password from Preview #3. Do not ask user to send their password.
3. On same device/browser as old preview save, export file from old preview recovery page; main Account/new-boss setup imports and displays exact name/level/cash. Never press New Player or Start Empire before recovery.
4. Test legacy username login and ensure no existing saves overwritten.
5. End-to-end test social features with two real accounts; check real chat/profile posting and screenshots.
6. Investigate production cloud-save architecture so users never have to transfer local files for future devices. Authentication is online, but full empire progression is still stored locally.
7. Before general launch, audit existing insecure browser-stored password representations and all legacy admin controls; secure authentication migration incomplete. Browser-only local admin is NOT a real server security boundary.

### User continuity rule
Apply proactive near-limit warning and copyable handoff across ALL projects. Preserve progress and user records. When handoff changes, keep this file updated.
