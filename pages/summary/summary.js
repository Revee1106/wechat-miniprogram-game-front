const store = require("../../utils/run-store");

Page({
  data: {
    run: null,
    character: null,
    resources: null,
    resultSummary: "",
    defaultResultSummary: "这一世的因果已写定，留待下一次转生改写。",
    isDead: false,
    playerProfile: null,
    error: "",
    loading: false,
  },

  onShow() {
    this.syncState();
  },

  syncState() {
    const snapshot = store.getState();
    const isDead = Boolean(
      snapshot.run && snapshot.run.character && snapshot.run.character.is_dead
    );

    if (snapshot.run && !isDead) {
      wx.reLaunch({ url: "/pages/event/event" });
      return;
    }

    this.setData({
      run: snapshot.run,
      character: snapshot.run ? snapshot.run.character : null,
      resources: snapshot.run ? snapshot.run.resources : null,
      resultSummary: snapshot.run ? snapshot.run.result_summary || "" : "",
      isDead,
      playerProfile: snapshot.playerProfile,
      error: snapshot.error,
    });
  },

  async handleRebirth() {
    this.setData({ loading: true, error: "" });
    try {
      await store.rebirth();
      wx.reLaunch({ url: "/pages/home/home" });
    } catch (error) {
      this.setData({ error: error.message });
    } finally {
      this.setData({ loading: false });
    }
  },
});
