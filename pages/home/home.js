const store = require("../../utils/run-store");

Page({
  data: {
    run: null,
    character: null,
    resources: null,
    roundIndex: 0,
    resultSummary: "",
    error: "",
    loading: false,
    playerId: "demo-player",
  },

  onShow() {
    this.syncState();
  },

  syncState() {
    const snapshot = store.getState();
    this.setData({
      run: snapshot.run,
      character: snapshot.run ? snapshot.run.character : null,
      resources: snapshot.run ? snapshot.run.resources : null,
      roundIndex: snapshot.run ? snapshot.run.round_index : 0,
      resultSummary: snapshot.run ? snapshot.run.result_summary || "" : "",
      error: snapshot.error,
    });
  },

  async createRun() {
    this.setData({ loading: true, error: "" });
    try {
      await store.createRun(this.data.playerId);
      this.syncState();
    } catch (error) {
      this.setData({ error: error.message });
    } finally {
      this.setData({ loading: false });
    }
  },

  async advanceTime() {
    this.setData({ loading: true, error: "" });
    try {
      const snapshot = await store.advanceTime();
      this.syncState();
      if (snapshot.run && snapshot.run.current_event) {
        wx.navigateTo({ url: "/pages/event/event" });
      }
    } catch (error) {
      this.setData({ error: error.message });
    } finally {
      this.setData({ loading: false });
    }
  },

  openCultivation() {
    wx.navigateTo({ url: "/pages/cultivation/cultivation" });
  },

  openCrafting() {
    wx.navigateTo({ url: "/pages/crafting/crafting" });
  },

  openDwelling() {
    wx.navigateTo({ url: "/pages/dwelling/dwelling" });
  },

  openSummary() {
    wx.navigateTo({ url: "/pages/summary/summary" });
  },
});
