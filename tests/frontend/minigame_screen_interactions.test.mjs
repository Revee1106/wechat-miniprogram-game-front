import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createMainStageScreen } = require("../../src/game/screens/main-stage-screen.js");
const { createViewportLayout } = require("../../src/game/core/layout.js");
const { drawEventModal } = require("../../src/game/screens/event-modal.js");
const { drawConfirmModal } = require("../../src/game/screens/confirm-modal.js");

testDrawerOverlayBlocksClickThrough();
await testAdvanceInsufficientSpiritStoneShowsPenaltyConfirm();
await testResourcesDrawerSupportsSellAllAndPromptedQuantity();
await testResourcesDrawerConsumesConcretePill();
testMaxLevelDwellingButtonDoesNotOpenConfirm();
testLockedAlchemyTagIsHidden();
testDwellingUsesThirdSlotInFirstRow();
testUnlockedAlchemyUsesFirstSlotInSecondRow();
testAlchemyRecipeTapSelectsDetailDrawer();
await testAlchemyRecipeDetailButtonStartsAlchemy();
testEventModalBlocksClickThrough();
testBattleModalBlocksClickThrough();
await testBattleActionTapCallsAdapter();
testEventModalExpandsWrappedOptionHitRegion();
testSummaryModalBlocksClickThrough();
testConfirmModalBlocksClickThrough();
testConfirmModalWrapsLongBodyLines();
await testEventResolutionDoesNotShowToast();

function testDrawerOverlayBlocksClickThrough() {
  const snapshot = {
    run: {
      round_index: 3,
      resources: {
        spirit_stone: 90,
        herbs: 3,
        iron_essence: 0,
        ore: 0,
        beast_material: 0,
        pill: 0,
        craft_material: 0,
      },
      character: {
        realm: "qi_refining_early",
        realm_display_name: "炼气初期",
        cultivation_exp: 37,
        lifespan_current: 717,
        is_dead: false,
      },
      current_event: null,
    },
    playerProfile: null,
    eventHistory: [],
    dwellingSettlementHistory: [],
  };

  let advanceTimeCalls = 0;
  const adapter = createAdapter(snapshot, {
    async advanceTime() {
      advanceTimeCalls += 1;
    },
  });

  const screen = createMainStageScreen({
    adapter,
    requestRender() {},
  });
  const frame = createFrame();
  const viewport = createViewportLayout(frame.width, frame.height, { safeArea: null });

  screen.render(frame);
  screen.handleTouchEnd(createTap(viewport.contentLeft + 24, viewport.footerTop + 32));
  screen.render(frame);
  screen.handleTouchEnd(
    createTap(viewport.contentLeft + viewport.contentWidth / 2, viewport.primaryButtonY + viewport.primaryButtonHeight / 2)
  );

  assert.equal(advanceTimeCalls, 0, "drawer overlay should block click-through to the primary action");
}

async function testAdvanceInsufficientSpiritStoneShowsPenaltyConfirm() {
  const snapshot = {
    run: {
      round_index: 3,
      resources: {
        spirit_stone: 0,
      },
      current_spirit_stone_cost_per_advance: 2,
      character: {
        realm: "qi_refining_early",
        realm_display_name: "炼气初期",
        cultivation_exp: 50,
        lifespan_current: 717,
        is_dead: false,
      },
      breakthrough_requirements: {
        required_cultivation_exp: 100,
      },
      current_event: null,
    },
    playerProfile: null,
    eventHistory: [],
    dwellingSettlementHistory: [],
  };

  const advanceCalls = [];
  const screen = createMainStageScreen({
    adapter: createAdapter(snapshot, {
      async advanceTime(allowCultivationPenalty) {
        advanceCalls.push(Boolean(allowCultivationPenalty));
      },
    }),
    requestRender() {},
  });
  const frame = createFrame();
  const viewport = createViewportLayout(frame.width, frame.height, { safeArea: null });

  screen.render(frame);
  screen.handleTouchEnd(
    createTap(viewport.contentLeft + viewport.contentWidth / 2, viewport.primaryButtonY + viewport.primaryButtonHeight / 2)
  );
  await flushAsyncWork();

  const renderedTexts = [];
  screen.render(
    createFrame({
      fillText(text) {
        renderedTexts.push(String(text));
      },
    })
  );
  screen.handleTouchEnd(createTap(260, 470));
  await flushAsyncWork();

  assert.equal(renderedTexts.includes("灵石不足"), true, "insufficient spirit stone should show a confirm dialog");
  assert.equal(renderedTexts.includes("继续推进"), true, "confirm dialog should offer penalty advance");
  assert.deepEqual(advanceCalls, [true]);
}

