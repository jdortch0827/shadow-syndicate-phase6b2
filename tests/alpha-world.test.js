import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const source = readFileSync(new URL("../src/lib/alphaWorld.js", import.meta.url), "utf8");
test("requires authenticated token", () => assert.match(source, /!accessToken/));
test("requests only selected public base columns", () => assert.match(source, /select=user_id,x,y,level/));
test("requests only troop roster columns", () => assert.match(source, /select=unit_type,available,wounded/));
test("does not expose server-side service credentials", () => assert.doesNotMatch(source, /service_role|secret_key/i));
