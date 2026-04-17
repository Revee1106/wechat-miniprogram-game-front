import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { buildBattleModalViewModel } = require("../../src/game/view-models/battle-modal.js");

const snapshot = {
  run: {
    character: {
      realm: "qi_refining_mid",
      realm_display_name: "炼气中期",
    },
    active_battle: {
      round_index: 3,
      allow_flee: false,
      pill_count: 0,
      player: {
        realm_label: "炼气中期",
        hp_current: 18,
        hp_max: 30,
        attack: 7,
        defense: 3,
        speed: 5,
      },
      enemy: {
        name: "山匪",
        realm_label: "炼气初期",
        hp_current: 9,
        hp_max: 12,
        attack: 4,
        defense: 1,
        speed: 2,
      },
      log_lines: ["你攻击山匪，造成了4点伤害。", "山匪攻击你，造成了2点伤害。"],
    },
  },
};

const viewModel = buildBattleModalViewModel(snapshot);

assert.equal(viewModel.title, "遭遇 山匪");
assert.equal(viewModel.subtitle, "第 3 回合");
assert.equal(viewModel.player.hpCurrent, 18);
assert.equal(viewModel.enemy.hpCurrent, 9);
assert.deepEqual(viewModel.logLines, ["你攻击山匪，造成了4点伤害。", "山匪攻击你，造成了2点伤害。"]);
assert.equal(viewModel.actions.find((item) => item.action === "use_pill").disabled, true);
assert.equal(viewModel.actions.find((item) => item.action === "flee").disabled, true);
assert.equal(buildBattleModalViewModel({ run: { active_battle: null } }), null);

