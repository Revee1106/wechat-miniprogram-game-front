const { themeTokens } = require("../theme/tokens");

function drawResourcesDrawer(context, layout, viewModel, registerHitRegion, actions) {
  if (!context || !viewModel) {
    return;
  }

  const width = layout.width;
  const height = layout.height;
  const safeBottom = layout.viewport ? layout.viewport.safeBottom : 0;
  const drawerY = height * 0.34;
  const selectedResourceKey = actions.selectedResourceKey || "";
  const selectedItem = viewModel.items.find((item) => item.key === selectedResourceKey) || null;
  const chipStartY = drawerY + 72;
  const chipRowHeight = 52;
  const chipRows = Math.ceil(viewModel.items.length / 2);
  const chipAreaBottom = chipStartY + chipRows * chipRowHeight;
  const detailTop = chipAreaBottom + 18;
  const detailHeight = Math.max(204, height - safeBottom - detailTop - 32);

  context.fillStyle = themeTokens.color.overlay;
  context.fillRect(0, 0, width, height);

  fillRoundedRect(context, 0, drawerY, width, height - drawerY, 28, themeTokens.color.paperSoft);

  context.fillStyle = themeTokens.color.jade;
  context.font = "bold 22px sans-serif";
  context.fillText(viewModel.title, 24, drawerY + 34);

  drawResourceTags(context, width, chipStartY, viewModel.items, selectedResourceKey, registerHitRegion, actions);

  drawDetailCard(
    context,
    {
      x: 20,
      y: detailTop,
      width: width - 40,
      height: detailHeight,
    },
    selectedItem,
    registerHitRegion,
    actions
  );
}

function drawResourceTags(context, width, startY, items, selectedResourceKey, registerHitRegion, actions) {
  const chipWidth = (width - 72) / 2;
  const chipHeight = 40;

  items.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const rect = {
      x: 24 + col * (chipWidth + 16),
      y: startY + row * 52,
      width: chipWidth,
      height: chipHeight,
    };

    const active = item.key === selectedResourceKey;
    fillRoundedRect(
      context,
      rect.x,
      rect.y,
      rect.width,
      rect.height,
      18,
      active ? themeTokens.color.buttonSurface : "#f3e6cf"
    );
    if (active) {
      context.strokeStyle = themeTokens.color.buttonBorder;
      context.lineWidth = 2;
      strokeRoundedRect(context, rect.x + 1, rect.y + 1, rect.width - 2, rect.height - 2, 17);
    }
    context.fillStyle = active ? themeTokens.color.buttonText : themeTokens.color.ink;
    context.font = "bold 15px sans-serif";
    context.fillText(`${item.label} ${item.amount}`, rect.x + 14, rect.y + 25);

    registerHitRegion({
      ...rect,
      onTap: () => actions.onSelectResource(item.key),
    });
  });
}

function drawDetailCard(context, rect, selectedItem, registerHitRegion, actions) {
  fillRoundedRect(context, rect.x, rect.y, rect.width, rect.height, 20, "#f3e6cf");
  context.fillStyle = themeTokens.color.accent;
  context.font = "bold 18px sans-serif";
  context.fillText(selectedItem ? selectedItem.label : "资源详情", rect.x + 18, rect.y + 28);

  context.fillStyle = themeTokens.color.ink;
  context.font = "16px sans-serif";
  if (!selectedItem) {
    context.fillText("点选上方资源标签后，再进行对应操作。", rect.x + 18, rect.y + 60);
    return;
  }

  context.fillText(`当前持有：${selectedItem.amount}`, rect.x + 18, rect.y + 60);
  const actionText =
    selectedItem.actions[0] && selectedItem.actions[0].action === "convert-spirit-stone"
      ? "可按单份、全部或自定义数量转化为修为。"
      : "可按单份、全部或自定义数量出售换取灵石。";
  context.fillText(actionText, rect.x + 18, rect.y + 92);

  const buttonTop = rect.y + rect.height - 154;
  const buttonHeight = 40;
  const buttonGap = 12;

  selectedItem.actions.slice(0, 3).forEach((action, index) => {
    const buttonRect = {
      x: rect.x + 18,
      y: buttonTop + index * (buttonHeight + buttonGap),
      width: rect.width - 36,
      height: buttonHeight,
    };
    drawActionButton(context, buttonRect, action.label);
    registerHitRegion({
      ...buttonRect,
      onTap: () => actions.onAction(selectedItem, action),
    });
  });
}

function drawActionButton(context, rect, label) {
  fillRoundedRect(context, rect.x, rect.y, rect.width, rect.height, 18, themeTokens.color.buttonSurface);
  context.strokeStyle = themeTokens.color.buttonBorder;
  context.lineWidth = 2;
  strokeRoundedRect(context, rect.x + 1, rect.y + 1, rect.width - 2, rect.height - 2, 17);
  context.fillStyle = themeTokens.color.buttonText;
  context.font = "bold 16px sans-serif";
  const textWidth = context.measureText(label).width;
  context.fillText(label, rect.x + (rect.width - textWidth) / 2, rect.y + 26);
}

function fillRoundedRect(context, x, y, width, height, radius, fillStyle) {
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
  context.fillStyle = fillStyle;
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

module.exports = {
  drawResourcesDrawer,
};
