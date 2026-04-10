import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { buildSummaryModalViewModel } = require("../../src/game/view-models/summary-modal.js");

const aliveSnapshot = {
  run: {
    character: {
      is_dead: false,
    },
  },
};

assert.equal(buildSummaryModalViewModel(aliveSnapshot), null);

const deadSnapshot = {
  run: {
    result_summary: "寿元已尽，止步炼气中期。",
    character: {
      is_dead: true,
      realm_display_name: "炼气中期",
    },
    resources: {
      spirit_stone: 12,
    },
  },
  playerProfile: {
    total_rebirth_count: 3,
    rebirth_points: 28,
  },
};

const viewModel = buildSummaryModalViewModel(deadSnapshot);
assert.equal(viewModel.title, "此世终卷");
assert.match(viewModel.summary, /寿元已尽/);
assert.equal(viewModel.realm, "炼气中期");
assert.equal(viewModel.rebirthCount, 3);
assert.equal(viewModel.rebirthPoints, 28);
assert.equal(viewModel.primaryAction.action, "rebirth");
