import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { buildDwellingDrawerViewModel } = require("../../src/game/view-models/dwelling-drawer.js");

const snapshot = {
  run: {
    resources: {
      spirit_stone: 88,
    },
    dwelling_level: 2,
    dwelling_facilities: [
      {
        facility_id: "spirit_field",
        display_name: "灵田",
        level: 1,
        max_level: 3,
        status: "stalled",
        monthly_resource_yields: {
          basic_herb: 3,
        },
        maintenance_cost: {
          spirit_stone: 2,
        },
        next_upgrade_cost: {
          spirit_stone: 16,
        },
        monthly_cultivation_exp_gain: 0,
      },
      {
        facility_id: "alchemy_room",
        display_name: "炼丹房",
        level: 0,
        max_level: 3,
        status: "unbuilt",
        monthly_resource_yields: {},
        maintenance_cost: {},
        next_upgrade_cost: {
          spirit_stone: 24,
        },
        monthly_cultivation_exp_gain: 0,
      },
    ],
    dwelling_last_settlement: {
      round_index: 4,
      total_maintenance_paid: {
        spirit_stone: 3,
      },
      total_resource_gains: {
        spirit_stone: 5,
      },
      entries: [
        {
          facility_id: "spirit_field",
          display_name: "灵田",
          status: "stalled",
        },
      ],
      summary_lines: ["灵田收成平稳"],
    },
  },
};

const viewModel = buildDwellingDrawerViewModel(snapshot);
assert.equal(viewModel.title, "洞府");
assert.equal(viewModel.dwellingLevel, 2);
assert.equal(viewModel.currentSpiritStone, 88);
assert.deepEqual(viewModel.summaryStats, {
  currentSpiritStone: { label: "当前灵石", value: 88, unit: "" },
  totalMaintenanceSpiritStone: { label: "每月维护", value: 2, unit: "灵石" },
});
assert.deepEqual(viewModel.productionSummaryItems, [
  { key: "basic_herb", label: "灵植", value: 3 },
  { key: "cultivation", label: "修为", value: 0 },
]);
assert.equal(viewModel.facilityCards.length, 2);
assert.equal(viewModel.facilityCards[0].action.action, "upgrade-facility");
assert.equal(viewModel.facilityCards[1].action.action, "build-facility");
assert.equal(viewModel.facilityCards[0].nextUpgradeCostSpiritStone, 16);
assert.equal(viewModel.facilityCards[0].canAfford, true);
assert.equal(viewModel.facilityCards[1].nextUpgradeCostSpiritStone, 24);
assert.equal(viewModel.facilityCards[1].canAfford, true);
assert.equal(viewModel.facilityCards[0].isStalled, true);
assert.equal(viewModel.facilityCards[1].isStalled, false);

const insufficientSnapshot = {
  run: {
    resources: {
      spirit_stone: 10,
    },
    dwelling_level: 1,
    dwelling_facilities: [
      {
        facility_id: "ore_room",
        display_name: "矿屋",
        level: 0,
        max_level: 3,
        status: "unbuilt",
        monthly_resource_yields: {},
        maintenance_cost: {},
        next_upgrade_cost: {
          spirit_stone: 45,
        },
        monthly_cultivation_exp_gain: 0,
      },
    ],
  },
};

const insufficientViewModel = buildDwellingDrawerViewModel(insufficientSnapshot);
assert.equal(insufficientViewModel.facilityCards[0].nextUpgradeCostSpiritStone, 45);
assert.equal(insufficientViewModel.facilityCards[0].canAfford, false);

const maxLevelSnapshot = {
  run: {
    resources: {
      spirit_stone: 999,
    },
    dwelling_level: 3,
    dwelling_facilities: [
      {
        facility_id: "spirit_spring",
        display_name: "灵泉",
        level: 4,
        max_level: 4,
        status: "stalled",
        monthly_resource_yields: {
          spirit_spring_water: 3,
        },
        maintenance_cost: {
          spirit_stone: 6,
        },
        next_upgrade_cost: {},
        monthly_cultivation_exp_gain: 2,
      },
    ],
  },
};

