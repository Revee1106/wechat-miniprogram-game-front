const store = require("../../utils/run-store");
const {
  buildBreakthroughHint,
  canAttemptBreakthrough,
  getBreakthroughRequirements,
} = require("../../utils/breakthrough");

Page({
  data: {
    run: null,
    currentEvent: null,
    player: null,
    resources: null,
    dwellingLevel: 1,
    builtFacilityCount: 0,
    dwellingLastSettlement: null,
    dwellingSummaryLine: "",
    alchemyFacilityLevel: 0,
    canBreakthrough: false,
    breakthroughHint: "",
    breakthroughTargetExp: 0,
    breakthroughTargetSpiritStone: 0,
    journeySummary: "",
    eventHistory: [],
    inventorySaleCards: [],
    saleSheetVisible: false,
    selectedSaleResource: null,
    saleQuantity: 1,
    elapsedText: "",
    lifespanText: "",
    activeSection: "player",
    error: "",
    loading: false,
    saleLoadingKey: "",
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

    if (run && run.character && run.character.is_dead) {
      wx.reLaunch({ url: "/pages/summary/summary" });
      return;
    }

    const requirements = getBreakthroughRequirements(run);
    const canBreakthrough = canAttemptBreakthrough(run);

    this.setData({
      run,
      currentEvent: run ? run.current_event : null,
      player: run ? run.character : null,
      resources: run ? run.resources : null,
      dwellingLevel: run ? run.dwelling_level || 1 : 1,
      builtFacilityCount: run
        ? (run.dwelling_facilities || []).filter((item) => item.level > 0).length
        : 0,
      dwellingLastSettlement: run ? run.dwelling_last_settlement : null,
      dwellingSummaryLine: buildDwellingSummaryLine(run),
      alchemyFacilityLevel: getFacilityLevel(run, "alchemy_room"),
      canBreakthrough,
      breakthroughHint: buildBreakthroughHint(run, canBreakthrough),
      breakthroughTargetExp: requirements.requiredCultivationExp,
      breakthroughTargetSpiritStone: requirements.requiredSpiritStone,
      journeySummary: buildJourneySummary(run),
      eventHistory: snapshot.eventHistory || [],
      inventorySaleCards: buildInventorySaleCards(run),
      saleSheetVisible: false,
      selectedSaleResource: null,
      saleQuantity: 1,
      elapsedText: run ? formatMonths(run.round_index || 0) : "0年0个月",
      lifespanText:
        run && run.character ? formatMonths(run.character.lifespan_current) : "0年0个月",
      error: snapshot.error || "",
      saleLoadingKey: "",
    });
  },

  async advanceTime() {
    if (!this.data.run) {
      wx.reLaunch({ url: "/pages/home/home" });
      return;
    }

    this.setData({ loading: true, error: "" });

    try {
      const snapshot = await store.advanceTime();
      this.syncState();

      if (snapshot.run && snapshot.run.character && snapshot.run.character.is_dead) {
        wx.reLaunch({ url: "/pages/summary/summary" });
      }
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

  async handleChoice(event) {
    this.setData({ loading: true, error: "" });

    try {
      const snapshot = await store.resolveEvent(event.detail.optionId);
      this.syncState();

      if (snapshot.run && snapshot.run.character && snapshot.run.character.is_dead) {
        wx.reLaunch({ url: "/pages/summary/summary" });
      }
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

  async attemptBreakthrough() {
    if (!this.data.run) {
      wx.reLaunch({ url: "/pages/home/home" });
      return;
    }

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

  openSaleSheet(event) {
    const resourceKey = event.currentTarget.dataset.resourceKey;
    const selectedSaleResource = this.data.inventorySaleCards.find(
      (item) => item.resourceKey === resourceKey
    );
    if (!selectedSaleResource) {
      return;
    }
    this.setData({
      saleSheetVisible: true,
      selectedSaleResource,
      saleQuantity: 1,
      error: "",
    });
  },

  closeSaleSheet() {
    this.setData({
      saleSheetVisible: false,
      selectedSaleResource: null,
      saleQuantity: 1,
    });
  },

  decreaseSaleQuantity() {
    const maxQuantity = getSelectedSaleMax(this.data.selectedSaleResource);
    if (maxQuantity <= 0) {
      return;
    }
    this.setData({
      saleQuantity: Math.max(1, (Number(this.data.saleQuantity) || 1) - 1),
    });
  },

  increaseSaleQuantity() {
    const maxQuantity = getSelectedSaleMax(this.data.selectedSaleResource);
    if (maxQuantity <= 0) {
      return;
    }
    this.setData({
      saleQuantity: Math.min(maxQuantity, (Number(this.data.saleQuantity) || 1) + 1),
    });
  },

  fillSaleQuantity(event) {
    const mode = event.currentTarget.dataset.mode;
    const maxQuantity = getSelectedSaleMax(this.data.selectedSaleResource);
    if (maxQuantity <= 0) {
      return;
    }
    this.setData({
      saleQuantity:
        mode === "all" ? maxQuantity : Math.max(1, Math.ceil(maxQuantity / 2)),
    });
  },

  async confirmSaleQuantity() {
    const selectedSaleResource = this.data.selectedSaleResource;
    await this.handleSellResource(
      selectedSaleResource ? selectedSaleResource.resourceKey : "",
      Number(this.data.saleQuantity) || 0,
      selectedSaleResource ? selectedSaleResource.displayName : ""
    );
  },

  openDwellingPage() {
    wx.navigateTo({ url: "/pages/dwelling/dwelling" });
  },

  openCraftingPage() {
    wx.navigateTo({ url: "/pages/crafting/crafting" });
  },

  handleSectionChange(event) {
    this.setData({ activeSection: event.detail.section });
  },

  noop() {},

  async handleSellResource(resourceKey, amount, displayName) {
    if (!this.data.run) {
      wx.reLaunch({ url: "/pages/home/home" });
      return;
    }
    if (!resourceKey || amount <= 0) {
      return;
    }
    const selectedSaleResource = this.data.selectedSaleResource;
    const unitPrice = Number(
      (selectedSaleResource && selectedSaleResource.unitPrice) || 0
    );

    this.setData({ loading: true, saleLoadingKey: resourceKey, error: "" });

    try {
      const gainedSpiritStone = unitPrice * amount;
      await store.sellResource(resourceKey, amount);
      this.syncState();
      this.closeSaleSheet();
      wx.showToast({
        title: `${displayName || "资源"} x${amount}，获得 ${gainedSpiritStone} 灵石`,
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
      this.setData({ loading: false, saleLoadingKey: "" });
    }
  },
});

function buildJourneySummary(run) {
  if (!run) {
    return "命卷未立，尚无可推演之程。";
  }

  if (run.character && run.character.is_dead) {
    return "此身寿尽，请转往终卷。";
  }

  if (run.current_event) {
    return "异闻已现，先定去留，再续行程。";
  }

  return "此刻只需继续推进时间。";
}

function buildDwellingSummaryLine(run) {
  if (!run || !run.dwelling_last_settlement) {
    return "洞府初成，先定下营建方向，再逐步铺开修行根基。";
  }

  const settlement = run.dwelling_last_settlement;
  const resourceGains = settlement.total_resource_gains || {};
  return `上月维持支出 ${settlement.total_maintenance_paid.spirit_stone || 0} 灵石，直产灵石 ${
    resourceGains.spirit_stone || 0
  }，入囊灵植 ${resourceGains.basic_herb || 0}、灵矿 ${resourceGains.basic_ore || 0}、灵泉 ${
    resourceGains.spirit_spring_water || 0
  }。`;
}

function formatMonths(totalMonths) {
  const safeMonths = Math.max(0, Number(totalMonths) || 0);
  const years = Math.floor(safeMonths / 12);
  const months = safeMonths % 12;
  return `${years}年${months}个月`;
}

function isMissingRunError(error) {
  const message = String((error && error.message) || "");
  return /run .* not found/i.test(message) || /No active run/i.test(message);
}

function getFacilityLevel(run, facilityId) {
  if (!run || !run.dwelling_facilities) {
    return 0;
  }
  const facility = run.dwelling_facilities.find((item) => item.facility_id === facilityId);
  return facility ? facility.level || 0 : 0;
}

function buildInventorySaleCards(run) {
  if (!run) {
    return [];
  }

  const stackAmounts = Object.fromEntries(
    ((run.resource_stacks || []).map((item) => [item.resource_key, Number(item.amount) || 0]))
  );
  const cards = [
    buildSaleCard("basic_herb", "灵植", stackAmounts.basic_herb || 0, 1),
    buildSaleCard("basic_ore", "灵矿", stackAmounts.basic_ore || 0, 2),
    buildSaleCard(
      "spirit_spring_water",
      "灵泉水",
      stackAmounts.spirit_spring_water || 0,
      3
    ),
    buildSaleCard(
      "basic_breakthrough_material",
      "普通晋级材料",
      stackAmounts.basic_breakthrough_material || 0,
      4
    ),
    buildSaleCard("rare_material", "稀有材料", stackAmounts.rare_material || 0, 10),
  ];

  return cards.filter((item) => item.amount > 0);
}

function buildSaleCard(resourceKey, displayName, amount, unitPrice) {
  return {
    resourceKey,
    displayName,
    amount,
    unitPrice,
    totalPrice: amount * unitPrice,
  };
}

function getSelectedSaleMax(selectedSaleResource) {
  return Number((selectedSaleResource && selectedSaleResource.amount) || 0);
}
