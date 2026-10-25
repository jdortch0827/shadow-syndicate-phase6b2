import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("global sign out clears online credentials but keeps saved boss",()=>{
 const app=read("src/App.jsx");
 const signOut=app.slice(app.indexOf("function signOut()"),app.indexOf("function updateCurrentDisplayName("));
 assert.ok(signOut.includes("getUserSaveKey(session.username)"));
 assert.ok(signOut.includes("clearShadowSession()"));
});
test("online onboarding reuses existing boss name without claiming account migration",()=>{
 const app=read("src/App.jsx"),lobby=read("src/components/MultiplayerLobby.jsx");
 assert.ok(app.includes("legacyHandle={currentUser?.displayName"));
 assert.ok(lobby.includes("legacyHandle"));
 assert.ok(lobby.includes("joinShadowAlpha(access,handle)"));
});
test("login fields use full width accessible controls",()=>{
 const css=read("src/index.css");
 assert.ok(css.includes(".ug-auth-fields .war-quantity input"));
 assert.ok(css.includes("width:100%!important"));
 assert.ok(css.includes("min-height:48px"));
});
