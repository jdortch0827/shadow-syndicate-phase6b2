import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const actions=readFileSync(new URL("../src/lib/alphaActions.js",import.meta.url),"utf8");
const migration=readFileSync(new URL("../supabase/migrations/20261024000300_shadow_warfare_transactions.sql",import.meta.url),"utf8");
test("all three warfare actions call authenticated RPCs",()=>{
 for(const action of ["ss_train","ss_heal","ss_raid"])assert.ok(actions.includes(action));
 assert.match(actions,/Authorization:"Bearer "/);
});
test("raid idempotency and target cooldown are database enforced",()=>{
 assert.match(migration,/ss_action_receipts/);
 assert.match(migration,/60 seconds/);
});
test("raid and training check resources and troop ownership",()=>{
 assert.match(migration,/cash>=/);
 assert.match(migration,/energy>=/);
 assert.match(migration,/available>=/);
 assert.match(migration,/auth.uid\(\)/);
});
test("battle reports are created inside raid transaction",()=>assert.match(migration,/insert into public.ss_battle_reports/));
