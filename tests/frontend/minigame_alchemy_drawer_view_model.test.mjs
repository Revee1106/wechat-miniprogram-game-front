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
            herb: 2,
            spirit_stone: 1,
          },
          description: "温养灵息。",
          duration_months: 2,
          base_success_rate: 0.8,
        },
      ],
      active_job: {
        recipe_id: "yangqi-pill",
        recipe_name: "养气丹",
        remaining_months: 1,
      },
      inventory: [
        {
          item_id: "yangqi-pill",
          display_name: "养气丹",
          quality: "中品",
          amount: 2,
          effect_summary: "服用后获得修为",
        },
      ],
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
assert.equal(viewModel.recipeCards.length, 1);
assert.equal(viewModel.recipeCards[0].action.action, "start-alchemy");
assert.equal(viewModel.recipeCards[0].springAction.action, "start-alchemy-with-spring");
assert.equal(viewModel.inventoryCards.length, 1);
assert.equal(viewModel.inventoryCards[0].consumeAction.action, "consume-item");
assert.match(viewModel.activeJobSummary, /养气丹/);
assert.match(viewModel.lastResultSummary, /成丹/);
