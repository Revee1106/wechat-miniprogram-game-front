const store = require("../../utils/run-store");

Page({
  data: {
    run: null,
    character: null,
    resources: null,
    resultSummary: "",
    error: "",
    loading: false,
    canBreakthrough: false,
  },

  onShow() {
    this.syncState();
  },

  syncState() {
    const snapshot = store.getState();
    const run = snapshot.run;
    this.setData({
      run,
      character: run ? run.character : null,
      resources: run ? run.resources : null,
      resultSummary: run ? run.result_summary || "" : "",
      error: snapshot.error,
      canBreakthrough: Boolean(
        run &&
          !run.character.is_dead &&
          run.character.cultivation_exp >= 100 &&
          run.resources.spirit_stone >= 50
      ),
    });
  },

  async attemptBreakthrough() {
    this.setData({ loading: true, error: "" });
    try {
      const result = await store.breakthrough();
      this.syncState();
      wx.showToast({
        title: result.breakthrough.success ? "Breakthrough success" : "Breakthrough failed",
        icon: "none",
      });
    } catch (error) {
      this.setData({ error: error.message });
    } finally {
      this.setData({ loading: false });
    }
  },
});
