const store = require("../../utils/run-store");
const { formatResourceName, isMissingRunError } = require("../../src/game/utils/display-text");

const CRAFTING_PANELS = ["recipes", "job", "inventory"];

Page({
  data: {
    run: null,
    alchemy_state: null,
    recipeCards: [],
    selectedRecipeId: "",
    selectedRecipeCard: null,
    recipeSheetVisible: false,
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
    const recipeCards = filterLearnedRecipes(alchemyState ? alchemyState.available_recipes || [] : []);
    const selectedRecipeCard = syncSelectedRecipeCard(recipeCards, this.data.selectedRecipeId);

    this.setData({
      run,
      alchemy_state: alchemyState,
      recipeCards,
      selectedRecipeCard,
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

  openRecipeSheet(event) {
    const recipeId = event.currentTarget.dataset.recipeId;
    const selectedRecipeCard = syncSelectedRecipeCard(this.data.recipeCards, recipeId);
    if (!selectedRecipeCard) {
      return;
    }

    this.setData({
      selectedRecipeId: recipeId,
      selectedRecipeCard,
      recipeSheetVisible: true,
      error: "",
    });
  },

  closeRecipeSheet() {
    this.setData({
      selectedRecipeId: "",
      selectedRecipeCard: null,
      recipeSheetVisible: false,
    });
  },

  async startAlchemy(event) {
    await this.handleStartAlchemy(event.currentTarget.dataset.recipeId);
  },

  returnToJourney() {
    wx.navigateBack({
      fail() {
        wx.navigateTo({ url: "/pages/event/event" });
      },
    });
  },

  async handleStartAlchemy(recipeId) {
    if (!this.data.run) {
      wx.reLaunch({ url: "/pages/home/home" });
      return;
    }

    this.setData({ loadingRecipeId: recipeId, error: "" });
    try {
      await store.startAlchemy(recipeId);
      this.closeRecipeSheet();
      this.syncState();
      wx.showToast({
        title: "已起炉火",
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
      qualityLabel: formatQuality(item),
      qualityTone: getQualityTone(item),
      effectText: buildAlchemyItemEffectText(item),
    })),
  };
}

function filterLearnedRecipes(recipes) {
  return recipes.filter((item) => item.is_unlocked || item.can_start);
}

function syncSelectedRecipeCard(recipeCards, selectedRecipeId) {
  if (!selectedRecipeId) {
    return null;
  }

  return recipeCards.find((item) => item.recipe_id === selectedRecipeId) || null;
}

function buildIngredientsText(ingredients) {
  const entries = Object.keys(ingredients).map(
    (key) => `${formatResourceName(key)} x${ingredients[key]}`
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

function formatQuality(item) {
  if (item.quality_label) {
    return item.quality_label;
  }
  return {
    low: "下品",
    mid: "中品",
    high: "上品",
    supreme: "极品",
  }[item.quality] || item.quality || "未知品质";
}

function getQualityTone(item) {
  if (item.quality_color) {
    return item.quality_color;
  }
  return {
    low: "white",
    mid: "green",
    high: "blue",
    supreme: "purple",
  }[item.quality] || "white";
}

function buildAlchemyItemEffectText(item) {
  const value = Math.trunc(Number(item.effect_value || 0) * getQualityMultiplier(item));
  if (item.effect_type === "cultivation_exp") {
    return `服用后提升 ${value} 点修为`;
  }
  if (item.effect_type === "hp_restore") {
    return `服用后恢复 ${value} 点气血`;
  }
  if (item.effect_type === "lifespan_restore") {
    return `服用后恢复 ${value} 个月寿元`;
  }
  if (item.effect_type === "breakthrough_bonus") {
    return `服用后提高 ${value} 点突破辅助值`;
  }
  return item.effect_summary || "可服用丹药";
}

function getQualityMultiplier(item) {
  if (Number(item.effect_multiplier) > 0) {
    return Number(item.effect_multiplier);
  }
  return {
    low: 1,
    mid: 1.25,
    high: 1.5,
    supreme: 2,
  }[item.quality] || 1;
}
