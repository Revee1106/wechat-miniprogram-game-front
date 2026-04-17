const { createViewportLayout } = require("../core/layout");
const { themeTokens } = require("../theme/tokens");
const { drawScrollCard } = require("../ui/scroll-card");
const { drawSealButton } = require("../ui/seal-button");
const { drawTagButton } = require("../ui/tag-button");
const { buildMainStageViewModel } = require("../view-models/main-stage");
const { buildBattleModalViewModel } = require("../view-models/battle-modal");
const { buildEventModalViewModel } = require("../view-models/event-modal");
const { buildResourcesDrawerViewModel } = require("../view-models/resources-drawer");
const { buildCultivationDrawerViewModel } = require("../view-models/cultivation-drawer");
const { buildDwellingDrawerViewModel } = require("../view-models/dwelling-drawer");
const { buildAlchemyDrawerViewModel } = require("../view-models/alchemy-drawer");
const { buildSummaryModalViewModel } = require("../view-models/summary-modal");
const { drawBattleModal } = require("./battle-modal");
const { drawEventModal } = require("./event-modal");
const { drawResourcesDrawer } = require("./resources-drawer");
const { drawCultivationDrawer } = require("./cultivation-drawer");
const { drawDwellingDrawer } = require("./dwelling-drawer");
const { drawAlchemyDrawer } = require("./alchemy-drawer");
const { drawSummaryModal } = require("./summary-modal");
const { drawConfirmModal } = require("./confirm-modal");

