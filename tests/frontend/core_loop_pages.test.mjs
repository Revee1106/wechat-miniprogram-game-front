import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const homeWxml = readFileSync("pages/home/home.wxml", "utf8");
const eventWxml = readFileSync("pages/event/event.wxml", "utf8");
const summaryWxml = readFileSync("pages/summary/summary.wxml", "utf8");
const storeSource = readFileSync("utils/run-store.js", "utf8");
const apiSource = readFileSync("utils/api.js", "utf8");

assert.match(homeWxml, /Advance Time/);
assert.match(homeWxml, /player-status-card/);
assert.match(homeWxml, /resource-bar/);
assert.match(eventWxml, /event-card/);
assert.match(eventWxml, /choice-button-list/);
assert.match(summaryWxml, /Rebirth/);
assert.match(storeSource, /createRun/);
assert.match(storeSource, /resolveEvent/);
assert.match(apiSource, /\/api\/run\/create/);
assert.match(apiSource, /\/api\/run\/advance/);