function testLockedAlchemyTagIsHidden() {
  const renderedTexts = [];
  const screen = createMainStageScreen({
    adapter: createAdapter({
      run: {
        round_index: 2,
        resources: {
          spirit_stone: 20,
        },
        character: {
          realm: "qi_refining_early",
          realm_display_name: "炼气初期",
          cultivation_exp: 18,
          lifespan_current: 719,
          is_dead: false,
        },
        current_event: null,
        dwelling_facilities: [
          {
            facility_id: "alchemy_room",
            display_name: "炼丹房",
            level: 0,
          },
        ],
      },
      playerProfile: null,
      eventHistory: [],
      dwellingSettlementHistory: [],
    }),
    requestRender() {},
  });

  screen.render(
    createFrame({
      fillText(text) {
        renderedTexts.push(String(text));
      },
    })
  );

  assert.equal(renderedTexts.includes("炼丹"), false, "alchemy should stay hidden until the alchemy room is built");
}

function testMaxLevelDwellingButtonDoesNotOpenConfirm() {
  const snapshot = {
    run: {
      round_index: 2,
      resources: {
        spirit_stone: 999,
      },
      character: {
        realm: "qi_refining_early",
        realm_display_name: "炼气初期",
        cultivation_exp: 18,
        lifespan_current: 719,
        is_dead: false,
      },
      current_event: null,
      dwelling_level: 2,
      dwelling_facilities: [
        {
          facility_id: "spirit_spring",
          display_name: "灵泉",
          level: 4,
          max_level: 4,
          status: "max_level",
          maintenance_cost: {
            spirit_stone: 6,
          },
          monthly_resource_yields: {
            spirit_spring_water: 3,
          },
          next_upgrade_cost: {},
          monthly_cultivation_exp_gain: 2,
        },
      ],
    },
    playerProfile: null,
    eventHistory: [],
    dwellingSettlementHistory: [],
  };

  let renderCount = 0;
  const screen = createMainStageScreen({
    adapter: createAdapter(snapshot),
    requestRender() {
      renderCount += 1;
    },
  });
  const frame = createFrame();
  const viewport = createViewportLayout(frame.width, frame.height, { safeArea: null });
  const dwellingTagCenter = getTagCenter(viewport, 0, 2);

  screen.render(frame);
  screen.handleTouchEnd(createTap(dwellingTagCenter.x, dwellingTagCenter.y));
  screen.render(frame);

  const previousRenderCount = renderCount;
  const drawerY = frame.height * 0.24;
  screen.handleTouchEnd(createTap(100, 460));

  assert.equal(renderCount, previousRenderCount, "max level facility button should stay disabled");
}

function testDwellingUsesThirdSlotInFirstRow() {
  const snapshot = {
    run: {
      round_index: 2,
      resources: {
        spirit_stone: 20,
      },
      character: {
        realm: "qi_refining_early",
        realm_display_name: "炼气初期",
        cultivation_exp: 18,
        lifespan_current: 719,
        is_dead: false,
      },
      current_event: null,
      dwelling_level: 1,
      dwelling_facilities: [
        {
          facility_id: "spirit_field",
          display_name: "灵田",
          level: 1,
          maintenance_cost: {
            spirit_stone: 0,
          },
          monthly_resource_yields: {},
          next_upgrade_cost: {
            spirit_stone: 20,
          },
          monthly_cultivation_exp_gain: 0,
        },
        {
          facility_id: "alchemy_room",
          display_name: "炼丹房",
          level: 0,
          maintenance_cost: {
            spirit_stone: 0,
          },
          monthly_resource_yields: {},
          next_upgrade_cost: {
            spirit_stone: 40,
          },
          monthly_cultivation_exp_gain: 0,
        },
      ],
    },
    playerProfile: null,
    eventHistory: [],
    dwellingSettlementHistory: [],
  };

  const screen = createMainStageScreen({
    adapter: createAdapter(snapshot),
    requestRender() {},
  });
  const frame = createFrame();
  const viewport = createViewportLayout(frame.width, frame.height, { safeArea: null });
  const dwellingTagCenter = getTagCenter(viewport, 0, 2);

  screen.render(frame);
  screen.handleTouchEnd(createTap(dwellingTagCenter.x, dwellingTagCenter.y));

  const renderedTexts = [];
  screen.render(
    createFrame({
      fillText(text) {
        renderedTexts.push(String(text));
      },
    })
  );

  assert.equal(renderedTexts.includes("洞府"), true, "dwelling should open from the third slot in the first row");
}