function createMainStageScreen(options) {
  const adapter = options.adapter;
  const requestRender = options.requestRender || (() => {});

  const uiState = {
    activeDrawer: null,
    busy: false,
    toast: "",
    confirmDialog: null,
    selectedResourceKey: "",
  };

  let hitRegions = [];
  let toastTimer = null;

  function registerHitRegion(region) {
    hitRegions.push(region);
  }

  function clearToastTimer() {
    if (toastTimer) {
      clearTimeout(toastTimer);
      toastTimer = null;
    }
  }

  function showToast(message) {
    uiState.toast = String(message || "");
    clearToastTimer();
    requestRender();

    if (!uiState.toast) {
      return;
    }

    toastTimer = setTimeout(() => {
      uiState.toast = "";
      toastTimer = null;
      requestRender();
    }, 2000);
  }

  async function perform(action) {
    if (uiState.busy) {
      return;
    }

    uiState.busy = true;
    requestRender();
    try {
      await action();
    } catch (error) {
      showToast(error && error.message ? error.message : "操作失败");
    } finally {
      uiState.busy = false;
      requestRender();
    }
  }

  function getSnapshot() {
    return adapter.getSnapshot();
  }

  async function handlePrimaryAction(snapshot) {
    const run = snapshot && snapshot.run ? snapshot.run : null;
    if (!run) {
      await perform(() => adapter.createRun("demo-player"));
      return;
    }

    if (run.character && run.character.is_dead) {
      return;
    }

    if (run.active_battle) {
      return;
    }

    if (run.current_event) {
      return;
    }

    await perform(() => adapter.advanceTime());
  }

  function render(frame) {
    const { context, width, height, systemInfo } = frame;
    if (!context) {
      return;
    }

    hitRegions = [];

    const snapshot = getSnapshot();
    const bottomTags = buildBottomTags(snapshot);
    const viewport = createViewportLayout(width, height, {
      safeArea: systemInfo && systemInfo.safeArea ? systemInfo.safeArea : null,
      footerTagRows: Math.ceil(bottomTags.length / 3),
    });
    const stage = buildMainStageViewModel(snapshot);
    const battleModal = buildBattleModalViewModel(snapshot);
    const eventModal = buildEventModalViewModel(snapshot);
    const alchemyUnlocked = bottomTags.some((item) => item.key === "alchemy");
    const resourcesDrawer = uiState.activeDrawer === "resources" ? buildResourcesDrawerViewModel(snapshot) : null;
    const cultivationDrawer = uiState.activeDrawer === "cultivation" ? buildCultivationDrawerViewModel(snapshot) : null;
    const dwellingDrawer = uiState.activeDrawer === "dwelling" ? buildDwellingDrawerViewModel(snapshot) : null;
    const alchemyDrawer = uiState.activeDrawer === "alchemy" && alchemyUnlocked ? buildAlchemyDrawerViewModel(snapshot) : null;
    const summaryModal = buildSummaryModalViewModel(snapshot);

    drawStageBackground(context, width, height);

    const scrollRect = {
      x: viewport.contentLeft,
      y: viewport.headerTop,
      width: viewport.contentWidth,
      height: viewport.scrollHeight + viewport.headerHeight - 8,
    };
    drawScrollCard(context, scrollRect, {
      summaryRows: buildSummaryRows(stage),
      logTitle: "日志",
      logEntries: stage.logEntries,
      emptyLogText: "尚无新的变化",
    });

    const primaryRect = {
      x: viewport.contentLeft,
      y: viewport.primaryButtonY,
      width: viewport.contentWidth,
      height: viewport.primaryButtonHeight,
    };
    drawSealButton(context, primaryRect, {
      label: stage.primaryAction.label,
      disabled:
        uiState.busy ||
        stage.primaryAction.action === "open-event" ||
        stage.primaryAction.action === "open-summary" ||
        stage.primaryAction.action === "open-battle",
    });
    registerHitRegion({
      ...primaryRect,
      onTap: () => handlePrimaryAction(snapshot),
    });

    drawBottomTags(context, viewport, uiState, registerHitRegion, requestRender, bottomTags);

    if (resourcesDrawer) {
      registerDismissRegion(registerHitRegion, width, height * 0.34, () => closeDrawer(uiState, requestRender));
      registerBlockingRegion(registerHitRegion, 0, height * 0.34, width, height - height * 0.34);
      drawResourcesDrawer(context, { width, height, viewport }, resourcesDrawer, registerHitRegion, {
        selectedResourceKey: uiState.selectedResourceKey,
        onSelectResource: (resourceKey) => {
          uiState.selectedResourceKey = resourceKey;
          requestRender();
        },
        onAction: (item, action) =>
          perform(async () => {
            if (!item || item.amount <= 0) {
              showToast("该资源当前为 0，无法操作");
              return;
            }

            const amount = await resolveResourceActionAmount(item, action);
            if (amount <= 0) {
              return;
            }

            if (action && action.action === "convert-spirit-stone") {
              await adapter.convertSpiritStoneToCultivation(amount);
              showToast(`已转化 ${amount} 灵石`);
              return;
            }

            await adapter.sellResource(item.key, amount);
            showToast(amount === item.amount ? `已全部出售 ${item.label}` : `已出售 ${item.label} x${amount}`);
          }),
      });
    }

    if (cultivationDrawer) {
      registerDismissRegion(registerHitRegion, width, height * 0.4, () => closeDrawer(uiState, requestRender));
      registerBlockingRegion(registerHitRegion, 0, height * 0.4, width, height - height * 0.4);
      drawCultivationDrawer(context, { width, height, viewport }, cultivationDrawer, registerHitRegion, {
        onBreakthrough: () =>
          perform(async () => {
            const result = await adapter.breakthrough();
            showToast((result && result.breakthrough && result.breakthrough.message) || "已尝试突破");
          }),
      });
    }

    if (dwellingDrawer) {
      registerDismissRegion(registerHitRegion, width, height * 0.24, () => closeDrawer(uiState, requestRender));
      registerBlockingRegion(registerHitRegion, 0, height * 0.24, width, height - height * 0.24);
      drawDwellingDrawer(context, { width, height, viewport }, dwellingDrawer, registerHitRegion, {
        onFacilityAction: (action) => {
          if (!action || action.disabled) {
            return;
          }

          const card = dwellingDrawer.facilityCards.find((item) => item.id === action.facilityId);
          if (!card) {
            showToast("未找到对应设施");
            return;
          }

          if (!card.canAfford) {
            showToast(`${card.title}所需灵石不足（需要 ${card.nextUpgradeCostSpiritStone}，当前 ${dwellingDrawer.currentSpiritStone}）`);
            return;
          }

          uiState.confirmDialog = buildDwellingConfirmDialog(card, dwellingDrawer.currentSpiritStone);
          requestRender();
        },
      });
    }

    if (alchemyDrawer) {
      registerDismissRegion(registerHitRegion, width, height * 0.2, () => closeDrawer(uiState, requestRender));
      registerBlockingRegion(registerHitRegion, 0, height * 0.2, width, height - height * 0.2);
      drawAlchemyDrawer(context, { width, height, viewport }, alchemyDrawer, registerHitRegion, {
        onRecipeAction: (action) =>
          perform(async () => {
            const useSpiritSpring = action.action === "start-alchemy-with-spring";
            await adapter.startAlchemy(action.recipeId, useSpiritSpring);
            showToast(useSpiritSpring ? "已借灵泉开炉" : "已起丹火");
          }),
        onConsumeAction: (action) =>
          perform(async () => {
            await adapter.consumeAlchemyItem(action.itemId, action.quality);
            showToast("丹药已服用");
          }),
      });
    }

    if (battleModal) {
      registerBlockingRegion(registerHitRegion, 0, 0, width, height);
      drawBattleModal(context, { width, height, viewport }, battleModal, registerHitRegion, (action) =>
        perform(async () => {
          await adapter.performBattleAction(action);
        })
      );
    } else if (eventModal) {
      registerBlockingRegion(registerHitRegion, 0, 0, width, height);
      drawEventModal(context, { width, height, viewport }, eventModal, registerHitRegion, (optionId) =>
        perform(async () => {
          await adapter.resolveEvent(optionId);
        })
      );
    }

    if (summaryModal) {
      registerBlockingRegion(registerHitRegion, 0, 0, width, height);
      drawSummaryModal(context, { width, height, viewport }, summaryModal, registerHitRegion, () =>
        perform(async () => {
          await adapter.rebirth();
          uiState.activeDrawer = null;
          uiState.confirmDialog = null;
          showToast("新一世已启");
        })
      );
    }

    if (uiState.confirmDialog) {
      drawConfirmModal(context, { width, height, viewport }, uiState.confirmDialog, registerHitRegion, {
        onCancel: () => {
          uiState.confirmDialog = null;
          requestRender();
        },
        onConfirm: () => {
          const dialog = uiState.confirmDialog;
          uiState.confirmDialog = null;
          requestRender();
          perform(async () => {
            if (!dialog) {
              return;
            }

            if (dialog.actionType === "build-facility") {
              await adapter.buildDwellingFacility(dialog.facilityId);
              showToast("设施已建造");
              return;
            }

            await adapter.upgradeDwellingFacility(dialog.facilityId);
            showToast("设施已升级");
          });
        },
      });
    }

    if (uiState.toast) {
      drawToast(context, viewport, uiState.toast);
    }
  }

  function handleTouchEnd(event) {
    if (uiState.toast) {
      uiState.toast = "";
      clearToastTimer();
      requestRender();
      return;
    }

    const touch = event && Array.isArray(event.changedTouches) ? event.changedTouches[0] : null;
    if (!touch) {
      return;
    }

    const x = Number(touch.clientX) || Number(touch.x) || 0;
    const y = Number(touch.clientY) || Number(touch.y) || 0;

    for (let index = hitRegions.length - 1; index >= 0; index -= 1) {
      const region = hitRegions[index];
      if (x >= region.x && x <= region.x + region.width && y >= region.y && y <= region.y + region.height) {
        region.onTap();
        break;
      }
    }
  }

  return {
    render,
    handleTouchEnd,
  };
}

