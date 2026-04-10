import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const configSource = readFileSync("utils/config.js", "utf8");
const gameSource = readFileSync("game.js", "utf8");
const apiSource = readFileSync("utils/api.js", "utf8");
const privateConfigSource = readFileSync("project.private.config.json", "utf8");

function loadConfigWithEnvVersion(envVersion) {
  const module = { exports: {} };
  const context = {
    module,
    exports: module.exports,
    require() {
      throw new Error("config.js should not require other modules");
    },
    wx:
      envVersion === undefined
        ? undefined
        : {
            getAccountInfoSync() {
              return {
                miniProgram: {
                  envVersion,
                },
              };
            },
          },
  };

  vm.runInNewContext(configSource, context, { filename: "utils/config.js" });
  return module.exports;
}

const developConfig = loadConfigWithEnvVersion(undefined);
assert.equal(developConfig.detectEnvVersion(), "develop");
assert.equal(developConfig.apiBaseUrl, "http://127.0.0.1:8000");
assert.equal(developConfig.resolveApiBaseUrl("unknown"), "http://127.0.0.1:8000");

const trialConfig = loadConfigWithEnvVersion("trial");
assert.equal(trialConfig.detectEnvVersion(), "trial");
assert.equal(trialConfig.apiBaseUrl, trialConfig.CLOUD_API_BASE_URL);

const releaseConfig = loadConfigWithEnvVersion("release");
assert.equal(releaseConfig.detectEnvVersion(), "release");
assert.equal(releaseConfig.apiBaseUrl, releaseConfig.CLOUD_API_BASE_URL);

assert.match(configSource, /LOCAL_API_BASE_URL/);
assert.match(configSource, /CLOUD_API_BASE_URL/);
assert.match(configSource, /wx\.getAccountInfoSync/);
assert.match(gameSource, /createRuntime/);
assert.match(gameSource, /createMainStageScreen/);
assert.match(gameSource, /registerInputHandlers/);
assert.match(apiSource, /config\.apiBaseUrl/);
assert.match(privateConfigSource, /"urlCheck"\s*:\s*false/);
