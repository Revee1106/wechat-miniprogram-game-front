const config = require("./config");

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

        reject(new Error(response.data.detail || `Request failed: ${response.statusCode}`));
      },
      fail(error) {
        reject(new Error(error.errMsg || "Network request failed"));
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

function advanceTime(runId) {
  return post("/api/run/advance", { run_id: runId });
}

function resolveEvent(runId, optionId) {
  return post("/api/run/resolve", { run_id: runId, option_id: optionId });
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

function startAlchemy(runId, recipeId, useSpiritSpring = false) {
  return post("/api/run/alchemy/start", {
    run_id: runId,
    recipe_id: recipeId,
    use_spirit_spring: useSpiritSpring,
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
  breakthrough,
  buildDwellingFacility,
  upgradeDwellingFacility,
  sellResource,
  startAlchemy,
  consumeAlchemyItem,
  rebirth,
};
