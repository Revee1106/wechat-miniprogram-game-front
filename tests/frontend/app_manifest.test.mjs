import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appConfig = JSON.parse(readFileSync("app.json", "utf8"));

assert.deepEqual(appConfig.pages, [
  "pages/home/home",
  "pages/event/event",
  "pages/cultivation/cultivation",
  "pages/crafting/crafting",
  "pages/dwelling/dwelling",
  "pages/summary/summary",
]);
assert.equal(appConfig.window.navigationBarTitleText, "山海异志");
assert.equal(appConfig.window.navigationBarBackgroundColor, "#203f3a");
assert.equal(appConfig.window.backgroundColor, "#efe4c8");
