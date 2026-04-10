const LOCAL_API_BASE_URL = "http://127.0.0.1:8000";
const CLOUD_API_BASE_URL = "https://game-background-244444-5-1420746332.sh.run.tcloudbase.com/";

const ENVIRONMENT_API_BASE_URLS = {
  develop: LOCAL_API_BASE_URL,
  trial: CLOUD_API_BASE_URL,
  release: CLOUD_API_BASE_URL,
};

function detectEnvVersion() {
  try {
    if (typeof wx === "undefined" || typeof wx.getAccountInfoSync !== "function") {
      return "develop";
    }

    const accountInfo = wx.getAccountInfoSync();
    const envVersion =
      accountInfo && accountInfo.miniProgram ? accountInfo.miniProgram.envVersion : "";

    return envVersion || "develop";
  } catch {
    return "develop";
  }
}

function resolveApiBaseUrl(envVersion = detectEnvVersion()) {
  return ENVIRONMENT_API_BASE_URLS[envVersion] || LOCAL_API_BASE_URL;
}

module.exports = {
  LOCAL_API_BASE_URL,
  CLOUD_API_BASE_URL,
  ENVIRONMENT_API_BASE_URLS,
  detectEnvVersion,
  resolveApiBaseUrl,
  apiBaseUrl: resolveApiBaseUrl(),
};
