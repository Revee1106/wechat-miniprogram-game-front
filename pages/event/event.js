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
    dwellingLastSettlement: null,
    dwellingFinanceSummary: "",
    dwellingFinanceLines: [],
    canBreakthrough: false,
    breakthroughHint: "",
    breakthroughTargetExp: 0,
    breakthroughTargetSpiritStone: 0,
    journeySummary: "",
    eventHistory: [],
    dwellingSettlementHistory: [],
    inventoryCards: [],
    inventoryActionSheetVisible: false,
    selectedInventoryResource: null,
    selectedInventoryAction: null,
    inventoryActionQuantity: 1,
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
      dwellingLastSettlement: run ? run.dwelling_last_settlement : null,
      dwellingFinanceSummary: buildDwellingFinanceSummary(run),
      dwellingFinanceLines: buildDwellingFinanceLines(run),
      canBreakthrough,
      breakthroughHint: buildBreakthroughHint(run, canBreakthrough),
      breakthroughTargetExp: requirements.requiredCultivationExp,
      breakthroughTargetSpiritStone: requirements.requiredSpiritStone,
      journeySummary: buildJourneySummary(run),
      eventHistory: snapshot.eventHistory || [],
      dwellingSettlementHistory: snapshot.dwellingSettlementHistory || [],
      inventoryCards: buildInventoryCards(run),
      inventoryActionSheetVisible: false,
      selectedInventoryResource: null,
      selectedInventoryAction: null,
      inventoryActionQuantity: 1,
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

    const stallWarning = buildDwellingStallWarning(this.data.run);
    if (stallWarning) {
      const modalResult = await showDwellingStallWarningModal(stallWarning);
      if (!modalResult.confirm) {
        return;
      }
    }

    await this.performAdvanceTime();
  },

  async performAdvanceTime() {
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

  openInventoryActionSheet(event) {
    const resourceKey = event.currentTarget.dataset.resourceKey;
    const selectedInventoryResource = this.data.inventoryCards.find(
      (item) => item.resourceKey === resourceKey
    );
    if (!selectedInventoryResource || !selectedInventoryResource.actions.length) {
      return;
    }

    const selectedInventoryAction = selectedInventoryResource.actions[0];
    this.setData({
      inventoryActionSheetVisible: true,
      selectedInventoryResource,
      selectedInventoryAction,
      inventoryActionQuantity: selectedInventoryResource.amount > 0 ? 1 : 0,
      error: "",
    });
  },

  closeInventoryActionSheet() {
    this.setData({
      inventoryActionSheetVisible: false,
      selectedInventoryResource: null,
      selectedInventoryAction: null,
      inventoryActionQuantity: 1,
    });
  },

  selectInventoryAction(event) {
    const actionKey = event.currentTarget.dataset.actionKey;
    const selectedInventoryResource = this.data.selectedInventoryResource;
    if (!selectedInventoryResource) {
      return;
    }

    const selectedInventoryAction = (selectedInventoryResource.actions || []).find(
      (item) => item.actionKey === actionKey
    );
    if (!selectedInventoryAction) {
      return;
    }

    this.setData({
      selectedInventoryAction,
      inventoryActionQuantity: selectedInventoryResource.amount > 0 ? 1 : 0,
    });
  },

  decreaseInventoryActionQuantity() {
    const maxQuantity = getSelectedInventoryMax(this.data.selectedInventoryResource);
    if (maxQuantity <= 0) {
      return;
    }
    this.setData({
      inventoryActionQuantity: Math.max(
        1,
        (Number(this.data.inventoryActionQuantity) || 1) - 1
      ),
    });
  },

  increaseInventoryActionQuantity() {
    const maxQuantity = getSelectedInventoryMax(this.data.selectedInventoryResource);
    if (maxQuantity <= 0) {
      return;
    }
    this.setData({
      inventoryActionQuantity: Math.min(
        maxQuantity,
        (Number(this.data.inventoryActionQuantity) || 1) + 1
      ),
    });
  },

  fillInventoryActionQuantity(event) {
    const mode = event.currentTarget.dataset.mode;
    const maxQuantity = getSelectedInventoryMax(this.data.selectedInventoryResource);
    if (maxQuantity <= 0) {
      return;
    }
    this.setData({
      inventoryActionQuantity:
        mode === "all" ? maxQuantity : Math.max(1, Math.ceil(maxQuantity / 2)),
    });
  },

  async confirmInventoryAction() {
    const selectedInventoryResource = this.data.selectedInventoryResource;
    const selectedInventoryAction = this.data.selectedInventoryAction;
    await this.handleInventoryAction(
      selectedInventoryAction ? selectedInventoryAction.actionKey : "",
      selectedInventoryResource ? selectedInventoryResource.resourceKey : "",
      Number(this.data.inventoryActionQuantity) || 0,
      selectedInventoryResource ? selectedInventoryResource.displayName : ""
    );
  },

  openDwellingPage() {
    wx.navigateTo({ url: "/pages/dwelling/dwelling" });
  },

  handleSectionChange(event) {
    this.setData({ activeSection: event.detail.section });
  },

  noop() {},

  async handleInventoryAction(actionKey, resourceKey, amount, displayName) {
    if (!this.data.run) {
      wx.reLaunch({ url: "/pages/home/home" });
      return;
    }
    if (!actionKey || !resourceKey || amount <= 0) {
      return;
    }

    const selectedInventoryAction = this.data.selectedInventoryAction;
    const outputRatio = Number(
      (selectedInventoryAction && selectedInventoryAction.outputRatio) || 0
    );

    this.setData({
      loading: true,
      saleLoadingKey: `${resourceKey}:${actionKey}`,
      error: "",
    });

    try {
      if (actionKey === "sell_for_spirit_stone") {
        const gainedSpiritStone = outputRatio * amount;
        await store.sellResource(resourceKey, amount);
        this.syncState();
        this.closeInventoryActionSheet();
        wx.showToast({
          title: `${displayName || "资源"} x${amount}，获得 ${gainedSpiritStone} 灵石`,
          icon: "none",
        });
        return;
      }

      if (actionKey === "convert_to_cultivation") {
        const gainedCultivationExp = outputRatio * amount;
        await store.convertSpiritStoneToCultivation(amount);
        this.syncState();
        this.closeInventoryActionSheet();
        wx.showToast({
          title: `${displayName || "资源"} x${amount}，转化 ${gainedCultivationExp} 修为`,
          icon: "none",
        });
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

function buildDwellingStallWarning(run) {
  if (!run || !run.dwelling_facilities || !run.resources) {
    return "";
  }

  let remainingSpiritStone = Number(run.resources.spirit_stone) || 0;
  const stalledFacilities = [];

  (run.dwelling_facilities || []).forEach((facility) => {
    if (!facility || Number(facility.level) <= 0) {
      return;
    }

    const maintenanceCost = Number((facility.maintenance_cost || {}).spirit_stone) || 0;
    if (maintenanceCost <= 0) {
      return;
    }

    if (remainingSpiritStone >= maintenanceCost) {
      remainingSpiritStone -= maintenanceCost;
      return;
    }

    stalledFacilities.push(facility.display_name || facility.facility_id || "未知设施");
  });

  if (!stalledFacilities.length) {
    return "";
  }

  return `继续推进时间后，以下设施将因灵石不足停摆：${stalledFacilities.join(
    "、"
  )}。是否仍旧推进？`;
}

function showDwellingStallWarningModal(content) {
  return new Promise((resolve) => {
    wx.showModal({
      title: "洞府可能停摆",
      content,
      confirmText: "仍旧推进",
      cancelText: "取消推进",
      success(result) {
        resolve(result);
      },
      fail() {
        resolve({ confirm: false, cancel: true });
      },
    });
  });
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

function buildDwellingFinanceSummary(run) {
  if (!run || !run.dwelling_last_settlement) {
    return "尚无月结记录，先完成首轮洞府营建。";
  }

  return "洞府本月结算已入账。";
}

function buildDwellingFinanceLines(run) {
  const settlement = run ? run.dwelling_last_settlement : null;
  const maintenance = Number(
    settlement ? (settlement.total_maintenance_paid || {}).spirit_stone || 0 : 0
  );
  const income = Number(
    settlement ? (settlement.total_resource_gains || {}).spirit_stone || 0 : 0
  );
  return [`维护支出 ${maintenance} 灵石`, `收入 ${income} 灵石`];
}

function buildInventoryCards(run) {
  if (!run) {
    return [];
  }

  const stackAmounts = Object.fromEntries(
    (run.resource_stacks || []).map((item) => [item.resource_key, Number(item.amount) || 0])
  );

  return [
    buildInventoryCard("spirit_stone", "灵石", Number(run.resources.spirit_stone) || 0, [
      buildInventoryAction(
        "convert_to_cultivation",
        "转化为修为",
        5,
        "修为",
        "确认转化"
      ),
    ]),
    buildInventoryCard("herb", "药草", Number(run.resources.herbs) || 0, [
      buildInventoryAction(
        "sell_for_spirit_stone",
        "出售",
        2,
        "灵石",
        "确认出售"
      ),
    ]),
    buildInventoryCard("iron_essence", "玄铁精华", Number(run.resources.iron_essence) || 0, []),
    buildInventoryCard("basic_herb", "灵植", stackAmounts.basic_herb || 0, [
      buildInventoryAction(
        "sell_for_spirit_stone",
        "出售",
        1,
        "灵石",
        "确认出售"
      ),
    ]),
    buildInventoryCard("basic_ore", "灵矿", stackAmounts.basic_ore || 0, [
      buildInventoryAction(
        "sell_for_spirit_stone",
        "出售",
        2,
        "灵石",
        "确认出售"
      ),
    ]),
    buildInventoryCard("spirit_spring_water", "灵泉水", stackAmounts.spirit_spring_water || 0, [
      buildInventoryAction(
        "sell_for_spirit_stone",
        "出售",
        3,
        "灵石",
        "确认出售"
      ),
    ]),
  ].filter((item) => item.amount > 0);
}

function buildInventoryCard(resourceKey, displayName, amount, actions) {
  return {
    resourceKey,
    displayName,
    amount,
    actions,
  };
}

function buildInventoryAction(actionKey, label, outputRatio, outputLabel, confirmLabel) {
  return {
    actionKey,
    label,
    outputRatio,
    outputLabel,
    confirmLabel,
  };
}

function getSelectedInventoryMax(selectedInventoryResource) {
  return Number((selectedInventoryResource && selectedInventoryResource.amount) || 0);
}
