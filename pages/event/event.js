const store = require("../../utils/run-store");
const {
  formatFacilityName,
  isMissingRunError,
} = require("../../src/game/utils/display-text");
const {
  buildBreakthroughHint,
  canAttemptBreakthrough,
  getBreakthroughRequirements,
} = require("../../utils/breakthrough");

const DEFAULT_ACTIVE_SECTION = "player";
const VALID_SECTIONS = ["player", "resources", "cultivation", "dwelling"];

const CULTIVATION_CAP_PROMPT_COPY = {
  title: "修为已满",
  description: "若不突破，则无法继续获得修为，是否继续推进时间？",
  confirmText: "继续推进",
  cancelText: "放弃推进",
};

Page({
  data: {
    run: null,
    currentEvent: null,
    currentEventChoices: [],
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
    eventHistoryDisplay: [],
    dwellingSettlementHistory: [],
    dwellingSettlementHistoryDisplay: [],
    inventoryCards: [],
    inventoryActionSheetVisible: false,
    selectedInventoryResource: null,
    selectedInventoryAction: null,
    inventoryActionButtons: [],
    inventoryActionQuantity: 1,
    inventoryActionHasMultipleOptions: false,
    inventoryActionCurrentLabel: "",
    inventoryActionTotalText: "",
    inventoryActionLoading: false,
    inventoryActionConfirmDisabled: true,
    cultivationCapPromptVisible: false,
    cultivationCapPromptSkipFuture: false,
    cultivationCapPromptTitle: CULTIVATION_CAP_PROMPT_COPY.title,
    cultivationCapPromptDescription: CULTIVATION_CAP_PROMPT_COPY.description,
    cultivationCapPromptConfirmText: CULTIVATION_CAP_PROMPT_COPY.confirmText,
    cultivationCapPromptCancelText: CULTIVATION_CAP_PROMPT_COPY.cancelText,
    cultivationCapToggleClass: buildCultivationCapToggleClass(false),
    elapsedText: "",
    lifespanText: "",
    realmDisplayText: "未立命牌",
    cultivationDisplayText: "--",
    luckDisplayText: "--",
    activeSection: DEFAULT_ACTIVE_SECTION,
    journeyOverviewClass: buildJourneyOverviewClass(DEFAULT_ACTIVE_SECTION),
    showDwellingOverview: false,
    showPlayerSection: true,
    showResourcesSection: false,
    showCultivationSection: false,
    showDwellingSection: false,
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

    const player = run ? run.character : null;
    const resources = run ? run.resources : null;
    const activeSection = normalizeSection(this.data.activeSection);
    const requirements = getBreakthroughRequirements(run);
    const canBreakthrough = canAttemptBreakthrough(run);
    const dwellingFinanceSummary = buildDwellingFinanceSummary(run);
    const dwellingFinanceLines = buildDwellingFinanceLines(run);
    const inventoryCards = buildInventoryCards(run);
    const sectionState = buildSectionState(activeSection);

    this.setData({
      run,
      currentEvent: run ? run.current_event : null,
      currentEventChoices: buildCurrentEventChoices(run),
      player,
      resources,
      dwellingLevel: run ? Number(run.dwelling_level) || 1 : 1,
      dwellingLastSettlement: run ? run.dwelling_last_settlement : null,
      dwellingFinanceSummary,
      dwellingFinanceLines,
      canBreakthrough,
      breakthroughHint: buildBreakthroughHint(run, canBreakthrough),
      breakthroughTargetExp: requirements.requiredCultivationExp,
      breakthroughTargetSpiritStone: requirements.requiredSpiritStone,
      journeySummary: buildJourneySummary(run),
      eventHistory: snapshot.eventHistory || [],
      eventHistoryDisplay: buildHistoryDisplay(snapshot.eventHistory || []),
      dwellingSettlementHistory: snapshot.dwellingSettlementHistory || [],
      dwellingSettlementHistoryDisplay: buildDwellingSettlementHistoryDisplay(
        snapshot.dwellingSettlementHistory || [],
        dwellingFinanceSummary,
        dwellingFinanceLines
      ),
      inventoryCards,
      inventoryActionSheetVisible: false,
      selectedInventoryResource: null,
      selectedInventoryAction: null,
      inventoryActionButtons: [],
      inventoryActionQuantity: 1,
      inventoryActionHasMultipleOptions: false,
      inventoryActionCurrentLabel: "",
      inventoryActionTotalText: "",
      inventoryActionLoading: false,
      inventoryActionConfirmDisabled: true,
      cultivationCapPromptVisible: false,
      cultivationCapPromptSkipFuture: false,
      cultivationCapPromptTitle: CULTIVATION_CAP_PROMPT_COPY.title,
      cultivationCapPromptDescription: CULTIVATION_CAP_PROMPT_COPY.description,
      cultivationCapPromptConfirmText: CULTIVATION_CAP_PROMPT_COPY.confirmText,
      cultivationCapPromptCancelText: CULTIVATION_CAP_PROMPT_COPY.cancelText,
      cultivationCapToggleClass: buildCultivationCapToggleClass(false),
      elapsedText: run ? formatMonths(run.round_index) : formatMonths(0),
      lifespanText: player ? formatMonths(player.lifespan_current) : formatMonths(0),
      realmDisplayText: buildRealmDisplayText(player),
      cultivationDisplayText: buildCultivationDisplayText(
        player,
        requirements.requiredCultivationExp
      ),
      luckDisplayText: buildLuckDisplayText(player),
      error: snapshot.error || "",
      loading: false,
      saleLoadingKey: "",
      ...sectionState,
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

    if (
      shouldShowCultivationCapPrompt(this.data.run) &&
      !store.isCultivationCapPromptSuppressed()
    ) {
      this.showCultivationCapPrompt();
      return;
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
    const inventoryActionQuantity = selectedInventoryResource.amount > 0 ? 1 : 0;

    this.setData({
      inventoryActionSheetVisible: true,
      selectedInventoryResource,
      selectedInventoryAction,
      inventoryActionQuantity,
      error: "",
      ...buildInventorySheetState(
        selectedInventoryResource,
        selectedInventoryAction,
        inventoryActionQuantity,
        this.data.loading,
        this.data.saleLoadingKey
      ),
    });
  },

  closeInventoryActionSheet() {
    this.setData({
      inventoryActionSheetVisible: false,
      selectedInventoryResource: null,
      selectedInventoryAction: null,
      inventoryActionButtons: [],
      inventoryActionQuantity: 1,
      inventoryActionHasMultipleOptions: false,
      inventoryActionCurrentLabel: "",
      inventoryActionTotalText: "",
      inventoryActionLoading: false,
      inventoryActionConfirmDisabled: true,
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

    const inventoryActionQuantity = selectedInventoryResource.amount > 0 ? 1 : 0;

    this.setData({
      selectedInventoryAction,
      inventoryActionQuantity,
      ...buildInventorySheetState(
        selectedInventoryResource,
        selectedInventoryAction,
        inventoryActionQuantity,
        this.data.loading,
        this.data.saleLoadingKey
      ),
    });
  },

  decreaseInventoryActionQuantity() {
    const maxQuantity = getSelectedInventoryMax(this.data.selectedInventoryResource);
    if (maxQuantity <= 0) {
      return;
    }

    const inventoryActionQuantity = Math.max(
      1,
      (Number(this.data.inventoryActionQuantity) || 1) - 1
    );

    this.setData({
      inventoryActionQuantity,
      ...buildInventorySheetState(
        this.data.selectedInventoryResource,
        this.data.selectedInventoryAction,
        inventoryActionQuantity,
        this.data.loading,
        this.data.saleLoadingKey
      ),
    });
  },

  increaseInventoryActionQuantity() {
    const maxQuantity = getSelectedInventoryMax(this.data.selectedInventoryResource);
    if (maxQuantity <= 0) {
      return;
    }

    const inventoryActionQuantity = Math.min(
      maxQuantity,
      (Number(this.data.inventoryActionQuantity) || 1) + 1
    );

    this.setData({
      inventoryActionQuantity,
      ...buildInventorySheetState(
        this.data.selectedInventoryResource,
        this.data.selectedInventoryAction,
        inventoryActionQuantity,
        this.data.loading,
        this.data.saleLoadingKey
      ),
    });
  },

  fillInventoryActionQuantity(event) {
    const mode = event.currentTarget.dataset.mode;
    const maxQuantity = getSelectedInventoryMax(this.data.selectedInventoryResource);

    if (maxQuantity <= 0) {
      return;
    }

    const inventoryActionQuantity =
      mode === "all" ? maxQuantity : Math.max(1, Math.ceil(maxQuantity / 2));

    this.setData({
      inventoryActionQuantity,
      ...buildInventorySheetState(
        this.data.selectedInventoryResource,
        this.data.selectedInventoryAction,
        inventoryActionQuantity,
        this.data.loading,
        this.data.saleLoadingKey
      ),
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

  showCultivationCapPrompt() {
    this.setData({
      cultivationCapPromptVisible: true,
      cultivationCapPromptSkipFuture: false,
      cultivationCapPromptTitle: CULTIVATION_CAP_PROMPT_COPY.title,
      cultivationCapPromptDescription: CULTIVATION_CAP_PROMPT_COPY.description,
      cultivationCapPromptConfirmText: CULTIVATION_CAP_PROMPT_COPY.confirmText,
      cultivationCapPromptCancelText: CULTIVATION_CAP_PROMPT_COPY.cancelText,
      cultivationCapToggleClass: buildCultivationCapToggleClass(false),
    });
  },

  toggleCultivationCapPromptSkip() {
    const cultivationCapPromptSkipFuture = !this.data.cultivationCapPromptSkipFuture;

    this.setData({
      cultivationCapPromptSkipFuture,
      cultivationCapToggleClass: buildCultivationCapToggleClass(
        cultivationCapPromptSkipFuture
      ),
    });
  },

  async confirmCultivationCapAdvance() {
    if (this.data.cultivationCapPromptSkipFuture) {
      store.markCultivationCapPromptSuppressed();
    }

    this.setData({
      cultivationCapPromptVisible: false,
      cultivationCapPromptSkipFuture: false,
      cultivationCapToggleClass: buildCultivationCapToggleClass(false),
    });

    await this.performAdvanceTime();
  },

  cancelCultivationCapAdvance() {
    this.setData({
      cultivationCapPromptVisible: false,
      cultivationCapPromptSkipFuture: false,
      cultivationCapToggleClass: buildCultivationCapToggleClass(false),
    });
  },

  handleSectionChange(event) {
    this.setData(buildSectionState(event.detail.section));
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

    const loadingKey = buildSaleLoadingKey(resourceKey, actionKey);
    const selectedInventoryAction = this.data.selectedInventoryAction;
    const outputRatio = Number(
      (selectedInventoryAction && selectedInventoryAction.outputRatio) || 0
    );

    this.setData({
      loading: true,
      saleLoadingKey: loadingKey,
      error: "",
      ...buildInventorySheetState(
        this.data.selectedInventoryResource,
        this.data.selectedInventoryAction,
        this.data.inventoryActionQuantity,
        true,
        loadingKey
      ),
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

      this.setData({
        error: error.message,
        loading: false,
        saleLoadingKey: "",
        ...buildInventorySheetState(
          this.data.selectedInventoryResource,
          this.data.selectedInventoryAction,
          this.data.inventoryActionQuantity,
          false,
          ""
        ),
      });
      return;
    }

    this.setData({ loading: false, saleLoadingKey: "" });
  },
});

function buildCurrentEventChoices(run) {
  const currentEvent = run ? run.current_event : null;
  return currentEvent && Array.isArray(currentEvent.options) ? currentEvent.options : [];
}

function normalizeSection(section) {
  return VALID_SECTIONS.includes(section) ? section : DEFAULT_ACTIVE_SECTION;
}

function buildSectionState(section) {
  const activeSection = normalizeSection(section);

  return {
    activeSection,
    journeyOverviewClass: buildJourneyOverviewClass(activeSection),
    showDwellingOverview: activeSection === "dwelling",
    showPlayerSection: activeSection === "player",
    showResourcesSection: activeSection === "resources",
    showCultivationSection: activeSection === "cultivation",
    showDwellingSection: activeSection === "dwelling",
  };
}

function buildJourneyOverviewClass(activeSection) {
  return activeSection === "dwelling"
    ? "journey-overview is-dwelling-overview"
    : "journey-overview";
}

function buildCultivationCapToggleClass(isSelected) {
  return isSelected
    ? "ghost-button cultivation-cap-toggle is-selected"
    : "ghost-button cultivation-cap-toggle";
}

function buildRealmDisplayText(player) {
  if (!player) {
    return "未立命牌";
  }

  return player.realm_display_name || player.realm || "未立命牌";
}

function buildCultivationDisplayText(player, breakthroughTargetExp) {
  if (!player) {
    return "--";
  }

  const cultivationExp = Number(player.cultivation_exp) || 0;
  const targetExp = Number(breakthroughTargetExp) || 0;
  return `${cultivationExp} / ${targetExp}`;
}

function buildLuckDisplayText(player) {
  if (!player || typeof player.luck === "undefined" || player.luck === null) {
    return "--";
  }

  return `${player.luck}`;
}

function buildHistoryDisplay(items) {
  return (items || []).map((item, index) => ({
    ...item,
    opacityStyle: buildHistoryOpacityStyle(index),
  }));
}

function buildDwellingSettlementHistoryDisplay(history, summary, impactLines) {
  const sourceHistory =
    history && history.length
      ? history
      : [
          {
            historyKey: "current",
            summary,
            impactLines,
          },
        ];

  return buildHistoryDisplay(sourceHistory);
}

function buildHistoryOpacityStyle(index) {
  if (index === 0) {
    return "opacity: 1;";
  }

  if (index === 1) {
    return "opacity: 0.68;";
  }

  return "opacity: 0.4;";
}

function buildInventorySheetState(
  selectedInventoryResource,
  selectedInventoryAction,
  inventoryActionQuantity,
  loading,
  saleLoadingKey
) {
  const safeQuantity = Math.max(0, Number(inventoryActionQuantity) || 0);
  const actions =
    selectedInventoryResource && Array.isArray(selectedInventoryResource.actions)
      ? selectedInventoryResource.actions
      : [];
  const selectedActionKey = selectedInventoryAction
    ? selectedInventoryAction.actionKey
    : "";
  const currentLoadingKey = buildSaleLoadingKey(
    selectedInventoryResource ? selectedInventoryResource.resourceKey : "",
    selectedActionKey
  );
  const outputRatio = Number(
    (selectedInventoryAction && selectedInventoryAction.outputRatio) || 0
  );
  const outputLabel = selectedInventoryAction
    ? selectedInventoryAction.outputLabel || ""
    : "";

  return {
    inventoryActionButtons: actions.map((item) => ({
      ...item,
      buttonClass:
        item.actionKey === selectedActionKey
          ? "ghost-button sale-action-button is-selected"
          : "ghost-button sale-action-button",
    })),
    inventoryActionHasMultipleOptions: actions.length > 1,
    inventoryActionCurrentLabel: selectedInventoryAction
      ? selectedInventoryAction.label || ""
      : "",
    inventoryActionTotalText:
      selectedInventoryAction && outputLabel
        ? `${outputRatio * safeQuantity} ${outputLabel}`
        : "",
    inventoryActionLoading:
      Boolean(loading) &&
      Boolean(currentLoadingKey) &&
      currentLoadingKey === saleLoadingKey,
    inventoryActionConfirmDisabled:
      !selectedInventoryResource ||
      !selectedInventoryAction ||
      Number(selectedInventoryResource.amount) <= 0 ||
      safeQuantity <= 0,
  };
}

function buildSaleLoadingKey(resourceKey, actionKey) {
  if (!resourceKey || !actionKey) {
    return "";
  }

  return `${resourceKey}:${actionKey}`;
}

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

    const maintenanceCost =
      Number((facility.maintenance_cost || {}).spirit_stone) || 0;
    if (maintenanceCost <= 0) {
      return;
    }

    if (remainingSpiritStone >= maintenanceCost) {
      remainingSpiritStone -= maintenanceCost;
      return;
    }

    stalledFacilities.push(
      formatFacilityName(facility.facility_id, facility.display_name) || "未知设施"
    );
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

function shouldShowCultivationCapPrompt(run) {
  if (!run || !run.character || !run.breakthrough_requirements || run.character.is_dead) {
    return false;
  }

  return (
    Number(run.character.cultivation_exp || 0) >=
    Number(run.breakthrough_requirements.required_cultivation_exp || 0)
  );
}

function formatMonths(totalMonths) {
  const safeMonths = Math.max(0, Number(totalMonths) || 0);
  const years = Math.floor(safeMonths / 12);
  const months = safeMonths % 12;
  return `${years}年${months}个月`;
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
    (run.resource_stacks || []).map((item) => [
      item.resource_key,
      Number(item.amount) || 0,
    ])
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
    buildInventoryCard(
      "iron_essence",
      "玄铁精华",
      Number(run.resources.iron_essence) || 0,
      []
    ),
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
    buildInventoryCard(
      "spirit_spring_water",
      "灵泉水",
      stackAmounts.spirit_spring_water || 0,
      [
        buildInventoryAction(
          "sell_for_spirit_stone",
          "出售",
          3,
          "灵石",
          "确认出售"
        ),
      ]
    ),
  ].filter((item) => item.amount > 0);
}

function buildInventoryCard(resourceKey, displayName, amount, actions) {
  return {
    resourceKey,
    displayName,
    amount,
    actions,
    cardClass: actions.length
      ? "section-metric inventory-card is-actionable"
      : "section-metric inventory-card",
  };
}

function buildInventoryAction(
  actionKey,
  label,
  outputRatio,
  outputLabel,
  confirmLabel
) {
  return {
    actionKey,
    label,
    outputRatio,
    outputLabel,
    confirmLabel,
  };
}

function getSelectedInventoryMax(selectedInventoryResource) {
  return Number(
    (selectedInventoryResource && selectedInventoryResource.amount) || 0
  );
}
