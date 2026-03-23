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
