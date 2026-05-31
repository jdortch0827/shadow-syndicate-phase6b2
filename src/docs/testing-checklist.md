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
