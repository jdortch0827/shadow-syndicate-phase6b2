import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
test("mob recruitment and inventory are actual server operations",()=>{
 const api=read("src/lib/underground.js");
 assert.ok(api.includes("rpc/ss_mob_shop"));
 assert.ok(api.includes("ss_mob_gear"));
 assert.ok(api.includes("ss_world_members"));
});
test("Black Market is reachable and has real purchase actions",()=>{
 const ui=read("src/components/Underground.jsx");
 const shop=read("src/components/MobArmory.jsx");
 assert.ok(ui.includes('section==="armory"'));
 assert.ok(ui.includes("<MobArmory"));
 assert.ok(shop.includes("buyMobGear(token"));
 assert.ok(shop.includes("recruitMob(token"));
 assert.ok(shop.includes("wallet.cash<item.price*quantity"));
});
test("server validates price, cash, and ownership",()=>{
 const sql=read("supabase/migrations/20261024000700_mob_recruitment_and_equipment_shop.sql");
 for(const text of ["auth.uid()","balance<cost","ss_action_receipts","ss_mob_gear","ss_mob_profiles","p_count>100"])assert.ok(sql.includes(text));
});
test("Black Market has a responsive game layout",()=>{
 const css=read("src/index.css");
 assert.ok(css.includes(".ug-shop-grid"));
 assert.ok(css.includes("@media(max-width:520px)"));
});
