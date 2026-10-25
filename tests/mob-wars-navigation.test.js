import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root=new URL("../",import.meta.url);
const read=p=>readFileSync(new URL(p,root),"utf8");
test("primary Fight navigation opens real multiplayer",()=>{
 const nav=read("src/data/navConfig.js");
 assert.ok(nav.includes('{ tab: "multiplayer", label: "Fight" }'));
 assert.ok(nav.includes('"pvp"'));
});
test("practice battles clearly disclose simulated opponents",()=>{
 const app=read("src/App.jsx");
 assert.ok(app.includes("Practice Fights · Offline Training"));
 assert.ok(app.includes("ENTER LIVE MOB WARS"));
 assert.ok(app.includes("THE UNDERGROUND IS OPEN."));
});
test("experimental services cannot block live multiplayer lobby",()=>{
 const lobby=read("src/components/MultiplayerLobby.jsx");
 assert.ok(lobby.includes("Promise.allSettled"));
 assert.ok(lobby.includes("<Underground"));
});
