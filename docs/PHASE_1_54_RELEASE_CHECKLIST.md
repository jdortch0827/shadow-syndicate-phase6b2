# Phase 1.54 release checklist — War Room

## Delivered in preview branch
- Train three troop tiers: Runners, Enforcers, Specialists.
- Training deducts existing cash and energy.
- Deploy selected troops against three simulated positions.
- Deterministic win/loss based on deployed attack vs target power.
- Wounded go to hospital; heal with cash; battle reports retained.
- Empire and More navigation entries.
- Save normalization preserves old saves and introduces warfare defaults.
- Node test suite and CI build workflow.
- Responsive mobile War Room.

## Manual acceptance test (required before merging to main)
1. Sign in with a TEST account and export a backup.
2. Open Empire > War Room and More > War Room.
3. Train one Runner: cash -80, energy -2, troops +1.
4. Train 25 Runners; verify quantities 0, -1, 26, fractions are rejected.
5. Verify Enforcers locked below level 2, Specialists below level 3.
6. Attempt a raid with more units than owned: no deduction or report.
7. Attack Dockside Patrol with insufficient power: defeat, wounded moved to hospital.
8. Heal wounded: correct cash deduction, wounded cleared, active troops restored.
9. Attack with enough power: reward paid exactly once, battle report appears.
10. Reload page and log out/in: troops, hospital, and reports persist.
11. Open a pre-1.54 save: existing cash, properties, and progress remain intact.
12. Test narrow mobile screen and keyboard-only controls.
13. Verify no runtime errors or failing build/test checks.
14. Verify production remains Phase 1.52 until release is explicitly approved.

## Known limitations
- The raid targets are bots, not real players.
- Client-side cash and combat are not tamper-resistant.
- No server-side anti-cheat, matchmaking, marches, timers, alliances, rallies, or world map.
- Default local administrator credentials must be replaced before public multiplayer.
- This branch must not be described as production multiplayer.

## Release gate
Do not merge until npm test, npm run build, Netlify preview, and manual acceptance all pass.
