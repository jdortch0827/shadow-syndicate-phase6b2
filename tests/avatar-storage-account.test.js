import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const app=readFileSync(new URL("../src/App.jsx",import.meta.url),"utf8");
test("Avatar uploads are compressed instead of saving full-size base64",()=>{
 assert.ok(app.includes('canvas.toDataURL("image/jpeg", 0.68)'));
 assert.ok(app.includes("320 / Math.max(image.naturalWidth, image.naturalHeight)"));
});
test("Storage quota does not crash the app or duplicate the full game save",()=>{
 assert.ok(app.includes('setSaveWarning("Browser storage is full.'));
 assert.ok(!app.includes('localStorage.setItem(SAVE_KEY, JSON.stringify(game));\n  }, [game, session]);'));
});
test("Account button navigates to visible account content",()=>{
 assert.ok(app.includes('target === "account" ? document.querySelector(".focused-page-panel")'));
 assert.ok(app.includes('targetElement.scrollIntoView('));
});