function drawStageBackground(context, width, height) {
  context.clearRect(0, 0, width, height);
  const gradient =
    typeof context.createLinearGradient === "function" ? context.createLinearGradient(0, 0, 0, height) : null;
  if (gradient) {
    gradient.addColorStop(0, "#ebe0c2");
    gradient.addColorStop(1, "#f5edd9");
    context.fillStyle = gradient;
  } else {
    context.fillStyle = themeTokens.color.paper;
  }
  context.fillRect(0, 0, width, height);

  context.fillStyle = "rgba(32, 63, 58, 0.06)";
  context.fillRect(0, 0, width, Math.min(180, height * 0.22));
}

function drawBottomTags(context, viewport, uiState, registerHitRegion, requestRender, tags) {
  const columns = 3;
  const tagWidth = (viewport.contentWidth - viewport.tagGap * (columns - 1)) / columns;
  const firstRowY = viewport.footerTop + 18;

  tags.forEach((item, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const rect = {
      x: viewport.contentLeft + column * (tagWidth + viewport.tagGap),
      y: firstRowY + row * (viewport.tagHeight + viewport.tagGap),
      width: tagWidth,
      height: viewport.tagHeight,
    };

    drawTagButton(context, rect, {
      label: item.label,
      active: uiState.activeDrawer === item.key,
    });
    registerHitRegion({
      ...rect,
      onTap: () => {
        uiState.activeDrawer = item.key;
        requestRender();
      },
    });
  });
}

