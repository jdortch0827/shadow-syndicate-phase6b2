# Shadow Syndicate Manual Testing Checklist

## Language fallback
- Change language to Dutch, Spanish, German, and Arabic.
- Confirm missing keys fall back to English and do not show blank text.
- Confirm Arabic switches the app to RTL direction.

## PvP / Nemesis
- Attack the same rival repeatedly until grudge reaches Personal.
- Confirm the Nemesis badge appears.
- Lose to a rival and confirm a Revenge Bonus appears.
- Complete revenge and confirm the bonus clears.

## Front damage
- Trigger a simulated rival hit or offline event.
- Confirm a damaged front shows reduced income and a repair option.
- Repair it and confirm income penalty clears.

## Save migration
- Load an older save.
- Confirm missing fields are normalized without wiping progress.

## Build
- Run npm install.
- Run npm run build.

## Phase 1.48 Manual Checks
- New player first screen shows simplified stats only.
- Top nav shows Home, Jobs, Fight, Empire, More.
- First recommended move says Run First Job before any action.
- First Night guidance can be hidden or left visible.
- Job choice buttons change expected payout/risk.
- Running a Quiet, Standard, Aggressive, and Setup job still updates save data.
- Revenge alert appears if a revenge entry exists.
- Retaliate button from Home opens/uses PvP revenge flow.
- Tribute Store opens from Empire/More.
- Mock Energy Refill restores energy.
- Mock Stamina Refill restores stamina.
- Vault Expansion increases vault capacity bonus.
- Lay Low Shield blocks attacks while active.
- Front Repair Kit repairs one damaged front.
- Beginner Layout toggle works in Settings.
- Language selector still persists.
- npm run build passes.
