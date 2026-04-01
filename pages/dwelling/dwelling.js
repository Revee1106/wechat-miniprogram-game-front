const store = require("../../utils/run-store");

Page({
  data: {
    run: null,
    dwellingLevel: 1,
    currentSpiritStone: 0,
    facilities: [],
    facilityCards: [],
    selectedFacilityId: "",
    selectedFacilityCard: null,
    facilitySheetVisible: false,
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
        wx.showToast({
          title: error.message || "洞府状态刷新失败",
          icon: "none",
        });
      }
    }
    this.syncState();
  },

  syncState() {
    const snapshot = store.getState();
    const run = snapshot.run;
    const facilities = run ? run.dwelling_facilities || [] : [];
    const facilityCards = normalizeFacilities(facilities);
    const selectedFacilityCard = syncSelectedFacilityCard(
      facilityCards,
      this.data.selectedFacilityId
    );

    this.setData({
      run,
      dwellingLevel: run ? run.dwelling_level : 1,
      currentSpiritStone: run ? Number((run.resources || {}).spirit_stone) || 0 : 0,
      facilities,
      facilityCards,
      selectedFacilityCard,
      error: snapshot.error || "",
      loadingFacilityId: "",
    });
  },

  openFacilitySheet(event) {
    const facilityId = event.currentTarget.dataset.facilityId;
    const selectedFacilityCard = syncSelectedFacilityCard(this.data.facilityCards, facilityId);
    if (!selectedFacilityCard) {
      return;
    }

    this.setData({
      selectedFacilityId: facilityId,
      selectedFacilityCard,
      facilitySheetVisible: true,
    });
  },

  closeFacilitySheet() {
    this.setData({
      selectedFacilityId: "",
      selectedFacilityCard: null,
      facilitySheetVisible: false,
    });
  },

  async buildFacility(event) {
    await this.handleFacilityAction(event.currentTarget.dataset.facilityId, "build");
  },

  async upgradeFacility(event) {
    await this.handleFacilityAction(event.currentTarget.dataset.facilityId, "upgrade");
  },

  returnToJourney() {
    wx.navigateBack({
      fail() {
        wx.navigateTo({ url: "/pages/event/event" });
      },
    });
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
      this.closeFacilitySheet();
      this.syncState();
      wx.showToast({
        title: action === "build" ? "建造成功" : "升级成功",
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
        loadingFacilityId: "",
      });
      wx.showToast({
        title: translateDwellingActionError(error, action),
        icon: "none",
      });
    }
  },
});

function normalizeFacilities(facilities) {
  return facilities.map((item) => {
    const resourceYields = item.monthly_resource_yields || {};
    const nextUpgradeCost = item.next_upgrade_cost || {};
    return {
      ...item,
      statusText: buildStatusText(item.status),
      yieldText: [
        `灵石 ${resourceYields.spirit_stone || 0}`,
        `灵植 ${resourceYields.basic_herb || 0}`,
        `灵矿 ${resourceYields.basic_ore || 0}`,
        `灵泉 ${resourceYields.spirit_spring_water || 0}`,
        `修为 ${item.monthly_cultivation_exp_gain || 0}`,
      ].join(" / "),
      maintenanceText: `${(item.maintenance_cost || {}).spirit_stone || 0} 灵石`,
      nextUpgradeText: `${nextUpgradeCost.spirit_stone || 0} 灵石`,
      actionType:
        item.level === 0
          ? "build"
          : nextUpgradeCost.spirit_stone
            ? "upgrade"
            : "none",
    };
  });
}

function buildStatusText(status) {
  const labels = {
    active: "运转中",
    paused: "暂停中",
    stalled: "停摆",
    unbuilt: "未建造",
    insufficient_maintenance: "维护不足",
  };
  return labels[status] || status || "未建造";
}

function syncSelectedFacilityCard(facilityCards, selectedFacilityId) {
  if (!selectedFacilityId) {
    return null;
  }

  return facilityCards.find((item) => item.facility_id === selectedFacilityId) || null;
}

function isMissingRunError(error) {
  const message = String((error && error.message) || "");
  return /run .* not found/i.test(message) || /No active run/i.test(message);
}

function translateDwellingActionError(error, action) {
  const message = String((error && error.message) || "");
  const fallback = action === "build" ? "建造失败" : "升级失败";

  if (/not enough resources for dwelling action/i.test(message)) {
    return action === "build" ? "资源不足，无法建造" : "资源不足，无法升级";
  }
  if (/is already built/i.test(message)) {
    return "该设施已建造";
  }
  if (/is not built/i.test(message)) {
    return "该设施尚未建造";
  }
  if (/already at max level/i.test(message)) {
    return "该设施已达最高等级";
  }
  if (/unknown dwelling facility/i.test(message)) {
    return "洞府设施不存在";
  }
  return fallback;
}
