const store = require("../../utils/run-store");

Page({
  data: {
    run: null,
    currentEvent: null,
    choices: [],
    error: "",
    loading: false,
  },

  onShow() {
    this.syncState();
  },

  syncState() {
    const snapshot = store.getState();
    this.setData({
      run: snapshot.run,
      currentEvent: snapshot.run ? snapshot.run.current_event : null,
      choices:
        snapshot.run && snapshot.run.current_event
          ? snapshot.run.current_event.choices
          : [],
      error: snapshot.error,
    });
  },

  async handleChoice(event) {
    this.setData({ loading: true, error: "" });
    try {
      const snapshot = await store.resolveEvent(event.detail.choiceKey);
      this.syncState();
      if (snapshot.run && snapshot.run.character.is_dead) {
        wx.navigateTo({ url: "/pages/summary/summary" });
        return;
      }
      wx.navigateBack({ delta: 1 });
    } catch (error) {
      this.setData({ error: error.message });
    } finally {
      this.setData({ loading: false });
    }
  },
});
