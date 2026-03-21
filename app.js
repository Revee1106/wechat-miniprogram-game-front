const api = require("./utils/api");
const config = require("./utils/config");

App({
  globalData: {
    apiBaseUrl: config.apiBaseUrl,
  },
  onLaunch() {
    api.setApiBaseUrl(this.globalData.apiBaseUrl);
  },
});
