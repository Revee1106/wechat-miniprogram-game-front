const store = require("../../utils/run-store");

const CRAFTING_PANELS = ["recipes", "job", "inventory"];

Page({
  data: {
    run: null,
    alchemy_state: null,
    recipeCards: [],
    inventoryCards: [],
    spiritSpringWaterAmount: 0,
    activePanel: "recipes",
    currentPanelIndex: 0,
    panelTabs: buildPanelTabs("recipes"),
    error: "",
    loadingRecipeId: "",
    loadingInventoryKey: "",
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
    const alchemyState = run ? normalizeAlchemyState(run.alchemy_state) : null;
    this.setData({
      run,
      alchemy_state: alchemyState,
      recipeCards: alchemyState ? alchemyState.available_recipes || [] : [],
      inventoryCards: alchemyState ? alchemyState.inventory || [] : [],
      spiritSpringWaterAmount: run ? getResourceStackAmount(run, "spirit_spring_water") : 0,
      panelTabs: buildPanelTabs(this.data.activePanel),
      error: snapshot.error || "",
      loadingRecipeId: "",
      loadingInventoryKey: "",
    });
  },

  switchPanel(event) {
    const panel = event.currentTarget.dataset.panel;
    const currentPanelIndex = CRAFTING_PANELS.indexOf(panel);
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
    const activePanel = CRAFTING_PANELS[currentPanelIndex] || CRAFTING_PANELS[0];
    this.setData({
      activePanel,
      currentPanelIndex,
      panelTabs: buildPanelTabs(activePanel),
    });
  },

  async startAlchemy(event) {
    await this.handleStartAlchemy(event.currentTarget.dataset.recipeId, false);
  },

  async startAlchemyWithSpring(event) {
    await this.handleStartAlchemy(event.currentTarget.dataset.recipeId, true);
  },

  returnToJourney() {
    wx.navigateBack({
      fail() {
        wx.navigateTo({ url: "/pages/event/event" });
      },
    });
  },

  async handleStartAlchemy(recipeId, useSpiritSpring) {
    if (!this.data.run) {
      wx.reLaunch({ url: "/pages/home/home" });
      return;
    }

    this.setData({ loadingRecipeId: recipeId, error: "" });
    try {
      await store.startAlchemy(recipeId, useSpiritSpring);
      this.syncState();
      wx.showToast({
        title: useSpiritSpring ? "已借灵泉开炉" : "已起炉火",
        icon: "none",
      });
    } catch (error) {
      this.setData({ error: error.message, loadingRecipeId: "" });
    }
  },

  async consumeItem(event) {
    if (!this.data.run) {
      wx.reLaunch({ url: "/pages/home/home" });
      return;
    }

    const { itemId, quality } = event.currentTarget.dataset;
    const loadingInventoryKey = `${itemId}-${quality}`;
    this.setData({ loadingInventoryKey, error: "" });
    try {
      await store.consumeAlchemyItem(itemId, quality);
      this.syncState();
      wx.showToast({
        title: "丹药已服用",
        icon: "none",
      });
    } catch (error) {
      this.setData({ error: error.message, loadingInventoryKey: "" });
    }
  },
});

function normalizeAlchemyState(alchemyState) {
  if (!alchemyState) {
    return null;
  }

  return {
    ...alchemyState,
    available_recipes: (alchemyState.available_recipes || []).map((item) => ({
      ...item,
      ingredientsText: buildIngredientsText(item.ingredients || {}),
    })),
    inventory: (alchemyState.inventory || []).map((item) => ({
      ...item,
      inventoryKey: `${item.item_id}-${item.quality}`,
    })),
  };
}

function buildIngredientsText(ingredients) {
  const labels = {
    herb: "药草",
    ore: "灵矿",
    spirit_stone: "灵石",
    spirit_spring_water: "灵泉水",
  };
  const entries = Object.keys(ingredients).map(
    (key) => `${labels[key] || key} x${ingredients[key]}`
  );
  return entries.join(" / ");
}

function buildPanelTabs(activePanel) {
  return [
    { id: "recipes", label: "丹方", active: activePanel === "recipes" },
    { id: "job", label: "炉次", active: activePanel === "job" },
    { id: "inventory", label: "库存", active: activePanel === "inventory" },
  ];
}

function getResourceStackAmount(run, resourceKey) {
  const stack = (run.resource_stacks || []).find((item) => item.resource_key === resourceKey);
  return stack ? stack.amount : 0;
}

function isMissingRunError(error) {
  const message = String((error && error.message) || "");
  return /run .* not found/i.test(message) || /No active run/i.test(message);
}