function testUnlockedAlchemyUsesFirstSlotInSecondRow() {
  const snapshot = {
    run: {
      round_index: 2,
      resources: {
        spirit_stone: 20,
      },
      character: {
        realm: "qi_refining_early",
        realm_display_name: "炼气初期",
        cultivation_exp: 18,
        lifespan_current: 719,
        is_dead: false,
      },
      current_event: null,
      dwelling_facilities: [
        {
          facility_id: "alchemy_room",
          display_name: "炼丹房",
          level: 1,
          maintenance_cost: {
            spirit_stone: 0,
          },
          monthly_resource_yields: {},
          next_upgrade_cost: {
            spirit_stone: 40,
          },
          monthly_cultivation_exp_gain: 0,
        },
      ],
      alchemy_state: {
        mastery_title: "丹道已开",
        mastery_exp: 0,
        available_recipes: [
          {
            recipe_id: "yangqi-pill",
            display_name: "养气丹",
            can_start: true,
            ingredients: {
              basic_herb: 2,
            },
          },
        ],
        inventory: [],
      },
    },
    playerProfile: null,
    eventHistory: [],
    dwellingSettlementHistory: [],
  };

  const screen = createMainStageScreen({
    adapter: createAdapter(snapshot),
    requestRender() {},
  });
  const frame = createFrame();
  const viewport = createViewportLayout(frame.width, frame.height, { safeArea: null, footerTagRows: 2 });
  const alchemyTagCenter = getTagCenter(viewport, 1, 0);

  screen.render(frame);
  screen.handleTouchEnd(createTap(alchemyTagCenter.x, alchemyTagCenter.y));

  const renderedTexts = [];
  screen.render(
    createFrame({
      fillText(text) {
        renderedTexts.push(String(text));
      },
    })
  );

  assert.equal(renderedTexts.includes("养气丹"), true, "alchemy should open from the first slot in the second row");
}

function testAlchemyRecipeTapSelectsDetailDrawer() {
  const snapshot = {
    run: {
      round_index: 2,
      resources: {
        spirit_stone: 20,
      },
      resource_stacks: [],
      character: {
        realm: "qi_refining_early",
        realm_display_name: "炼气初期",
        cultivation_exp: 18,
        lifespan_current: 719,
        is_dead: false,
      },
      current_event: null,
      dwelling_facilities: [
        {
          facility_id: "alchemy_room",
          display_name: "炼丹房",
          level: 1,
        },
      ],
      alchemy_state: {
        mastery_title: "丹道已开",
        mastery_exp: 0,
        available_recipes: [
          {
            recipe_id: "yangqi-pill",
            display_name: "养气丹",
            can_start: true,
            ingredients: {
              basic_herb: 2,
            },
            description: "前期主力修炼丹。",
            effect_summary: "直接增加修为",
            effect_type: "cultivation_exp",
            effect_value: 12,
            duration_months: 1,
            base_success_rate: 0.86,
            required_alchemy_level: 0,
          },
        ],
        inventory: [],
      },
    },
    playerProfile: null,
    eventHistory: [],
    dwellingSettlementHistory: [],
  };

  let startAlchemyCalls = 0;
  const screen = createMainStageScreen({
    adapter: createAdapter(snapshot, {
      async startAlchemy() {
        startAlchemyCalls += 1;
      },
    }),
    requestRender() {},
  });
  const frame = createFrame();
  const viewport = createViewportLayout(frame.width, frame.height, { safeArea: null, footerTagRows: 2 });
  const alchemyTagCenter = getTagCenter(viewport, 1, 0);

  screen.render(frame);
  screen.handleTouchEnd(createTap(alchemyTagCenter.x, alchemyTagCenter.y));
  screen.render(frame);
  screen.handleTouchEnd(createTap(60, 372));

  const renderedTexts = [];
  screen.render(
    createFrame({
      fillText(text) {
        renderedTexts.push(String(text));
      },
    })
  );

  assert.equal(startAlchemyCalls, 0, "tapping a recipe chip should only select it");
  assert.equal(renderedTexts.includes("作用: 服用后提升 12 点修为"), true, "selected recipe should show details in the drawer");
  assert.equal(renderedTexts.includes("开炉"), true, "selected recipe detail should expose the start button");
  assert.equal(renderedTexts.includes("知道了"), false, "recipe details should not use the modal action");
}

