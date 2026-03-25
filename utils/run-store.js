const api = require("./api");

const state = {
  run: null,
  playerProfile: null,
  eventHistory: [],
  error: "",
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getState() {
  return clone(state);
}

function ensureRun() {
  if (!state.run) {
    throw new Error("No active run. Create one first.");
  }
}

async function createRun(playerId = "demo-player") {
  state.error = "";
  state.eventHistory = [];
  state.run = await api.createRun(playerId);
  return getState();
}

async function refreshRun() {
  ensureRun();
  state.error = "";
  state.run = await api.getRunState(state.run.run_id);
  return getState();
}

async function advanceTime() {
  ensureRun();
  state.error = "";
  state.run = await api.advanceTime(state.run.run_id);
  return getState();
}

async function resolveEvent(optionId) {
  ensureRun();
  state.error = "";
  const beforeRun = clone(state.run);
  state.run = await api.resolveEvent(state.run.run_id, optionId);
  pushEventHistory(beforeRun, state.run);
  return getState();
}

async function breakthrough() {
  ensureRun();
  state.error = "";
  const result = await api.breakthrough(state.run.run_id);
  state.run.character = result.character;
  state.run.resources = result.resources;
  state.run.result_summary = result.message;
  return {
    state: getState(),
    breakthrough: result,
  };
}

async function rebirth() {
  ensureRun();
  state.error = "";
  const result = await api.rebirth(state.run.run_id);
  state.playerProfile = result.player_profile;
  state.run = result.new_run;
  state.eventHistory = [];
  return getState();
}

function pushEventHistory(beforeRun, afterRun) {
  if (!beforeRun || !beforeRun.current_event || !afterRun) {
    return;
  }

  const impactLines = buildImpactLines(beforeRun, afterRun);
  state.eventHistory = [
    {
      eventName: beforeRun.current_event.event_name,
      summary: afterRun.result_summary || `${beforeRun.current_event.event_name} 已结算`,
      impactLines,
    },
    ...state.eventHistory,
  ].slice(0, 3);
}

function buildImpactLines(beforeRun, afterRun) {
  const lines = [];

  pushDeltaLine(
    lines,
    "灵石",
    afterRun.resources.spirit_stone - beforeRun.resources.spirit_stone
  );
  pushDeltaLine(lines, "药草", afterRun.resources.herbs - beforeRun.resources.herbs);
  pushDeltaLine(
    lines,
    "玄铁精华",
    afterRun.resources.iron_essence - beforeRun.resources.iron_essence
  );
  pushDeltaLine(
    lines,
    "修为",
    afterRun.character.cultivation_exp - beforeRun.character.cultivation_exp
  );

  const lifespanDelta =
    afterRun.character.lifespan_current - beforeRun.character.lifespan_current;
  if (lifespanDelta !== 0) {
    lines.push(`寿元 ${formatSignedMonths(lifespanDelta)}`);
  }

  if (!beforeRun.character.is_dead && afterRun.character.is_dead) {
    lines.push("寿元归零");
  }

  if (lines.length === 0) {
    lines.push("未见明显变化");
  }

  return lines;
}

function pushDeltaLine(lines, label, delta) {
  if (!delta) {
    return;
  }

  const sign = delta > 0 ? "+" : "";
  lines.push(`${label} ${sign}${delta}`);
}

function formatSignedMonths(delta) {
  const sign = delta > 0 ? "+" : "-";
  const totalMonths = Math.abs(delta);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return `${sign}${years}年${months}个月`;
}

module.exports = {
  getState,
  createRun,
  refreshRun,
  advanceTime,
  resolveEvent,
  breakthrough,
  rebirth,
};
