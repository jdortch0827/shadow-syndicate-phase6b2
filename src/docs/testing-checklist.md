# Shadow Syndicate Phase 1.50 Manual Test Checklist

## New player clarity
- New player top stats show Cash, Energy, Health, Heat, Respect, and Level only.
- Advanced stats are collapsed under Empire Details by default when Beginner Layout is on.
- Main nav shows Home, Jobs, Fight, Empire, More.
- First recommended move is Run First Job.
- Claim reward does not appear before the first action.

## Core play loop
- Run First Job works.
- Job choices show Quiet, Standard, Aggressive, and Setup.
- Quiet gives less heat and less payout.
- Aggressive gives more payout/risk without punishing Level 1 too hard.
- Heat changes correctly after jobs.
- First Night checklist advances in order.

## Fight and revenge
- Fight opens PvP Hub.
- Stamina is shown in Fight context instead of the main stat row.
- Revenge alert appears when a revenge item exists.
- Retaliate button works.
- Early PvP losses sting but do not wipe a new player.
- Nemesis and grudge display still works.

## Empire organization
- Empire hub opens.
- Vault is under Empire.
- Contacts are under Empire.
- Lieutenants are under Empire.
- Skill Points are no longer in the main top stat row.
- Event Rank is no longer in the main top stat row.
- Front damage and repair still work.

## Mock store
- Store opens from More or Empire.
- Store note says it is mock/testing only.
- Energy Refill works.
- Stamina Refill works.
- Vault Expansion works.
- Shield works.
- Store prompts only appear at logical moments.

## Settings and saves
- Beginner Layout toggle works.
- Show Advanced Stats on Home toggle works.
- Language selector still works.
- Export save works.
- Import save works.
- Old localStorage saves normalize safely.

## Build
- npm install passes.
- npm run build passes.
