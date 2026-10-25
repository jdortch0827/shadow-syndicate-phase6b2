import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const phase=readFileSync(new URL("../src/data/phase.js",import.meta.url),"utf8");
const sw=readFileSync(new URL("../public/sw.js",import.meta.url),"utf8");
const manifest=JSON.parse(readFileSync(new URL("../public/version.json",import.meta.url),"utf8"));
const app=readFileSync(new URL("../src/App.jsx",import.meta.url),"utf8");
const version=phase.match(/APP_VERSION = "([^"]+)"/)?.[1];
test("all update version sources match",()=>{
 assert.equal(version,manifest.version);
 assert.ok(sw.includes('APP_VERSION = "'+version+'"'));
});
test("manifest must be newer, not merely different",()=>{
 assert.match(app,/isNewerAppVersion\(remote.version, APP_VERSION\)/);
 assert.doesNotMatch(app,/remote.version !== APP_VERSION/);
});
test("update action clears banner",()=>assert.match(app,/setUpdateReady\(false\);\s*if \(waitingWorker\)/));
