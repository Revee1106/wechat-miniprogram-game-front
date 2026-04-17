const api = require("./api");

const state = {
  run: null,
  playerProfile: null,
  eventHistory: [],
  dwellingSettlementHistory: [],
  suppressCultivationCapPromptForCurrentRun: false,
  error: "",
};

let eventHistorySequence = 0;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getState() {
  return clone(state);
}

function clearRun() {
  state.run = null;
  state.error = "";
  state.eventHistory = [];
  state.dwellingSettlementHistory = [];
  state.suppressCultivationCapPromptForCurrentRun = false;
  eventHistorySequence = 0;
}

function ensureRun() {
  if (!state.run) {
    throw new Error("当前没有进行中的修仙历程，请先启程。");
  }
}

async function createRun(playerId = "demo-player") {
  state.error = "";
  state.eventHistory = [];
  state.dwellingSettlementHistory = [];
  state.suppressCultivationCapPromptForCurrentRun = false;
  eventHistorySequence = 0;
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
  const beforeRun = clone(state.run);
  state.run = await api.advanceTime(state.run.run_id);
  pushDwellingSettlementHistory(beforeRun, state.run);
  return getState();
}

async function resolveEvent(optionId) {
  ensureRun();
  state.error = "";
  const beforeRun = clone(state.run);
  state.run = await api.resolveEvent(state.run.run_id, optionId);
  if (!state.run.active_battle) {
    pushEventHistory(beforeRun, state.run);
  }
  return getState();
}

async function performBattleAction(action) {
  ensureRun();
  state.error = "";
  const beforeRun = clone(state.run);
  state.run = await api.performBattleAction(state.run.run_id, action);
  if (beforeRun.active_battle && !state.run.active_battle) {
    pushEventHistory(beforeRun, state.run);
  }
  return getState();
}

async function breakthrough() {
  ensureRun();
  state.error = "";
  const result = await api.breakthrough(state.run.run_id);
  state.run.character = result.character;
  state.run.resources = result.resources;
  state.run.breakthrough_requirements = result.breakthrough_requirements || null;
  state.run.result_summary = result.message;
  return {
    state: getState(),
    breakthrough: result,
  };
}

async function buildDwellingFacility(facilityId) {
  ensureRun();
  state.error = "";
  state.run = await api.buildDwellingFacility(state.run.run_id, facilityId);
  return getState();
}

async function upgradeDwellingFacility(facilityId) {
  ensureRun();
  state.error = "";
  state.run = await api.upgradeDwellingFacility(state.run.run_id, facilityId);
  return getState();
}

async function sellResource(resourceKey, amount) {
  ensureRun();
  state.error = "";
  state.run = await api.sellResource(state.run.run_id, resourceKey, amount);
  return getState();
}

async function convertSpiritStoneToCultivation(amount) {
  ensureRun();
  state.error = "";
  state.run = await api.convertSpiritStoneToCultivation(state.run.run_id, amount);
  return getState();
}

async function startAlchemy(recipeId, useSpiritSpring = false) {
  ensureRun();
  state.error = "";
  state.run = await api.startAlchemy(state.run.run_id, recipeId, useSpiritSpring);
  return getState();
}

async function consumeAlchemyItem(itemId, quality) {
  ensureRun();
  state.error = "";
  state.run = await api.consumeAlchemyItem(state.run.run_id, itemId, quality);
  return getState();
}

async function rebirth() {
  ensureRun();
  state.error = "";
  const result = await api.rebirth(state.run.run_id);
  state.playerProfile = result.player_profile;
  state.run = result.new_run;
  state.eventHistory = [];
  state.dwellingSettlementHistory = [];
  state.suppressCultivationCapPromptForCurrentRun = false;
  eventHistorySequence = 0;
  return getState();
}

function markCultivationCapPromptSuppressed() {
  state.suppressCultivationCapPromptForCurrentRun = true;
}

function isCultivationCapPromptSuppressed() {
  return state.suppressCultivationCapPromptForCurrentRun === true;
}

function pushEventHistory(beforeRun, afterRun) {
  if (!beforeRun || !beforeRun.current_event || !afterRun) {
    return;
  }

  const impactLines = buildImpactLines(beforeRun, afterRun);
  state.eventHistory = [
    {
      historyKey: `history-${beforeRun.round_index || 0}-${eventHistorySequence++}`,
      eventName: beforeRun.current_event.event_name,
      summary: afterRun.result_summary || `${beforeRun.current_event.event_name} 已结算`,
      impactLines,
    },
    ...state.eventHistory,
  ].slice(0, 2);
}

