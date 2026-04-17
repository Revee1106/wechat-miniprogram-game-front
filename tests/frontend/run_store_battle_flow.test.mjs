import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const beforeRun = {
  run_id: "run-1",
  round_index: 8,
  current_event: {
    event_id: "evt_battle",
    event_name: "山林异动",
  },
  active_battle: {
    round_index: 1,
    allow_flee: true,
    pill_count: 1,
    player: {
      hp_current: 30,
      hp_max: 30,
      attack: 6,
      defense: 2,
      speed: 4,
    },
    enemy: {
      name: "山匪",
      hp_current: 12,
      hp_max: 12,
      attack: 4,
      defense: 1,
      speed: 3,
    },
    log_lines: ["战斗已开始。"],
  },
  resources: {
    spirit_stone: 20,
    herbs: 0,
    iron_essence: 0,
  },
  character: {
    cultivation_exp: 20,
    lifespan_current: 720,
    is_dead: false,
  },
};

const initialRun = {
  ...beforeRun,
  active_battle: null,
};

const afterRun = {
  ...beforeRun,
  current_event: null,
  result_summary: "击败山匪",
  resources: {
    ...beforeRun.resources,
    spirit_stone: 30,
  },
  character: {
    ...beforeRun.character,
    cultivation_exp: 30,
  },
  active_battle: {
    ...beforeRun.active_battle,
    round_index: 2,
    enemy: {
      ...beforeRun.active_battle.enemy,
      hp_current: 8,
    },
    log_lines: ["战斗已开始。", "你攻击山匪，造成了4点伤害。"],
  },
  last_event_resolution: {
    event_id: "evt_battle",
    option_id: "opt_fight",
    intended_resources: {
      spirit_stone: 10,
    },
    intended_character: {
      cultivation_exp: 10,
    },
    actual_character: {
      cultivation_exp: 10,
    },
    capped_character: {},
    time_cost_months: 0,
  },
};

const finishedRun = {
  ...afterRun,
  active_battle: null,
};

const api = {
  async createRun() {
    return initialRun;
  },
  async getRunState() {
    return beforeRun;
  },
  async advanceTime() {
    return beforeRun;
  },
  async resolveEvent() {
    return beforeRun;
  },
  async performBattleAction() {
    return finishedRun;
  },
  async breakthrough() {
    return {};
  },
  async buildDwellingFacility() {
    return beforeRun;
  },
  async upgradeDwellingFacility() {
    return beforeRun;
  },
  async sellResource() {
    return beforeRun;
  },
  async convertSpiritStoneToCultivation() {
    return beforeRun;
  },
  async startAlchemy() {
    return beforeRun;
  },
  async consumeAlchemyItem() {
    return beforeRun;
  },
  async rebirth() {
    return { player_profile: null, new_run: beforeRun };
  },
};

const source = readFileSync(new URL("../../utils/run-store.js", import.meta.url), "utf8");
const module = { exports: {} };
vm.runInNewContext(
  source,
  {
    module,
    exports: module.exports,
    require(specifier) {
      if (specifier === "./api") {
        return api;
      }
      throw new Error(`Unexpected require: ${specifier}`);
    },
    JSON,
  },
  {
    filename: "run-store.js",
  }
);

const runStore = module.exports;
runStore.clearRun();
await runStore.createRun("demo-player");
const startedState = await runStore.resolveEvent("opt_fight");
assert.equal(startedState.run.active_battle.round_index, 1);
assert.equal(startedState.eventHistory.length, 0);

const state = await runStore.performBattleAction("attack");

assert.equal(state.run.active_battle, null);
assert.equal(state.run.resources.spirit_stone, 30);
assert.equal(state.run.character.cultivation_exp, 30);
assert.equal(state.eventHistory.length, 1);
assert.deepEqual(state.eventHistory[0].impactLines, ["灵石 +10", "修为 +10"]);
