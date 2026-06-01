# Phase 1.52 Navigation Button Audit

## Main page routing
- Home routes to `command`.
- Jobs routes to `jobs`.
- Fight routes to `pvp`.
- Empire routes to `empire`.
- More routes to `more`.

## Home buttons audited
- Run First Job / Run Starter Job: routes to Jobs or runs the recommended job when wired through the recommendation card.
- Buy First Front: routes to Empire from Home. Existing Empire first-property card routes to Properties or Jobs depending on cash.
- Visit Empire: routes to Empire.
- Pick a Fight / Get Revenge: routes to Fight/PvP. Revenge alert still supports direct retaliation.
- View Full Stats: routes to More / full stat area through the Home secondary card.
- More: routes to More.

## Cleanup notes
- Home no longer contains the large summary pile for Daily, Events, Campaign, Skills, Market, Safehouse, Contacts, Lieutenants, Vault, Heat, City Wire, Crew, Turf, Fronts, Rival Pressure, and full command grid.
- Those systems remain available through their existing pages and More menu routing.
- Bottom navigation remains the primary one-thumb page switcher.

## Known future cleanup
- App.jsx is still large and should continue to be split slowly.
- Several secondary pages still render from App.jsx and should be extracted in future phases.