function buildBottomTags(snapshot) {
  const tags = [
    { key: "resources", label: "行囊" },
    { key: "cultivation", label: "修行" },
    { key: "dwelling", label: "洞府" },
  ];

  if (isFacilityBuilt(snapshot, "alchemy_room")) {
    tags.push({ key: "alchemy", label: "炼丹" });
  }

  return tags;
}

async function resolveResourceActionAmount(item, action) {
  if (!item || !action) {
    return 0;
  }

  if (action.amountMode === "one") {
    return 1;
  }

  if (action.amountMode === "all") {
    return Math.max(0, Number(item.amount) || 0);
  }

  return promptResourceActionAmount(item, action);
}

function promptResourceActionAmount(item, action) {
  return new Promise((resolve) => {
    if (typeof wx === "undefined" || typeof wx.showModal !== "function") {
      resolve(0);
      return;
    }

    const maxAmount = Math.max(0, Number(item.amount) || 0);
    const verb = action.action === "convert-spirit-stone" ? "转化" : "出售";

    wx.showModal({
      title: `${verb}${item.label}`,
      editable: true,
      placeholderText: `输入 1-${maxAmount} 的数量`,
      content: "",
      success(result) {
        if (!result || !result.confirm) {
          resolve(0);
          return;
        }

        const amount = Number.parseInt(String(result.content || "").trim(), 10);
        if (!Number.isInteger(amount) || amount <= 0) {
          resolve(0);
          return;
        }

        resolve(Math.min(amount, maxAmount));
      },
      fail() {
        resolve(0);
      },
    });
  });
}

function isFacilityBuilt(snapshot, facilityId) {
  const facilities =
    snapshot && snapshot.run && Array.isArray(snapshot.run.dwelling_facilities) ? snapshot.run.dwelling_facilities : [];

  return facilities.some((facility) => facility.facility_id === facilityId && Number(facility.level || 0) > 0);
}

function drawToast(context, viewport, text) {
  const toastWidth = Math.min(viewport.width - 56, 296);
  const toastHeight = 104;
  const toastRect = {
    x: (viewport.width - toastWidth) / 2,
    y: (viewport.height - toastHeight) / 2,
    width: toastWidth,
    height: toastHeight,
  };

  context.fillStyle = "rgba(24, 22, 18, 0.18)";
  context.fillRect(0, 0, viewport.width, viewport.height);

  context.fillStyle = "rgba(44, 30, 16, 0.9)";
  fillRoundedRect(context, toastRect.x, toastRect.y, toastRect.width, toastRect.height, 22);
  context.strokeStyle = "rgba(255, 248, 235, 0.18)";
  context.lineWidth = 2;
  strokeRoundedRect(context, toastRect.x + 1, toastRect.y + 1, toastRect.width - 2, toastRect.height - 2, 21);

  context.fillStyle = themeTokens.color.creamText;
  context.font = "bold 16px sans-serif";
  const lines = wrapText(context, String(text), toastRect.width - 36, 2);
  lines.forEach((line, index) => {
    const lineWidth = context.measureText(line).width;
    context.fillText(line, toastRect.x + (toastRect.width - lineWidth) / 2, toastRect.y + 44 + index * 24);
  });
}