async function testAlchemyRecipeDetailButtonStartsAlchemy() {
  const snapshot = {
    run: {
      round_index: 2,
      resources: {
        spirit_stone: 20,
      },
      resource_stacks: [],
      character: {
        realm: "qi_refining_early",
        realm_display_name: "炼气初期",
        cultivation_exp: 18,
        lifespan_current: 719,
        is_dead: false,
      },
      current_event: null,
      dwelling_facilities: [
        {
          facility_id: "alchemy_room",
          display_name: "炼丹房",
          level: 1,
        },
      ],
      alchemy_state: {
        mastery_title: "丹道已开",
        mastery_exp: 0,
        available_recipes: [
          {
            recipe_id: "yangqi-pill",
            display_name: "养气丹",
            can_start: true,
            ingredients: {
              basic_herb: 2,
            },
            description: "前期主力修炼丹。",
            effect_summary: "直接增加修为",
            effect_type: "cultivation_exp",
            effect_value: 12,
            duration_months: 1,
            base_success_rate: 0.86,
            required_alchemy_level: 0,
          },
        ],
        inventory: [],
      },
    },
    playerProfile: null,
    eventHistory: [],
    dwellingSettlementHistory: [],
  };

  const startAlchemyCalls = [];
  const screen = createMainStageScreen({
    adapter: createAdapter(snapshot, {
      async startAlchemy(recipeId) {
        startAlchemyCalls.push({ recipeId });
      },
    }),
    requestRender() {},
  });
  const frame = createFrame();
  const viewport = createViewportLayout(frame.width, frame.height, { safeArea: null, footerTagRows: 2 });
  const alchemyTagCenter = getTagCenter(viewport, 1, 0);

  screen.render(frame);
  screen.handleTouchEnd(createTap(alchemyTagCenter.x, alchemyTagCenter.y));
  screen.render(frame);
  screen.handleTouchEnd(createTap(60, 372));
  screen.render(frame);
  screen.handleTouchEnd(createTap(187, 756));
  await flushAsyncWork();

  assert.deepEqual(startAlchemyCalls, [
    { recipeId: "yangqi-pill" },
  ]);
}

function testEventModalBlocksClickThrough() {
  const snapshot = {
    run: {
      round_index: 1,
      resources: {
        spirit_stone: 12,
      },
      character: {
        realm: "qi_refining_early",
        realm_display_name: "炼气初期",
        cultivation_exp: 8,
        lifespan_current: 719,
        is_dead: false,
      },
      current_event: {
        event_name: "山门异闻",
        body_text: "前方传来新的消息。",
        options: [
          {
            option_id: "observe",
            title_text: "静观其变",
            is_available: true,
          },
        ],
      },
    },
    playerProfile: null,
    eventHistory: [],
    dwellingSettlementHistory: [],
  };

  let renderCount = 0;
  const screen = createMainStageScreen({
    adapter: createAdapter(snapshot),
    requestRender() {
      renderCount += 1;
    },
  });
  const frame = createFrame();
  const viewport = createViewportLayout(frame.width, frame.height, { safeArea: null });

  screen.render(frame);
  screen.handleTouchEnd(createTap(viewport.contentLeft + 24, viewport.footerTop + 32));

  assert.equal(renderCount, 0, "event modal should block taps from reaching the bottom drawer tags");
}

