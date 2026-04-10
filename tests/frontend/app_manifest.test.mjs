import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const projectConfig = JSON.parse(readFileSync("project.config.json", "utf8"));
const gameConfig = JSON.parse(readFileSync("game.json", "utf8"));

assert.equal(projectConfig.compileType, "game");
assert.equal(projectConfig.miniprogramRoot, "./");
assert.equal(projectConfig.projectname, "wendao-core-loop");
assert.equal(projectConfig.simulatorType, "wechat");

assert.equal(gameConfig.deviceOrientation, "portrait");
