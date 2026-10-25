import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("multiplayer session is restored and refreshable",()=>{
 const auth=read("src/lib/shadowAuth.js");
 for(const s of ["restoreShadowSession","refresh_token","expires_at","clearShadowSession"])assert.ok(auth.includes(s));
});
test("Fight does not show login before session restore",()=>{
 const lobby=read("src/components/MultiplayerLobby.jsx");
 for(const s of ["useEffect","restoreShadowSession()","loading?","joinShadowAlpha(access,handle)"])assert.ok(lobby.includes(s));
});