function testBattleModalBlocksClickThrough() {
  const snapshot = {
    run: {
      round_index: 1,
      resources: {
        spirit_stone: 12,
      },
      character: {
        realm: "qi_refining_early",
        realm_display_name: "鐐兼皵鍒濇湡",
        cultivation_exp: 8,
        lifespan_current: 719,
        is_dead: false,
      },
      current_event: {
        event_name: "灞遍棬寮傞椈",
        body_text: "鍓嶆柟浼犳潵鏂扮殑娑堟伅銆?",
        options: [],
      },
      active_battle: {
        round_index: 1,
        allow_flee: true,
        pill_count: 1,
        player: {
          realm_label: "鐐兼皵鍒濇湡",
          hp_current: 20,
          hp_max: 20,
          attack: 5,
          defense: 2,
          speed: 3,
        },
        enemy: {
          name: "灞卞尓",
          realm_label: "鐐兼皵鍒濇湡",
          hp_current: 12,
          hp_max: 12,
          attack: 3,
          defense: 1,
          speed: 2,
        },
        log_lines: ["battle started"],
      },
    },
    playerProfile: null,
    eventHistory: [],
    dwellingSettlementHistory: [],
  };

  let renderCount = 0;
  const screen = createMainStageScreen({
    adapter: createAdapter(snapshot),
    requestRender() {
      renderCount += 1;
    },
  });
  const frame = createFrame();
  const viewport = createViewportLayout(frame.width, frame.height, { safeArea: null });

  screen.render(frame);
  screen.handleTouchEnd(createTap(viewport.contentLeft + 24, viewport.footerTop + 32));

  assert.equal(renderCount, 0, "battle modal should block taps from reaching the bottom drawer tags");
}

async function testBattleActionTapCallsAdapter() {
  const snapshot = {
    run: {
      round_index: 1,
      resources: {
        spirit_stone: 12,
      },
      character: {
        realm: "qi_refining_early",
        realm_display_name: "鐐兼皵鍒濇湡",
        cultivation_exp: 8,
        lifespan_current: 719,
        is_dead: false,
      },
      current_event: {
        event_name: "灞遍棬寮傞椈",
        body_text: "鍓嶆柟浼犳潵鏂扮殑娑堟伅銆?",
        options: [],
      },
      active_battle: {
        round_index: 1,
        allow_flee: true,
        pill_count: 1,
        player: {
          realm_label: "鐐兼皵鍒濇湡",
          hp_current: 20,
          hp_max: 20,
          attack: 5,
          defense: 2,
          speed: 3,
        },
        enemy: {
          name: "灞卞尓",
          realm_label: "鐐兼皵鍒濇湡",
          hp_current: 12,
          hp_max: 12,
          attack: 3,
          defense: 1,
          speed: 2,
        },
        log_lines: ["battle started"],
      },
    },
    playerProfile: null,
    eventHistory: [],
    dwellingSettlementHistory: [],
  };

  const actions = [];
  const screen = createMainStageScreen({
    adapter: createAdapter(snapshot, {
      async performBattleAction(action) {
        actions.push(action);
      },
    }),
    requestRender() {},
  });
  const frame = createFrame();

  screen.render(frame);
  screen.handleTouchEnd(createTap(110, 420));
  await flushAsyncWork();

  assert.deepEqual(actions, ["attack"]);
}

function testEventModalExpandsWrappedOptionHitRegion() {
  const hitRegions = [];
  const frame = createFrame({
    measureText(text) {
      return {
        width: String(text || "").length * 16,
      };
    },
  });

  drawEventModal(
    frame.context,
    { width: frame.width, height: frame.height },
    {
      title: "游商问价",
      body: "一名挑担游商在山脚歇脚，见你经过，便笑着招呼你帮忙托看几样低阶杂货。",
      options: [
        {
          optionId: "ask-around",
          title: "替他在坊市多问几家，再帮着出手",
          timeCostText: "额外耗时 3个月",
          disabled: false,
        },
        {
          optionId: "nearby-stall",
          title: "就近找个摊位，能卖便卖",
          timeCostText: "额外耗时 1个月",
          disabled: false,
        },
      ],
    },
    (region) => hitRegions.push(region),
    () => {}
  );

  assert.equal(hitRegions.length, 2);
  assert.ok(hitRegions[0].height > 72, "wrapped option titles should expand the option hit region height");
  assert.ok(
    hitRegions[1].y >= hitRegions[0].y + hitRegions[0].height + 10,
    "following options should move down after a taller wrapped option"
  );
}

