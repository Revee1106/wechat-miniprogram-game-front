import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const beforeRun = {
  run_id: "run-1",
  round_index: 45,
  result_summary: null,
  current_event: {
    event_id: "evt_mountain_spirit_tide_001",
    event_name: "晨雾吐纳",
  },
  breakthrough_requirements: {
    target_realm_key: "foundation_early",
    target_realm_display_name: "筑基初期",
    required_cultivation_exp: 570,
    required_spirit_stone: 80,
  },
  resources: {
    spirit_stone: 65,
    herbs: 3,
    iron_essence: 0,
  },
  character: {
    cultivation_exp: 570,
    lifespan_current: 611,
    is_dead: false,
  },
};

const afterRun = {
  ...beforeRun,
  current_event: null,
  result_summary: "你细细感应晨雾中的灵气流向。",
  resources: {
    ...beforeRun.resources,
    spirit_stone: 61,
  },
  last_event_resolution: {
    event_id: "evt_mountain_spirit_tide_001",
    option_id: "opt_mountain_spirit_tide_001_absorb",
    intended_resources: {
      spirit_stone: -4,
    },
    intended_character: {
      cultivation_exp: 16,
    },
    actual_character: {
      cultivation_exp: 0,
    },
    capped_character: {
      cultivation_exp: 16,
    },
    time_cost_months: 0,
  },
};

const api = {
  async createRun() {
    return beforeRun;
  },
  async getRunState() {
    return beforeRun;
  },
  async advanceTime() {
    return beforeRun;
  },
  async resolveEvent() {
    return afterRun;
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
vm.runInNewContext(source, {
  module,
  exports: module.exports,
  require(specifier) {
    if (specifier === "./api") {
      return api;
    }
    throw new Error(`Unexpected require: ${specifier}`);
  },
  JSON,
}, {
  filename: "run-store.js",
});

const runStore = module.exports;

runStore.clearRun();
await runStore.createRun("demo-player");
const state = await runStore.resolveEvent("opt_mountain_spirit_tide_001_absorb");

assert.equal(state.eventHistory.length, 1);
assert.deepEqual(state.eventHistory[0].impactLines, [
  "灵石 -4",
  "修为 +16（已达上限，实际+0）",
]);
