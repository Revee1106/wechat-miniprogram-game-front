import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { buildResourcesDrawerViewModel } = require("../../src/game/view-models/resources-drawer.js");
const { buildCultivationDrawerViewModel } = require("../../src/game/view-models/cultivation-drawer.js");

const snapshot = {
  run: {
    resources: {
      spirit_stone: 36,
      herbs: 12,
      iron_essence: 5,
      ore: 4,
      beast_material: 2,
      pill: 1,
      craft_material: 7,
    },
    resource_stacks: [
      { resource_key: "basic_herb", amount: 4 },
      { resource_key: "spirit_spring_water", amount: 2 },
    ],
    character: {
      cultivation_exp: 150,
      is_dead: false,
      realm: "qi_refining_mid",
      realm_display_name: "炼气中期",
    },
    breakthrough_requirements: {
      required_cultivation_exp: 200,
      required_spirit_stone: 20,
      target_realm_display_name: "炼气后期",
    },
    alchemy_state: {
      inventory: [
        {
          item_id: "yang_qi_dan",
          display_name: "养气丹",
          quality: "mid",
          amount: 1,
          effect_summary: "直接增加修为",
          effect_type: "cultivation_exp",
          effect_value: 12,
        },
      ],
    },
  },
};

const resourcesViewModel = buildResourcesDrawerViewModel(snapshot);
assert.equal(resourcesViewModel.title, "行囊");
assert.equal(resourcesViewModel.items.length, 9);
assert.equal(resourcesViewModel.items[0].key, "spirit_stone");
assert.equal(resourcesViewModel.items[0].label, "灵石");
assert.equal(resourcesViewModel.items[0].conversionRateText, "1 灵石 = 3 修为");
assert.equal(resourcesViewModel.items[0].actions.length, 3);
assert.equal(resourcesViewModel.items[0].actions[0].label, "转化一份");
assert.equal(resourcesViewModel.items[0].actions[1].label, "全部转化");
assert.equal(resourcesViewModel.items[0].actions[2].label, "输入数量转化");
assert.equal(resourcesViewModel.items[1].label, "药草");
assert.equal(resourcesViewModel.items[1].actions[0].label, "出售一份");
assert.equal(resourcesViewModel.items[1].actions[1].label, "全部出售");
assert.equal(resourcesViewModel.items[1].actions[2].label, "输入数量出售");
assert.equal(resourcesViewModel.items[3].label, "灵矿");
assert.equal(resourcesViewModel.items[4].label, "兽材");
assert.equal(resourcesViewModel.items[5].label, "养气丹");
assert.equal(resourcesViewModel.items[5].key, "alchemy_item:yang_qi_dan:mid");
assert.equal(resourcesViewModel.items[5].detailText, "中品，服用后提升 15 点修为");
assert.equal(resourcesViewModel.items[5].actions[0].action, "consume-alchemy-item");
assert.equal(resourcesViewModel.items[5].actions[0].label, "服用一枚");
assert.equal(resourcesViewModel.items[6].label, "杂材");
assert.equal(resourcesViewModel.items[7].key, "basic_herb");
assert.equal(resourcesViewModel.items[7].amount, 4);
assert.equal(resourcesViewModel.items[8].key, "spirit_spring_water");
assert.equal(resourcesViewModel.items[8].amount, 2);

const filteredResourcesViewModel = buildResourcesDrawerViewModel({
  run: {
    resources: {
      spirit_stone: 10,
      herbs: 0,
      iron_essence: 0,
      ore: 2,
      beast_material: 0,
      pill: 0,
      craft_material: 0,
      mystery_token: 0,
    },
    resource_stacks: [
      { resource_key: "basic_herb", amount: 3 },
      { resource_key: "spirit_spring_water", amount: 1 },
      { resource_key: "rare_material", amount: 0 },
    ],
  },
});
assert.deepEqual(
  filteredResourcesViewModel.items.map((item) => item.key),
  ["spirit_stone", "ore", "basic_herb", "spirit_spring_water"],
  "resources drawer should include positive stack resources from dwelling settlement output"
);

const cultivationViewModel = buildCultivationDrawerViewModel(snapshot);
assert.equal(cultivationViewModel.targetRealm, "炼气后期");
assert.equal(cultivationViewModel.canBreakthrough, false);
assert.match(cultivationViewModel.hint, /修为/);
