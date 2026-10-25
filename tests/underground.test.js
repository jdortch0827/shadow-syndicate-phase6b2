import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../src/components/Underground.jsx",import.meta.url),"utf8");
const api=readFileSync(new URL("../src/lib/underground.js",import.meta.url),"utf8");
const sql=readFileSync(new URL("../supabase/migrations/20261024000500_mob_pvp_attack.sql",import.meta.url),"utf8");
test("real rival fights use the authenticated server RPC",()=>{assert.match(api,/rpc\/ss_mob_attack/);assert.match(source,/attackMob\(token,p.user_id\)/)});
test("forum posts and replies persist through authenticated requests",()=>{assert.match(api,/ss_forum_threads/);assert.match(api,/ss_forum_replies/);assert.match(source,/START A DISCUSSION/);assert.match(source,/POST REPLY/)});
test("server owns mob attack, gear, cooldown and report",()=>{for(const x of ["auth.uid()","ss_mob_gear","mob_size","last_attack_at","ss_battle_reports","ss_action_receipts"])assert.ok(sql.includes(x))});
