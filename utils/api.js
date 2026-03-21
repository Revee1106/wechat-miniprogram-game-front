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

function resolveEvent(runId, choiceKey) {
  return post("/api/run/resolve", { run_id: runId, choice_key: choiceKey });
}

function breakthrough(runId) {
  return post("/api/run/breakthrough", { run_id: runId });
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
  rebirth,
};
