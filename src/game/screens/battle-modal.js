const { themeTokens } = require("../theme/tokens");

function drawBattleModal(context, layout, viewModel, registerHitRegion, actions) {
  if (!context || !viewModel) {
    return;
  }

  const width = layout.width;
  const height = layout.height;
  const panelX = 24;
  const panelY = 72;
  const panelWidth = width - 48;
  const panelHeight = Math.min(height - 144, 500);
  const logRect = {
    x: panelX + 20,
    y: panelY + 198,
    width: panelWidth - 40,
    height: 108,
  };

  context.fillStyle = themeTokens.color.overlayHeavy;
  context.fillRect(0, 0, width, height);

  context.fillStyle = themeTokens.color.paperSoft;
  fillRoundedRect(context, panelX, panelY, panelWidth, panelHeight, 24);
  context.strokeStyle = themeTokens.color.bronzeSoft;
  context.lineWidth = 2;
  strokeRoundedRect(context, panelX, panelY, panelWidth, panelHeight, 24);

  context.fillStyle = themeTokens.color.jade;
  context.font = "bold 24px sans-serif";
  context.fillText(viewModel.title, panelX + 20, panelY + 36);
  context.fillStyle = themeTokens.color.inkSoft;
  context.font = "14px sans-serif";
  context.fillText(viewModel.subtitle, panelX + 20, panelY + 62);

  drawActorCard(context, panelX + 20, panelY + 86, panelWidth - 40, 48, viewModel.player, true);
  drawActorCard(context, panelX + 20, panelY + 140, panelWidth - 40, 48, viewModel.enemy, false);

  context.fillStyle = themeTokens.color.paper;
  fillRoundedRect(context, logRect.x, logRect.y, logRect.width, logRect.height, 18);
  context.strokeStyle = themeTokens.color.scrollEdge;
  context.lineWidth = 1.5;
  strokeRoundedRect(context, logRect.x, logRect.y, logRect.width, logRect.height, 18);

  context.fillStyle = themeTokens.color.ink;
  context.font = "14px sans-serif";
  (viewModel.logLines || []).forEach((line, index) => {
    context.fillText(String(line), logRect.x + 14, logRect.y + 26 + index * 24);
  });

  const actionItems = Array.isArray(viewModel.actions) ? viewModel.actions : [];
  const controller =
    typeof actions === "function"
      ? { onChoose: actions }
      : {
          onChoose: actions && actions.onChoose ? actions.onChoose : () => {},
          onChoosePill: actions && actions.onChoosePill ? actions.onChoosePill : () => {},
          onClosePillPicker:
            actions && actions.onClosePillPicker ? actions.onClosePillPicker : () => {},
          showBattlePillPicker: actions && actions.showBattlePillPicker === true,
        };
  const columns = 2;
  const gap = 12;
  const buttonWidth = (panelWidth - 40 - gap) / columns;
  const buttonHeight = 54;
  const actionTop = logRect.y + logRect.height + 18;

  if (controller.showBattlePillPicker) {
    drawPillPicker(
      context,
      {
        x: panelX + 20,
        y: actionTop,
        width: panelWidth - 40,
        height: panelY + panelHeight - actionTop - 20,
      },
      viewModel.battlePillOptions || [],
      registerHitRegion,
      controller
    );
    return;
  }

  actionItems.forEach((actionItem, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const rect = {
      x: panelX + 20 + column * (buttonWidth + gap),
      y: actionTop + row * (buttonHeight + 12),
      width: buttonWidth,
      height: buttonHeight,
    };

    drawActionButton(context, rect, actionItem);
    if (!actionItem.disabled) {
      registerHitRegion({
        ...rect,
        onTap: () => controller.onChoose(actionItem.action),
      });
    }
  });
}

function drawActorCard(context, x, y, width, height, actor, isPlayer) {
  context.fillStyle = isPlayer ? "#f4ecdd" : "#efe2d0";
  fillRoundedRect(context, x, y, width, height, 16);
  context.strokeStyle = isPlayer ? themeTokens.color.jadeSoft : themeTokens.color.bronze;
  context.lineWidth = 1.5;
  strokeRoundedRect(context, x, y, width, height, 16);

  context.fillStyle = themeTokens.color.ink;
  context.font = "bold 16px sans-serif";
  context.fillText(`${actor.name} ${actor.realm}`, x + 14, y + 20);
  context.font = "13px sans-serif";
  context.fillText(`气血 ${actor.hpCurrent}/${actor.hpMax}`, x + 14, y + 40);
  context.fillText(`攻 ${actor.attack} 防 ${actor.defense} 速 ${actor.speed}`, x + width - 120, y + 40);
}

