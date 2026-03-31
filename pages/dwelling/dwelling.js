const store = require("../../utils/run-store");

Page({
  data: {
    run: null,
    dwellingLevel: 1,
    facilities: [],
    builtFacilityCount: 0,
    dwelling_last_settlement: null,
    error: "",
    loadingFacilityId: "",
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

    this.setData({
      run,
      dwellingLevel: run ? run.dwelling_level : 1,
      facilities: run ? run.dwelling_facilities || [] : [],
      builtFacilityCount: run
        ? (run.dwelling_facilities || []).filter((item) => item.level > 0).length
        : 0,
      dwelling_last_settlement: run ? run.dwelling_last_settlement : null,
      error: snapshot.error || "",
      loadingFacilityId: "",
    });
  },

  async buildFacility(event) {
    await this.handleFacilityAction(event.currentTarget.dataset.facilityId, "build");
  },

  async upgradeFacility(event) {
    await this.handleFacilityAction(event.currentTarget.dataset.facilityId, "upgrade");
  },

  async handleFacilityAction(facilityId, action) {
    if (!this.data.run) {
      wx.reLaunch({ url: "/pages/home/home" });
      return;
    }

    this.setData({ loadingFacilityId: facilityId, error: "" });

    try {
      if (action === "build") {
        await store.buildDwellingFacility(facilityId);
      } else {
        await store.upgradeDwellingFacility(facilityId);
      }
      this.syncState();
      wx.showToast({
        title: action === "build" ? "建造完成" : "升级完成",
        icon: "none",
      });
    } catch (error) {
      if (isMissingRunError(error)) {
        store.clearRun();
        this.syncState();
        wx.reLaunch({ url: "/pages/home/home" });
        return;
      }
      this.setData({
        error: error.message,
        loadingFacilityId: "",
      });
    }
  },
});

function isMissingRunError(error) {
  const message = String((error && error.message) || "");
  return /run .* not found/i.test(message) || /No active run/i.test(message);
}