function testSummaryModalBlocksClickThrough() {
  const snapshot = {
    run: {
      round_index: 4,
      result_summary: "寿元已尽。",
      resources: {
        spirit_stone: 23,
      },
      character: {
        realm: "qi_refining_early",
        realm_display_name: "炼气初期",
        cultivation_exp: 65,
        lifespan_current: 0,
        is_dead: true,
      },
      current_event: null,
    },
    playerProfile: {
      total_rebirth_count: 2,
      rebirth_points: 5,
    },
    eventHistory: [],
    dwellingSettlementHistory: [],
  };

  let renderCount = 0;
  const screen = createMainStageScreen({
    adapter: createAdapter(snapshot),
    requestRender() {
      renderCount += 1;
    },
  });
  const frame = createFrame();
  const viewport = createViewportLayout(frame.width, frame.height, { safeArea: null });

  screen.render(frame);
  screen.handleTouchEnd(createTap(viewport.contentLeft + 24, viewport.footerTop + 32));

  assert.equal(renderCount, 0, "summary modal should block taps from reaching the bottom drawer tags");
}

function testConfirmModalBlocksClickThrough() {
  const snapshot = {
    run: {
      round_index: 2,
      resources: {
        spirit_stone: 100,
      },
      character: {
        realm: "qi_refining_early",
        realm_display_name: "炼气初期",
        cultivation_exp: 15,
        lifespan_current: 719,
        is_dead: false,
      },
      current_event: null,
      dwelling_level: 1,
      dwelling_facilities: [
        {
          facility_id: "spirit_field",
          display_name: "灵田",
          level: 0,
          maintenance_cost: {
            spirit_stone: 0,
          },
          monthly_resource_yields: {
            herb: 0,
            ore: 0,
            spirit_stone: 0,
          },
          monthly_cultivation_exp_gain: 0,
          next_upgrade_cost: {
            spirit_stone: 50,
          },
        },
      ],
    },
    playerProfile: null,
    eventHistory: [],
    dwellingSettlementHistory: [],
  };

  let advanceTimeCalls = 0;
  let buildCalls = 0;
  let renderCount = 0;
  const screen = createMainStageScreen({
    adapter: createAdapter(snapshot, {
      async advanceTime() {
        advanceTimeCalls += 1;
      },
      async buildDwellingFacility() {
        buildCalls += 1;
      },
    }),
    requestRender() {
      renderCount += 1;
    },
  });
  const frame = createFrame();
  const viewport = createViewportLayout(frame.width, frame.height, { safeArea: null });
  const dwellingTagCenter = getTagCenter(viewport, 0, 2);

  screen.render(frame);
  screen.handleTouchEnd(createTap(dwellingTagCenter.x, dwellingTagCenter.y));
  screen.render(frame);

  const drawerY = frame.height * 0.24;
  screen.handleTouchEnd(createTap(100, 460));
  screen.render(frame);

  const previousRenderCount = renderCount;
  screen.handleTouchEnd(
    createTap(viewport.contentLeft + viewport.contentWidth / 2, viewport.primaryButtonY + viewport.primaryButtonHeight / 2)
  );

  assert.equal(advanceTimeCalls, 0, "confirm modal should block the underlying primary action");
  assert.equal(buildCalls, 0, "confirm modal backdrop tap should not confirm the dwelling action");
  assert.equal(renderCount, previousRenderCount + 1, "confirm modal backdrop tap should only close the modal itself");
}

