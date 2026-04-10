import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const configSource = readFileSync("utils/config.js", "utf8");
const gameSource = readFileSync("game.js", "utf8");
const apiSource = readFileSync("utils/api.js", "utf8");
const privateConfigSource = readFileSync("project.private.config.json", "utf8");

assert.match(configSource, /apiBaseUrl/);
assert.match(configSource, /127\.0\.0\.1:8000/);
assert.match(gameSource, /createRuntime/);
assert.match(gameSource, /createMainStageScreen/);
assert.match(gameSource, /registerInputHandlers/);
assert.match(apiSource, /config\.apiBaseUrl/);
assert.match(privateConfigSource, /"urlCheck"\s*:\s*false/);