function pushDwellingSettlementHistory(beforeRun, afterRun) {
  const settlement = afterRun ? afterRun.dwelling_last_settlement : null;
  if (!settlement) {
    return;
  }

  const previousRoundIndex =
    state.dwellingSettlementHistory.length > 0
      ? state.dwellingSettlementHistory[0].roundIndex
      : null;
  if (previousRoundIndex === settlement.round_index) {
    return;
  }

  state.dwellingSettlementHistory = [
    buildDwellingSettlementHistoryItem(settlement),
    ...state.dwellingSettlementHistory,
  ].slice(0, 2);
}

function buildImpactLines(beforeRun, afterRun) {
  const lines = [];
  const eventResolution = afterRun ? afterRun.last_event_resolution || null : null;

  pushDeltaLine(lines, "灵石", afterRun.resources.spirit_stone - beforeRun.resources.spirit_stone);
  pushDeltaLine(lines, "药草", afterRun.resources.herbs - beforeRun.resources.herbs);
  pushDeltaLine(lines, "玄铁精华", afterRun.resources.iron_essence - beforeRun.resources.iron_essence);
  pushCultivationDeltaLine(
    lines,
    afterRun.character.cultivation_exp - beforeRun.character.cultivation_exp,
    eventResolution
  );

  const lifespanDelta = afterRun.character.lifespan_current - beforeRun.character.lifespan_current;
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

function buildDwellingSettlementHistoryItem(settlement) {
  const maintenance = Number((settlement.total_maintenance_paid || {}).spirit_stone || 0);
  const income = Number((settlement.total_resource_gains || {}).spirit_stone || 0);
  const stalledFacilities = (settlement.entries || [])
    .filter((item) => item.status === "stalled")
    .map((item) => item.display_name)
    .filter(Boolean);
  const impactLines = [`支出 ${maintenance} 灵石，收入 ${income} 灵石`];

  if (stalledFacilities.length) {
    impactLines.push(`停摆：${stalledFacilities.join("、")}`);
  }

  return {
    historyKey: `dwelling-history-${settlement.round_index}-${eventHistorySequence++}`,
    roundIndex: settlement.round_index,
    summary: formatUnsignedMonths(settlement.round_index || 0),
    impactLines,
  };
}

function pushDeltaLine(lines, label, delta) {
  if (!delta) {
    return;
  }

  lines.push(`${label} ${formatSignedNumber(delta)}`);
}

function pushCultivationDeltaLine(lines, actualDelta, eventResolution) {
  const intendedDelta = Number(
    ((eventResolution && eventResolution.intended_character) || {}).cultivation_exp || 0
  );
  const cappedDelta = Number(
    ((eventResolution && eventResolution.capped_character) || {}).cultivation_exp || 0
  );

  if (intendedDelta !== 0 && cappedDelta > 0) {
    lines.push(`修为 ${formatSignedNumber(intendedDelta)}（已达上限，实际${formatSignedNumber(actualDelta, true)}）`);
    return;
  }

  pushDeltaLine(lines, "修为", actualDelta);
}

function formatSignedNumber(delta, includePositiveZero = false) {
  const needsPlus = delta > 0 || (includePositiveZero && delta === 0);
  return `${needsPlus ? "+" : ""}${delta}`;
}

function formatSignedMonths(delta) {
  const sign = delta > 0 ? "+" : "-";
  const totalMonths = Math.abs(delta);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return `${sign}${years}年${months}个月`;
}

function formatUnsignedMonths(totalMonths) {
  const safeMonths = Math.max(0, Number(totalMonths) || 0);
  const years = Math.floor(safeMonths / 12);
  const months = safeMonths % 12;
  return `${years}年${months}个月`;
}

module.exports = {
  getState,
  clearRun,
  createRun,
  refreshRun,
  advanceTime,
  resolveEvent,
  performBattleAction,
  markCultivationCapPromptSuppressed,
  isCultivationCapPromptSuppressed,
  breakthrough,
  buildDwellingFacility,
  upgradeDwellingFacility,
  sellResource,
  convertSpiritStoneToCultivation,
  startAlchemy,
  consumeAlchemyItem,
  rebirth,
};
