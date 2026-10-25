import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const social=read("src/components/SocialUnderworld.jsx");
const underground=read("src/components/Underground.jsx");
const nav=read("src/data/navConfig.js");
const app=read("src/App.jsx");
const api=read("src/lib/socialUnderworld.js");
const sql=read("supabase/migrations/20261025000000_social_underworld.sql");
test("Street is primary navigation and links into live Underground",()=>{
 assert.match(nav,/tab: "social", label: "Street"/);
 assert.match(app,/tab === "social"/);
 assert.match(app,/initialSection="social"/);
 assert.match(underground,/initialSection="fight"/);
 assert.match(underground,/section==="social"/);
});
test("player directory, clickable rival names and wall posts exist",()=>{
 assert.match(social,/THE CITY DIRECTORY/);
 assert.match(social,/SIGN THE WALL/);
 assert.match(social,/STREET CHAT/);
 assert.match(social,/postStreetMessage/);
 assert.match(social,/postToPlayerWall/);
 assert.match(underground,/openSocialProfile\(p.user_id\)/);
});
test("social uses authenticated REST calls, not prototype local storage",()=>{
 for(const resource of ["ss_street_messages","ss_player_wall_posts","ss_social_blocks","ss_social_reports"])assert.ok(api.includes(resource));
 assert.match(api,/Authorization:"Bearer "/);
 assert.doesNotMatch(api,/localStorage\.setItem/);
});
test("social tables have RLS, guarded authorship and throttling",()=>{
 for(const table of ["ss_street_messages","ss_player_wall_posts","ss_social_blocks","ss_social_reports"])assert.ok(sql.includes("alter table public."+table+" enable row level security"));
 assert.match(sql,/author_id=\(select auth.uid\(\)\)/);
 assert.match(sql,/security invoker/);
 assert.match(sql,/ss_social_chat_throttle/);
});
test("account navigation and avatar uploads have user-facing handling",()=>{
 assert.match(app,/destination\.scrollIntoView/);
 assert.match(app,/canvas\.toDataURL/);
 assert.match(app,/await onImageFile/);
});