function testConfirmModalWrapsLongBodyLines() {
  const drawnTexts = [];
  const frame = createFrame({
    fillText(text, x, y) {
      drawnTexts.push({ text: String(text), x, y });
    },
    measureText(text) {
      return {
        width: String(text || "").length * 16,
      };
    },
  });

  drawConfirmModal(
    frame.context,
    { width: frame.width, height: frame.height },
    {
      title: "Recipe",
      bodyLines: [
        "effect:abcdefghijklmnopqrstuvwxyz",
        "borrow spring:abcdefghijklmnopqrstuvwxyz",
      ],
      confirmText: "OK",
      showCancel: false,
    },
    () => {},
    {
      onCancel() {},
      onConfirm() {},
    }
  );

  const bodyTexts = drawnTexts.filter((item) => item.y > 330 && item.y < 520).map((item) => item.text);
  assert.ok(bodyTexts.length > 2, "long confirm modal body lines should wrap onto additional rows");
  assert.equal(
    bodyTexts.includes("effect:abcdefghijklmnopqrstuvwxyz"),
    false,
    "wrapped confirm modal should not draw the full overflowing body line"
  );
}

async function testEventResolutionDoesNotShowToast() {
  const snapshot = {
    run: {
      round_index: 1,
      resources: {
        spirit_stone: 12,
      },
      character: {
        realm: "qi_refining_early",
        realm_display_name: "炼气初期",
        cultivation_exp: 8,
        lifespan_current: 719,
        is_dead: false,
      },
      current_event: {
        event_name: "山门异闻",
        body_text: "前方传来新的消息。",
        options: [
          {
            option_id: "observe",
            title_text: "静观其变",
            is_available: true,
          },
        ],
      },
    },
    playerProfile: null,
    eventHistory: [],
    dwellingSettlementHistory: [],
  };

  const screen = createMainStageScreen({
    adapter: createAdapter(snapshot, {
      async resolveEvent() {
        snapshot.run.current_event = null;
      },
    }),
    requestRender() {},
  });
  const frame = createFrame();

  screen.render(frame);
  screen.handleTouchEnd(createTap(187.5, 370));
  await flushAsyncWork();

  const renderedTexts = [];
  const verifyFrame = createFrame({
    fillText(text) {
      renderedTexts.push(String(text));
    },
  });
  screen.render(verifyFrame);

  assert.equal(snapshot.run.current_event, null, "event option tap should resolve the current event");
  assert.equal(renderedTexts.includes("事件已结算"), false, "resolving an event should not show a settlement toast");
}

async function testResourcesDrawerSupportsSellAllAndPromptedQuantity() {
  const snapshot = {
    run: {
      round_index: 3,
      resources: {
        spirit_stone: 90,
        herbs: 3,
        iron_essence: 0,
        ore: 0,
        beast_material: 0,
        pill: 0,
        craft_material: 0,
      },
      resource_stacks: [
        {
          resource_key: "basic_ore",
          amount: 5,
        },
      ],
      character: {
        realm: "qi_refining_early",
        realm_display_name: "炼气初期",
        cultivation_exp: 37,
        lifespan_current: 717,
        is_dead: false,
      },
      current_event: null,
    },
    playerProfile: null,
    eventHistory: [],
    dwellingSettlementHistory: [],
  };

  const saleCalls = [];
  const originalWx = globalThis.wx;
  globalThis.wx = {
    showModal(options) {
      options.success({
        confirm: true,
        cancel: false,
        content: "3",
      });
    },
  };

  try {
    const screen = createMainStageScreen({
      adapter: createAdapter(snapshot, {
        async sellResource(resourceKey, amount) {
          saleCalls.push({ resourceKey, amount });
        },
      }),
      requestRender() {},
    });
    const frame = createFrame();
    const viewport = createViewportLayout(frame.width, frame.height, { safeArea: null });

    screen.render(frame);
    screen.handleTouchEnd(createTap(viewport.contentLeft + 24, viewport.footerTop + 32));
    screen.render(frame);
    screen.handleTouchEnd(createTap(78, 422));
    screen.render(frame);
    screen.handleTouchEnd(createTap(280, 698));
    await flushAsyncWork();
    screen.render(frame);
    screen.handleTouchEnd(createTap(10, 10));
    screen.render(frame);
    screen.handleTouchEnd(createTap(100, 740));
    await flushAsyncWork();

    assert.deepEqual(saleCalls, [
      { resourceKey: "basic_ore", amount: 5 },
      { resourceKey: "basic_ore", amount: 3 },
    ]);
  } finally {
    globalThis.wx = originalWx;
  }
}

