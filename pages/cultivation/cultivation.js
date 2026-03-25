const store = require("../../utils/run-store");

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
  },

  onShow() {
    this.syncState();
  },

  syncState() {
    const snapshot = store.getState();
    const run = snapshot.run;
    const canBreakthrough = Boolean(
      run &&
        !run.character.is_dead &&
        run.character.cultivation_exp >= 100 &&
        run.resources.spirit_stone >= 50
    );

    this.setData({
      run,
      character: run ? run.character : null,
      resources: run ? run.resources : null,
      resultSummary: run ? run.result_summary || "" : "",
      breakthroughHint: buildBreakthroughHint(run, canBreakthrough),
      error: snapshot.error,
      canBreakthrough,
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
      this.setData({ error: error.message });
    } finally {
      this.setData({ loading: false });
    }
  },
});

function buildBreakthroughHint(run, canBreakthrough) {
  if (!run) {
    return "命卷未启，暂无可修之身。";
  }

  if (run.character.is_dead) {
    return "此身已尽，无法再行破境。";
  }

  if (canBreakthrough) {
    return "修为与灵石已备，可以尝试冲关。";
  }

  if (run.character.cultivation_exp < 100) {
    return "修为未满，仍需继续推演与积累。";
  }

  if (run.resources.spirit_stone < 50) {
    return "灵石不足，尚不能支撑破境消耗。";
  }

  return "时机未至，暂且收束心神。";
}
