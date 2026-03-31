const store = require("../../utils/run-store");

const DWELLING_PANELS = ["facilities", "overview", "settlement"];

Page({
  data: {
    run: null,
    dwellingLevel: 1,
    facilities: [],
    facilityCards: [],
    selectedFacilityId: "",
    selectedFacilityCard: null,
    facilitySheetVisible: false,
    builtFacilityCount: 0,
    dwelling_last_settlement: null,
    settlementSummary: "",
    settlementLines: [],
    activePanel: "facilities",
    currentPanelIndex: 0,
    panelTabs: buildPanelTabs("facilities"),
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
    const settlement = run ? run.dwelling_last_settlement : null;
    const facilityCards = normalizeFacilities(facilities);
    const selectedFacilityCard = syncSelectedFacilityCard(
      facilityCards,
      this.data.selectedFacilityId
    );

    this.setData({
      run,
      dwellingLevel: run ? run.dwelling_level : 1,
      facilities,
      facilityCards,
      selectedFacilityCard,
      builtFacilityCount: facilities.filter((item) => item.level > 0).length,
      dwelling_last_settlement: settlement,
      settlementSummary: buildSettlementSummary(settlement),
      settlementLines: settlement ? settlement.summary_lines || [] : [],
      panelTabs: buildPanelTabs(this.data.activePanel),
      error: snapshot.error || "",
      loadingFacilityId: "",
    });
  },

  switchPanel(event) {
    const panel = event.currentTarget.dataset.panel;
    const currentPanelIndex = DWELLING_PANELS.indexOf(panel);
    if (currentPanelIndex < 0) {
      return;
    }

    this.setData({
      activePanel: panel,
      currentPanelIndex,
      panelTabs: buildPanelTabs(panel),
    });
  },

  handlePanelSwipe(event) {
    const currentPanelIndex = Number(event.detail.current) || 0;
    const activePanel = DWELLING_PANELS[currentPanelIndex] || DWELLING_PANELS[0];
    this.setData({
      activePanel,
      currentPanelIndex,
      panelTabs: buildPanelTabs(activePanel),
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
        title: error.message || (action === "build" ? "建造失败" : "升级失败"),
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

function buildSettlementSummary(settlement) {
  if (!settlement) {
    return "洞府尚无月结记录，先确定设施布局，再逐步稳定产出。";
  }

  const gains = settlement.total_resource_gains || {};
  return `最近一次结算支出 ${(settlement.total_maintenance_paid || {}).spirit_stone || 0} 灵石，直产 ${
    gains.spirit_stone || 0
  } 灵石，入囊灵植 ${gains.basic_herb || 0}、灵矿 ${gains.basic_ore || 0}、灵泉 ${
    gains.spirit_spring_water || 0
  }。`;
}

function buildPanelTabs(activePanel) {
  return [
    { id: "facilities", label: "设施", active: activePanel === "facilities" },
    { id: "overview", label: "总览", active: activePanel === "overview" },
    { id: "settlement", label: "月结", active: activePanel === "settlement" },
  ];
}

function buildStatusText(status) {
  const labels = {
    active: "运转中",
    paused: "暂停中",
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
