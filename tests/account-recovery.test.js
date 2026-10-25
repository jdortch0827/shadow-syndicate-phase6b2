import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const app=read("src/App.jsx");
const auth=read("src/lib/shadowAuth.js");
const phase=read("src/data/phase.js");
const authScreen=app.slice(app.indexOf("function AuthScreen("),app.indexOf("function PageHelperCard("));
test("registered online email accounts sign in through Supabase not local password list",()=>{
 assert.match(app,/async function signIn\(username, password\)/);
 assert.match(app,/await signInShadowAccount\(identifier,password\)/);
 assert.match(app,/shadowUserFromToken\(signed\?\.access_token\)/);
 assert.match(app,/saveShadowSession\(signed\)/);
 assert.match(app,/if\(user\.onlineUserId\)return "This player uses an online account/);
});
test("legacy local username saves remain accessible but no seeded public admin is created",()=>{
 assert.match(app,/loadGameForUser\(identifier\)/);
 assert.match(app,/passwordMatches\(user,password\)/);
 const loadUsers=app.slice(app.indexOf("function loadAuthUsers()"),app.indexOf("function saveAuthUsers("));
 assert.doesNotMatch(loadUsers,/admin123|seededAdmin|ADMIN_DEFAULT/);
 assert.doesNotMatch(authScreen,/admin123|Admin recovery PIN/);
});
test("auth screen offers one submit button and explains account recovery",()=>{
 assert.match(authScreen,/submitting\?"Connecting\.\.\."/);
 assert.match(authScreen,/mode!=="signin"/);
 assert.match(authScreen,/recover-save\.html/);
 assert.match(authScreen,/Email or Legacy Username/);
 assert.match(authScreen,/await onSignIn\(username, password\)/);
});
test("old save is explicitly imported only for signed-in players without importing account passwords",()=>{
 assert.match(app,/async function restorePreviousSave\(file\)/);
 assert.match(app,/format!=="shadow-syndicate-save-transfer"/);
 assert.match(app,/shadow_syndicate_before_restore_/);
 assert.match(app,/localStorage\.setItem\(key,JSON\.stringify\(incoming\)\)/);
 assert.match(app,/function SaveTransferControls/);
 assert.doesNotMatch(app.slice(app.indexOf("async function restorePreviousSave"),app.indexOf("function resetGame()",app.indexOf("async function restorePreviousSave"))),/transfer\.password|transfer\.users/);
});
test("new release forces the phone's cached client to update",()=>{
 assert.match(phase,/APP_VERSION = "1\.69"/);
 assert.match(read("public/sw.js"),/APP_VERSION = "1\.69"/);
 assert.match(read("public/version.json"),/"version": "1\.69"/);
});
test("online password recovery uses the supported Supabase recover endpoint",()=>{
 assert.match(auth,/auth\/v1\/recover/);
 assert.match(app,/requestShadowPasswordReset\(username\)/);
});
