import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const projectConfig = JSON.parse(readFileSync("project.config.json", "utf8"));

assert.equal(projectConfig.compileType, "game");
assert.equal(projectConfig.miniprogramRoot, "./");

assert.equal(existsSync("game.js"), true);
assert.equal(existsSync("game.json"), true);
assert.equal(existsSync("src/game/core/runtime.js"), true);
assert.equal(existsSync("src/game/core/input.js"), true);
assert.equal(existsSync("src/game/ui/drawer.js"), true);
assert.equal(existsSync("src/game/theme/tokens.js"), true);
assert.equal(existsSync("src/game/screens/main-stage-screen.js"), true);

const gameSource = readFileSync("game.js", "utf8");
const gameConfig = JSON.parse(readFileSync("game.json", "utf8"));

assert.match(gameSource, /require\("\.\/src\/game\/core\/runtime"\)/);
assert.match(gameSource, /require\("\.\/src\/game\/screens\/main-stage-screen"\)/);
assert.doesNotMatch(gameSource, /require\("\.\/utils\/run-store"\)/);
assert.doesNotMatch(gameSource, /WendaoDebug/);
assert.match(gameSource, /createRuntime/);
assert.match(gameSource, /registerInputHandlers/);
assert.match(gameSource, /requestRender/);
assert.match(gameSource, /wx\.createCanvas/);
assert.match(gameSource, /getSystemInfoSync/);
assert.match(gameSource, /safeArea/);

assert.equal(gameConfig.deviceOrientation, "portrait");
