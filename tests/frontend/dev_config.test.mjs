import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const configSource = readFileSync("utils/config.js", "utf8");
const appSource = readFileSync("app.js", "utf8");
const apiSource = readFileSync("utils/api.js", "utf8");

assert.match(configSource, /apiBaseUrl/);
assert.match(configSource, /127\.0\.0\.1:8000/);
assert.match(appSource, /config\.apiBaseUrl/);
assert.match(apiSource, /config\.apiBaseUrl/);