function buildSummaryRows(stage) {
  if (!stage.topSummary) {
    return [
      { label: "境界", value: "未启程" },
      { label: "轮次", value: "--" },
      { label: "修为", value: "--" },
      { label: "灵石", value: "--" },
      { label: "寿元", value: "--" },
    ];
  }

  return [
    { label: "境界", value: stage.topSummary.realm },
    { label: "轮次", value: stage.topSummary.round },
    { label: "修为", value: stage.topSummary.cultivationExp },
    { label: "灵石", value: stage.topSummary.spiritStone },
    { label: "寿元", value: stage.topSummary.lifespan },
    { label: "气血", value: `${stage.topSummary.hpCurrent}/${stage.topSummary.hpMax}` },
    { label: "攻击", value: stage.topSummary.attack },
    { label: "防御", value: stage.topSummary.defense },
    { label: "速度", value: stage.topSummary.speed },
  ];
}

function wrapText(context, text, maxWidth, maxLines) {
  const content = String(text || "");
  if (!content) {
    return [];
  }

  const lines = [];
  let current = "";
  for (const char of content) {
    const next = current + char;
    if (context.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = char;
      if (maxLines && lines.length >= maxLines) {
        break;
      }
      continue;
    }
    current = next;
  }

  if (current && (!maxLines || lines.length < maxLines)) {
    lines.push(current);
  }
  return lines;
}

function fillRoundedRect(context, x, y, width, height, radius) {
  const nextRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
  context.beginPath();
  context.moveTo(x + nextRadius, y);
  context.lineTo(x + width - nextRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + nextRadius);
  context.lineTo(x + width, y + height - nextRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - nextRadius, y + height);
  context.lineTo(x + nextRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - nextRadius);
  context.lineTo(x, y + nextRadius);
  context.quadraticCurveTo(x, y, x + nextRadius, y);
  context.closePath();
  context.fill();
}

function strokeRoundedRect(context, x, y, width, height, radius) {
  const nextRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
  context.beginPath();
  context.moveTo(x + nextRadius, y);
  context.lineTo(x + width - nextRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + nextRadius);
  context.lineTo(x + width, y + height - nextRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - nextRadius, y + height);
  context.lineTo(x + nextRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - nextRadius);
  context.lineTo(x, y + nextRadius);
  context.quadraticCurveTo(x, y, x + nextRadius, y);
  context.closePath();
  context.stroke();
}

function registerDismissRegion(registerHitRegion, width, height, onTap) {
  registerHitRegion({
    x: 0,
    y: 0,
    width,
    height,
    onTap,
  });
}

function registerBlockingRegion(registerHitRegion, x, y, width, height) {
  registerHitRegion({
    x,
    y,
    width,
    height,
    onTap() {},
  });
}

function closeDrawer(uiState, requestRender) {
  uiState.activeDrawer = null;
  uiState.confirmDialog = null;
  uiState.selectedResourceKey = "";
  requestRender();
}

function buildDwellingConfirmDialog(card, currentSpiritStone) {
  const verb = card.action.action === "build-facility" ? "建造" : "升级";
  return {
    title: `${verb}${card.title}`,
    bodyLines: [
      `是否消耗 ${card.nextUpgradeCostSpiritStone} 灵石${verb}该设施？`,
      `当前灵石：${currentSpiritStone}`,
    ],
    confirmText: `确认${verb}`,
    cancelText: "取消",
    facilityId: card.id,
    actionType: card.action.action,
  };
}

module.exports = {
  createMainStageScreen,
};