const maxLevelViewModel = buildDwellingDrawerViewModel(maxLevelSnapshot);
assert.equal(maxLevelViewModel.facilityCards[0].level, 4);
assert.equal(maxLevelViewModel.facilityCards[0].maxLevel, 4);
assert.equal(maxLevelViewModel.facilityCards[0].isMaxLevel, true);
assert.equal(maxLevelViewModel.facilityCards[0].action.label, "已满级");
assert.equal(maxLevelViewModel.facilityCards[0].action.disabled, true);

const aggregateSnapshot = {
  run: {
    resources: {
      spirit_stone: 24,
    },
    dwelling_level: 3,
    dwelling_facilities: [
      {
        facility_id: "spirit_field",
        display_name: "灵田",
        level: 1,
        max_level: 3,
        status: "active",
        monthly_resource_yields: {
          basic_herb: 2,
        },
        maintenance_cost: {
          spirit_stone: 2,
        },
        next_upgrade_cost: {
          spirit_stone: 40,
        },
        monthly_cultivation_exp_gain: 0,
      },
      {
        facility_id: "ore_room",
        display_name: "矿洞",
        level: 3,
        max_level: 3,
        status: "stalled",
        monthly_resource_yields: {
          basic_ore: 3,
          spirit_stone: 10,
        },
        maintenance_cost: {
          spirit_stone: 5,
        },
        next_upgrade_cost: {},
        monthly_cultivation_exp_gain: 0,
      },
      {
        facility_id: "spirit_spring",
        display_name: "灵泉",
        level: 0,
        max_level: 4,
        status: "unbuilt",
        monthly_resource_yields: {},
        maintenance_cost: {},
        next_upgrade_cost: {
          spirit_stone: 70,
        },
        monthly_cultivation_exp_gain: 0,
      },
    ],
    dwelling_last_settlement: {
      round_index: 12,
      total_maintenance_paid: {
        spirit_stone: 7,
      },
      total_resource_gains: {
        spirit_stone: 10,
      },
      entries: [
        {
          facility_id: "ore_room",
          display_name: "矿洞",
          status: "stalled",
        },
      ],
      summary_lines: [],
    },
  },
};

const aggregateViewModel = buildDwellingDrawerViewModel(aggregateSnapshot);
assert.equal(aggregateViewModel.summaryStats.currentSpiritStone.value, 24);
assert.equal(aggregateViewModel.summaryStats.totalMaintenanceSpiritStone.value, 7);
assert.deepEqual(aggregateViewModel.productionSummaryItems, [
  { key: "basic_herb", label: "灵植", value: 2 },
  { key: "basic_ore", label: "灵矿", value: 3 },
  { key: "spirit_stone", label: "灵石", value: 10 },
  { key: "cultivation", label: "修为", value: 0 },
]);
assert.equal(aggregateViewModel.facilityCards[0].isStalled, false);
assert.equal(aggregateViewModel.facilityCards[1].isStalled, true);

const recoveredSnapshot = {
  run: {
    resources: {
      spirit_stone: 8,
    },
    dwelling_level: 2,
    dwelling_facilities: [
      {
        facility_id: "mine_cave",
        display_name: "鐭挎礊",
        level: 1,
        max_level: 3,
        status: "active",
        monthly_resource_yields: {
          basic_ore: 2,
        },
        maintenance_cost: {
          spirit_stone: 5,
        },
        next_upgrade_cost: {
          spirit_stone: 30,
        },
        monthly_cultivation_exp_gain: 0,
      },
    ],
    dwelling_last_settlement: {
      round_index: 8,
      total_maintenance_paid: {
        spirit_stone: 0,
      },
      total_resource_gains: {},
      entries: [
        {
          facility_id: "mine_cave",
          display_name: "鐭挎礊",
          status: "stalled",
        },
      ],
      summary_lines: [],
    },
  },
};

const recoveredViewModel = buildDwellingDrawerViewModel(recoveredSnapshot);
assert.equal(recoveredViewModel.facilityCards[0].isStalled, false);
