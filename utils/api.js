const config = require("./config");
const { createLocalizedApiError } = require("../src/game/utils/display-text");

let apiBaseUrl = config.apiBaseUrl;

function setApiBaseUrl(nextBaseUrl) {
  apiBaseUrl = nextBaseUrl;
}

function post(path, data) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${apiBaseUrl}${path}`,
      method: "POST",
      data,
      success(response) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(response.data);
          return;
        }

        reject(createLocalizedApiError(response.data, response.statusCode));
      },
      fail(error) {
        reject(new Error(error.errMsg || "网络请求失败"));
      },
    });
  });
}

function createRun(playerId) {
  return post("/api/run/create", { player_id: playerId });
}

function getRunState(runId) {
  return post("/api/run/state", { run_id: runId });
}

function advanceTime(runId, allowCultivationPenalty = false) {
  return post("/api/run/advance", {
    run_id: runId,
    allow_cultivation_penalty: allowCultivationPenalty,
  });
}

function resolveEvent(runId, optionId) {
  return post("/api/run/resolve", { run_id: runId, option_id: optionId });
}

function performBattleAction(runId, action) {
  return post("/api/run/battle/action", { run_id: runId, action });
}

function breakthrough(runId) {
  return post("/api/run/breakthrough", { run_id: runId });
}

function buildDwellingFacility(runId, facilityId) {
  return post("/api/run/dwelling/build", { run_id: runId, facility_id: facilityId });
}

function upgradeDwellingFacility(runId, facilityId) {
  return post("/api/run/dwelling/upgrade", { run_id: runId, facility_id: facilityId });
}

function sellResource(runId, resourceKey, amount) {
  return post("/api/run/resource/sell", {
    run_id: runId,
    resource_key: resourceKey,
    amount,
  });
}

function convertSpiritStoneToCultivation(runId, amount) {
  return post("/api/run/resource/convert-cultivation", {
    run_id: runId,
    amount,
  });
}

function startAlchemy(runId, recipeId) {
  return post("/api/run/alchemy/start", {
    run_id: runId,
    recipe_id: recipeId,
  });
}

function consumeAlchemyItem(runId, itemId, quality) {
  return post("/api/run/alchemy/consume", {
    run_id: runId,
    item_id: itemId,
    quality,
  });
}

function rebirth(runId) {
  return post("/api/run/rebirth", { run_id: runId });
}

module.exports = {
  setApiBaseUrl,
  createRun,
  getRunState,
  advanceTime,
  resolveEvent,
  performBattleAction,
  breakthrough,
  buildDwellingFacility,
  upgradeDwellingFacility,
  sellResource,
  convertSpiritStoneToCultivation,
  startAlchemy,
  consumeAlchemyItem,
  rebirth,
};
