import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { buildEventModalViewModel } = require("../../src/game/view-models/event-modal.js");

const noEventSnapshot = {
  run: {
    current_event: null,
  },
};

const pendingEventSnapshot = {
  run: {
    current_event: {
      event_id: "mountain-cave",
      event_name: "山壁观息",
      body_text: "石壁间有微弱灵光浮动。",
      options: [
        {
          option_id: "inspect",
          title_text: "上前查看",
          is_available: true,
          time_cost_months: 3,
        },
        {
          option_id: "retreat",
          title_text: "暂且退开",
          is_available: false,
          disabled_reason: "心神不宁",
        },
      ],
    },
  },
};

assert.equal(buildEventModalViewModel(noEventSnapshot), null);

const viewModel = buildEventModalViewModel(pendingEventSnapshot);
assert.equal(viewModel.title, "山壁观息");
assert.equal(viewModel.body, "石壁间有微弱灵光浮动。");
assert.equal(viewModel.options.length, 2);
assert.equal(viewModel.options[0].disabled, false);
assert.equal(viewModel.options[0].timeCostText, "额外耗时 3个月");
assert.equal(viewModel.options[1].disabled, true);
assert.equal(viewModel.options[1].disabledReason, "心神不宁");
assert.equal(viewModel.options[1].timeCostText, "");
