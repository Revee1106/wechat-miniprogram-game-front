const api = require("./api");

const state = {
  run: null,
  playerProfile: null,
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
  state.run = await api.resolveEvent(state.run.run_id, optionId);
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
  return getState();
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