async function testResourcesDrawerConsumesConcretePill() {
  const snapshot = {
    run: {
      round_index: 3,
      resources: {
        spirit_stone: 0,
        herbs: 0,
        iron_essence: 0,
        ore: 0,
        beast_material: 0,
        pill: 1,
        craft_material: 0,
      },
      resource_stacks: [],
      alchemy_state: {
        inventory: [
          {
            item_id: "yang_qi_dan",
            display_name: "养气丹",
            quality: "low",
            quality_label: "下品",
            quality_color: "white",
            amount: 1,
            effect_summary: "直接增加修为",
            effect_type: "cultivation_exp",
            effect_value: 12,
          },
        ],
      },
      character: {
        realm: "qi_refining_early",
        realm_display_name: "炼气初期",
        cultivation_exp: 37,
        lifespan_current: 717,
        is_dead: false,
      },
      current_event: null,
    },
    playerProfile: null,
    eventHistory: [],
    dwellingSettlementHistory: [],
  };

  const consumeCalls = [];
  const screen = createMainStageScreen({
    adapter: createAdapter(snapshot, {
      async consumeAlchemyItem(itemId, quality) {
        consumeCalls.push({ itemId, quality });
      },
    }),
    requestRender() {},
  });
  const frame = createFrame();
  const viewport = createViewportLayout(frame.width, frame.height, { safeArea: null });

  screen.render(frame);
  screen.handleTouchEnd(createTap(viewport.contentLeft + 24, viewport.footerTop + 32));
  screen.render(frame);
  screen.handleTouchEnd(createTap(100, 368));

  const renderedTexts = [];
  screen.render(
    createFrame({
      fillText(text) {
        renderedTexts.push(String(text));
      },
    })
  );
  screen.handleTouchEnd(createTap(187, 745));
  await flushAsyncWork();

  assert.equal(renderedTexts.includes("下品 · 养气丹 1"), true, "inventory should show pill quality and name");
  assert.deepEqual(consumeCalls, [{ itemId: "yang_qi_dan", quality: "low" }]);
}

function createAdapter(snapshot, overrides = {}) {
  return {
    getSnapshot() {
      return snapshot;
    },
    async createRun() {},
    async advanceTime() {},
    async resolveEvent() {},
    async performBattleAction() {},
    async breakthrough() {},
    async sellResource() {},
    async convertSpiritStoneToCultivation() {},
    async buildDwellingFacility() {},
    async upgradeDwellingFacility() {},
    async startAlchemy() {},
    async consumeAlchemyItem() {},
    async rebirth() {},
    ...overrides,
  };
}

function createFrame(contextOverrides = {}) {
  return {
    context: createFakeContext(contextOverrides),
    width: 375,
    height: 812,
    systemInfo: { safeArea: null },
  };
}

function createTap(clientX, clientY) {
  return {
    changedTouches: [
      {
        clientX,
        clientY,
      },
    ],
  };
}

function createFakeContext(overrides = {}) {
  return {
    fillStyle: "",
    strokeStyle: "",
    font: "",
    lineWidth: 1,
    beginPath() {},
    moveTo() {},
    lineTo() {},
    quadraticCurveTo() {},
    closePath() {},
    fill() {},
    stroke() {},
    clearRect() {},
    fillRect() {},
    strokeRect() {},
    fillText() {},
    createLinearGradient() {
      return {
        addColorStop() {},
      };
    },
    measureText(text) {
      return {
        width: String(text || "").length * 8,
      };
    },
    ...overrides,
  };
}

async function flushAsyncWork() {
  await Promise.resolve();
  await Promise.resolve();
}

function getTagCenter(viewport, rowIndex, columnIndex) {
  const columns = 3;
  const tagWidth = (viewport.contentWidth - viewport.tagGap * (columns - 1)) / columns;
  return {
    x: viewport.contentLeft + columnIndex * (tagWidth + viewport.tagGap) + tagWidth / 2,
    y: viewport.footerTop + 18 + rowIndex * (viewport.tagHeight + viewport.tagGap) + viewport.tagHeight / 2,
  };
}
