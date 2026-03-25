const store = require("../../utils/run-store");

Page({
  data: {
    run: null,
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
      error: snapshot.error,
    });
  },

  async createRun() {
    this.setData({ loading: true, error: "" });

    try {
      if (this.data.run && this.data.run.character && this.data.run.character.is_dead) {
        wx.reLaunch({ url: "/pages/summary/summary" });
        return;
      }

      if (!this.data.run) {
        await store.createRun(this.data.playerId);
        this.syncState();
      }

      wx.navigateTo({ url: "/pages/event/event" });
    } catch (error) {
      this.setData({ error: error.message });
    } finally {
      this.setData({ loading: false });
    }
  },
});
