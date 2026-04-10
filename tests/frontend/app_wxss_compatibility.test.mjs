import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appWxssSource = readFileSync("app.wxss", "utf8");

assert.doesNotMatch(appWxssSource, /--[a-z0-9-]+\s*:/i);
assert.doesNotMatch(appWxssSource, /var\(/i);
assert.doesNotMatch(appWxssSource, /display\s*:\s*grid/i);
assert.doesNotMatch(appWxssSource, /grid-template-columns\s*:/i);
assert.doesNotMatch(appWxssSource, /minmax\(/i);
assert.doesNotMatch(appWxssSource, /repeat\(/i);
