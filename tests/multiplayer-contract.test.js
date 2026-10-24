import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const sql=readFileSync(new URL("../supabase/migrations/20261023000100_shadow_multiplayer_foundation.sql",import.meta.url),"utf8");
test("all exposed gameplay tables have row-level security",()=>{
 for(const name of ["ss_worlds","ss_players","ss_world_members","ss_troop_stacks","ss_battle_reports","ss_action_receipts"])
 assert.ok(sql.includes(`alter table public.${name} enable row level security`),name);
});
test("client cannot directly mutate game balances or troop stacks",()=>{
 for(const name of ["ss_world_members","ss_troop_stacks","ss_battle_reports","ss_action_receipts"])
 assert.ok(!new RegExp(`create policy[^;]*on public\\.${name} for (insert|update|delete)`,"i").test(sql),name);
});
test("membership and troop data have ownership constraints",()=>{
 assert.match(sql,/foreign key\(world_id,user_id\)/);
 assert.match(sql,/user_id=\(select auth\.uid\(\)\)/);
});
