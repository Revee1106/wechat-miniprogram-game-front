import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  createLocalizedApiError,
  formatFacilityName,
  formatRealmName,
  formatResourceName,
  isMissingRunError,
  localizeLegacyErrorMessage,
} = require("../../src/game/utils/display-text.js");

const apiSource = readFileSync(new URL("../../utils/api.js", import.meta.url), "utf8");
const runStoreSource = readFileSync(new URL("../../utils/run-store.js", import.meta.url), "utf8");

assert.doesNotMatch(apiSource, /Request failed:/);
assert.doesNotMatch(apiSource, /Network request failed/);
assert.doesNotMatch(runStoreSource, /No active run\. Create one first\./);
assert.match(apiSource, /createLocalizedApiError/);
assert.match(runStoreSource, /当前没有进行中的修仙历程/);

assert.equal(
  createLocalizedApiError(
    {
      detail: {
        code: "core.time.not_enough_spirit_stones",
        message: "not enough spirit stones to advance time",
        params: {},
      },
    },
    409
  ).message,
  "灵石不足，无法推进时间。"
);

assert.equal(
  createLocalizedApiError(
    { detail: "facility 'spirit_field' is already at max level" },
    409
  ).message,
  "该设施已达当前最高等级。"
);

assert.equal(
  localizeLegacyErrorMessage("run 'abc' not found"),
  "当前没有进行中的修仙历程，请先启程。"
);
assert.equal(formatRealmName("foundation_early", ""), "筑基初期");
assert.equal(formatFacilityName("spirit_field", ""), "灵田");
assert.equal(formatResourceName("spirit_spring_water", ""), "灵泉水");
assert.equal(isMissingRunError({ code: "core.run.not_found", message: "当前没有进行中的修仙历程，请先启程。" }), true);
