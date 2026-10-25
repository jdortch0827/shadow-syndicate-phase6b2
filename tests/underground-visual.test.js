import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const component=readFileSync(new URL("../src/components/Underground.jsx",import.meta.url),"utf8");
const lobby=readFileSync(new URL("../src/components/MultiplayerLobby.jsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/index.css",import.meta.url),"utf8");
test("mobster-first experience includes fight list, grudge book, and forums",()=>{
 for(const word of ["WHO WANTS PROBLEMS?","THE GRUDGE BOOK","THE UNDERGROUND","ATTACK THIS MOB","START A DISCUSSION"])assert.ok(component.includes(word));
});
test("legacy map and army systems are secondary",()=>{
 assert.ok(!lobby.includes("Legacy Alpha Map (experimental)"));
 assert.ok(!lobby.includes("Experimental Army Systems"));
 assert.ok(lobby.includes("<Underground token={token} world={world}/>"));
});
test("responsive mobster UI has mobile and reduced motion support",()=>{
 assert.ok(css.includes(".ug-rival-card"));
 assert.ok(css.includes(".ug-forum-layout"));
 assert.ok(css.includes("@media(max-width:480px)"));
 assert.ok(css.includes("prefers-reduced-motion:reduce"));
});
