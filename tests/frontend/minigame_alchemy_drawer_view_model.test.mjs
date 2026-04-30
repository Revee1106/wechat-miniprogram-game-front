import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { buildAlchemyDrawerViewModel } = require("../../src/game/view-models/alchemy-drawer.js");

const snapshot = {
  run: {
    resource_stacks: [
      { resource_key: "spirit_spring_water", amount: 4 },
    ],
    alchemy_state: {
      mastery_title: "丹道入门",
      mastery_exp: 18,
      available_recipes: [
        {
          recipe_id: "yangqi-pill",
          display_name: "养气丹",
          can_start: true,
          is_unlocked: true,
          ingredients: {
            basic_herb: 2,
            spirit_stone: 1,
          },
          description: "温养灵息。",
          effect_summary: "直接增加修为",
          effect_type: "cultivation_exp",
          effect_value: 12,
          duration_months: 2,
          base_success_rate: 0.8,
          current_success_rate: 0.88,
          quality_chances: [
            { quality: "low", display_name: "下品", chance: 0.7 },
            { quality: "mid", display_name: "中品", chance: 0.25 },
            { quality: "high", display_name: "上品", chance: 0.05 },
            { quality: "supreme", display_name: "极品", chance: 0 },
          ],
          required_alchemy_level: 0,
        },
        {
          recipe_id: "yang-yuan-pill",
          display_name: "养元丹",
          can_start: true,
          is_unlocked: true,
          ingredients: {
            basic_herb: 2,
            spirit_stone: 2,
          },
          description: "外出后调息疗伤。",
          effect_summary: "恢复气血",
          effect_type: "hp_restore",
          effect_value: 25,
          duration_months: 1,
          base_success_rate: 0.8,
          required_alchemy_level: 0,
        },
      ],
      active_job: {
        recipe_id: "yangqi-pill",
        recipe_name: "养气丹",
        remaining_months: 1,
      },
      inventory: [],
      last_result: {
        summary: "一炉成丹两枚",
      },
    },
  },
};

const viewModel = buildAlchemyDrawerViewModel(snapshot);
assert.equal(viewModel.title, "炼丹");
assert.equal(viewModel.masteryTitle, "丹道入门");
assert.equal(viewModel.spiritSpringWaterAmount, 4);
assert.equal(viewModel.hasActiveJob, true);
assert.equal(Object.hasOwn(viewModel, "spiritSpringHint"), false);
assert.equal(viewModel.recipeCards.length, 2);
assert.equal(viewModel.recipeCards[0].ingredientsText, "灵植 x2 / 灵石 x1");
assert.equal(viewModel.recipeCards[0].effectSummary, "服用后提升 12 点修为");
assert.equal(viewModel.recipeCards[0].durationText, "2 月");
assert.equal(viewModel.recipeCards[0].successRateText, "88%");
assert.equal(viewModel.recipeCards[0].qualityChanceText, "下品: 70% / 中品: 25% / 上品: 5% / 极品: 0%");
assert.equal(viewModel.recipeCards[1].effectSummary, "服用后恢复 25 点气血");
assert.equal(viewModel.recipeCards[0].action.action, "start-alchemy");
assert.equal(Object.hasOwn(viewModel.recipeCards[0], "springAction"), false);
assert.equal(Object.hasOwn(viewModel, "inventoryCards"), false);
assert.match(viewModel.activeJobSummary, /养气丹/);
assert.match(viewModel.lastResultSummary, /成丹/);
