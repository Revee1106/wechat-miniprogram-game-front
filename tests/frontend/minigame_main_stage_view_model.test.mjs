import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { buildMainStageViewModel, getPrimaryAction } = require("../../src/game/view-models/main-stage.js");

const emptySnapshot = {
  run: null,
  playerProfile: null,
  eventHistory: [],
  dwellingSettlementHistory: [],
};

const activeSnapshot = {
  run: {
    round_index: 7,
    resources: {
      spirit_stone: 42,
    },
    character: {
      realm: "qi_refining_mid",
      realm_display_name: "炼气中期",
      cultivation_exp: 180,
      lifespan_current: 132,
      is_dead: false,
    },
    current_event: null,
  },
  playerProfile: {
    total_rebirth_count: 2,
  },
  eventHistory: [
    {
      historyKey: "event-1",
      eventName: "林中异动",
      summary: "得灵石 12，失寿元 2 月",
      impactLines: ["灵石 +12", "寿元 -2 个月"],
    },
  ],
  dwellingSettlementHistory: [],
};

const pendingEventSnapshot = {
  ...activeSnapshot,
  run: {
    ...activeSnapshot.run,
    current_event: {
      event_id: "event-forest",
      event_name: "林中异动",
      body_text: "山风忽止，林中传来异响。",
      options: [{ option_id: "inspect" }],
    },
  },
};

const deadSnapshot = {
  ...activeSnapshot,
  run: {
    ...activeSnapshot.run,
    character: {
      ...activeSnapshot.run.character,
      is_dead: true,
      lifespan_current: 0,
    },
  },
};

const emptyViewModel = buildMainStageViewModel(emptySnapshot);
assert.equal(emptyViewModel.mode, "boot");
assert.equal(emptyViewModel.heroTitle, "问道长生");
assert.equal(emptyViewModel.logEntries.length, 1);
assert.match(emptyViewModel.logEntries[0].title, /初入尘寰/);
assert.equal(getPrimaryAction(emptySnapshot).action, "create-run");

const activeViewModel = buildMainStageViewModel(activeSnapshot);
assert.equal(activeViewModel.mode, "journey");
assert.equal(activeViewModel.topSummary.realm, "炼气中期");
assert.equal(activeViewModel.topSummary.spiritStone, 42);
assert.equal(activeViewModel.topSummary.round, 7);
assert.equal(activeViewModel.logEntries.length, 1);
assert.equal(activeViewModel.logEntries[0].title, "林中异动");
assert.match(activeViewModel.logEntries[0].detailLines[0], /灵石 \+12/);
assert.equal(getPrimaryAction(activeSnapshot).action, "advance-time");

const pendingEventViewModel = buildMainStageViewModel(pendingEventSnapshot);
assert.equal(pendingEventViewModel.mode, "event");
assert.equal(pendingEventViewModel.eventHint.title, "林中异动");
assert.equal(getPrimaryAction(pendingEventSnapshot).action, "open-event");

const deadViewModel = buildMainStageViewModel(deadSnapshot);
assert.equal(deadViewModel.mode, "summary");
assert.equal(deadViewModel.deathNotice, "此世已尽");
assert.equal(deadViewModel.logEntries[0].title, "林中异动");
assert.equal(getPrimaryAction(deadSnapshot).action, "open-summary");
