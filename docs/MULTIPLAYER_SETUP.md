# Multiplayer foundation setup

Phase 1.55 scaffolding is intentionally NOT activated on production.

## Dedicated backend required
The connected Supabase account currently contains unrelated Safety and other projects, but no identifiable Shadow Syndicate project. Do not use or alter those existing databases. Create a NEW dedicated Supabase project for Shadow Syndicate.

Apply the SQL migration in supabase/migrations/20261023000100_shadow_multiplayer_foundation.sql to the dedicated project. The migration creates world, player, membership, troop, battle report and idempotency tables with RLS.

## Environment
Set VITE_SHADOW_SUPABASE_URL and VITE_SHADOW_SUPABASE_PUBLISHABLE_KEY in the testing Netlify site only. These are public browser values. NEVER expose the Supabase service role key to the frontend.

The current browser adapter is READ-ONLY and opt-in. It cannot spend resources or change troop counts.

## Required next implementation
1. Secure sign-in through Supabase Auth and explicit transition away from legacy local administrator login.
2. Authenticated onboarding to a world, allocating unique base coordinates transactionally.
3. Dedicated trusted server functions for training, healing and raids, with auth checks, row locks, idempotency receipts, rate limits and server timestamps.
4. Two-client tests for ownership isolation, concurrency, reconnects and balance conservation.
5. Shared map view and battle report subscriptions.
6. Only after successful acceptance: replace local simulation actions with server-backed calls.

Do not merge this scaffold to production as a claim of multiplayer availability.
