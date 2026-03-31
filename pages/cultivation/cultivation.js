const store = require("../../utils/run-store");
const {
  buildBreakthroughHint,
  canAttemptBreakthrough,
  getBreakthroughRequirements,
} = require("../../utils/breakthrough");

Page({
  data: {
    run: null,
    character: null,
    resources: null,
    resultSummary: "",
    breakthroughHint: "",
    error: "",
    loading: false,
    canBreakthrough: false,
    breakthroughTargetExp: 0,
    breakthroughTargetSpiritStone: 0,
  },

  async onShow() {
    const snapshot = store.getState();
    if (snapshot.run) {
      try {
        await store.refreshRun();
      } catch (error) {
        if (isMissingRunError(error)) {
          store.clearRun();
          this.syncState();
          wx.reLaunch({ url: "/pages/home/home" });
          return;
        }
        this.setData({ error: error.message });
      }
    }
    this.syncState();
  },

  syncState() {
    const snapshot = store.getState();
    const run = snapshot.run;
    const requirements = getBreakthroughRequirements(run);
    const canBreakthrough = canAttemptBreakthrough(run);

    this.setData({
      run,
      character: run ? run.character : null,
      resources: run ? run.resources : null,
      resultSummary: run ? run.result_summary || "" : "",
      breakthroughHint: buildBreakthroughHint(run, canBreakthrough),
      error: snapshot.error,
      canBreakthrough,
      breakthroughTargetExp: requirements.requiredCultivationExp,
      breakthroughTargetSpiritStone: requirements.requiredSpiritStone,
    });
  },

  async attemptBreakthrough() {
    this.setData({ loading: true, error: "" });
    try {
      const result = await store.breakthrough();
      this.syncState();
      wx.showToast({
        title: result.breakthrough.success ? "破境成功" : "破境未成",
        icon: "none",
      });
    } catch (error) {
      if (isMissingRunError(error)) {
        store.clearRun();
        this.syncState();
        wx.reLaunch({ url: "/pages/home/home" });
        return;
      }
      this.setData({ error: error.message });
    } finally {
      this.setData({ loading: false });
    }
  },
});

function isMissingRunError(error) {
  const message = String((error && error.message) || "");
  return /run .* not found/i.test(message) || /No active run/i.test(message);
}