function drawActionButton(context, rect, actionItem) {
  const disabled = actionItem.disabled === true;
  const fontSize = Math.max(12, Number(actionItem.fontSize) || 16);
  const radius = Math.max(8, Math.min(18, rect.height / 2, Number(actionItem.radius) || 18));
  context.fillStyle = disabled ? themeTokens.color.buttonDisabledSurface : themeTokens.color.buttonSurface;
  fillRoundedRect(context, rect.x, rect.y, rect.width, rect.height, radius);
  context.strokeStyle = disabled ? themeTokens.color.buttonDisabledBorder : themeTokens.color.buttonBorder;
  context.lineWidth = 2;
  strokeRoundedRect(context, rect.x, rect.y, rect.width, rect.height, radius);
  context.fillStyle = disabled ? themeTokens.color.buttonDisabledText : themeTokens.color.buttonText;
  context.font = `bold ${fontSize}px sans-serif`;
  const metrics = context.measureText(actionItem.label);
  const textY = rect.y + rect.height / 2 + fontSize * 0.35;
  context.fillText(actionItem.label, rect.x + (rect.width - metrics.width) / 2, textY);
}

function drawPillPicker(context, rect, pillOptions, registerHitRegion, controller) {
  context.fillStyle = "#f3e6cf";
  fillRoundedRect(context, rect.x, rect.y, rect.width, rect.height, 16);
  context.strokeStyle = themeTokens.color.scrollEdge;
  context.lineWidth = 1.5;
  strokeRoundedRect(context, rect.x, rect.y, rect.width, rect.height, 16);

  context.fillStyle = themeTokens.color.accent;
  context.font = "bold 16px sans-serif";
  context.fillText("选择战斗丹药", rect.x + 14, rect.y + 24);

  const closeRect = {
    x: rect.x + rect.width - 70,
    y: rect.y + 8,
    width: 56,
    height: 28,
  };
  drawActionButton(context, closeRect, { label: "返回", fontSize: 14, radius: 11 });
  registerHitRegion({
    ...closeRect,
    onTap: controller.onClosePillPicker,
  });

  if (!pillOptions.length) {
    context.fillStyle = themeTokens.color.inkSoft;
    context.font = "14px sans-serif";
    context.fillText("没有可在战斗中服用的丹药。", rect.x + 14, rect.y + 58);
    return;
  }

  const rowHeight = 46;
  pillOptions.slice(0, 3).forEach((pill, index) => {
    const rowRect = {
      x: rect.x + 12,
      y: rect.y + 50 + index * (rowHeight + 8),
      width: rect.width - 24,
      height: rowHeight,
    };
    context.fillStyle = themeTokens.color.paperSoft;
    fillRoundedRect(context, rowRect.x, rowRect.y, rowRect.width, rowRect.height, 12);
    context.strokeStyle = themeTokens.color.buttonBorder;
    context.lineWidth = 1.5;
    strokeRoundedRect(context, rowRect.x, rowRect.y, rowRect.width, rowRect.height, 12);
    context.fillStyle = themeTokens.color.ink;
    context.font = "bold 15px sans-serif";
    context.fillText(pill.label, rowRect.x + 12, rowRect.y + 19);
    context.fillStyle = themeTokens.color.inkSoft;
    context.font = "13px sans-serif";
    context.fillText(pill.detail, rowRect.x + 12, rowRect.y + 37);
    registerHitRegion({
      ...rowRect,
      onTap: () => controller.onChoosePill(pill.action),
    });
  });
}

function fillRoundedRect(context, x, y, width, height, radius) {
  traceRoundedRect(context, x, y, width, height, radius);
  context.fill();
}

function strokeRoundedRect(context, x, y, width, height, radius) {
  traceRoundedRect(context, x, y, width, height, radius);
  context.stroke();
}

function traceRoundedRect(context, x, y, width, height, radius) {
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
}

module.exports = {
  drawBattleModal,
};
