const { themeTokens } = require("../theme/tokens");

function drawAlchemyDrawer(context, layout, viewModel, registerHitRegion, actions) {
  if (!context || !viewModel) {
    return;
  }

  const width = layout.width;
  const height = layout.height;
  const safeBottom = layout.viewport ? layout.viewport.safeBottom : 0;
  const drawerY = height * 0.2;

  context.fillStyle = themeTokens.color.overlay;
  context.fillRect(0, 0, width, height);

  fillRoundedRect(context, 0, drawerY, width, height - drawerY, 28, themeTokens.color.paperSoft);

  context.fillStyle = themeTokens.color.jade;
  context.font = "bold 22px sans-serif";
  context.fillText(viewModel.title, 24, drawerY + 34);

  context.fillStyle = themeTokens.color.ink;
  context.font = "16px sans-serif";
  context.fillText(`丹道: ${viewModel.masteryTitle}`, 24, drawerY + 70);
  context.fillText(`熟练度: ${viewModel.masteryExp}`, 24, drawerY + 100);
  context.fillText(`灵泉水: ${viewModel.spiritSpringWaterAmount}`, 24, drawerY + 130);
  context.fillText(viewModel.activeJobSummary, 24, drawerY + 160);
  if (viewModel.lastResultSummary) {
    context.fillText(`最近结果: ${viewModel.lastResultSummary}`, 24, drawerY + 190);
  }

  viewModel.recipeCards.slice(0, 2).forEach((card, index) => {
    const top = drawerY + 226 + index * 102;
    fillRoundedRect(context, 20, top, width - 40, 92, 16, "#f3e6cf");
    context.fillStyle = themeTokens.color.ink;
    context.font = "bold 17px sans-serif";
    context.fillText(card.title, 32, top + 24);
    context.font = "14px sans-serif";
    context.fillText(card.ingredientsText, 32, top + 46);

    const startRect = { x: width - 202, y: top + 52, width: 80, height: 30 };
    const springRect = { x: width - 110, y: top + 52, width: 80, height: 30 };
    drawSmallButton(context, startRect, card.action.label);
    drawSmallButton(context, springRect, card.springAction.label);

    if (card.canStart) {
      registerHitRegion({ ...startRect, onTap: () => actions.onRecipeAction(card.action) });
      registerHitRegion({ ...springRect, onTap: () => actions.onRecipeAction(card.springAction) });
    }
  });

  const firstInventory = viewModel.inventoryCards[0];
  if (firstInventory) {
    const top = height - safeBottom - 92;
    fillRoundedRect(context, 20, top, width - 40, 60, 16, themeTokens.color.paper);
    context.fillStyle = themeTokens.color.ink;
    context.font = "15px sans-serif";
    context.fillText(`${firstInventory.title} x${firstInventory.amount}`, 32, top + 24);
    context.fillText(firstInventory.effectSummary, 32, top + 46);

    const consumeRect = { x: width - 104, y: top + 14, width: 72, height: 32 };
    drawSmallButton(context, consumeRect, firstInventory.consumeAction.label);
    registerHitRegion({ ...consumeRect, onTap: () => actions.onConsumeAction(firstInventory.consumeAction) });
  }
}

function drawSmallButton(context, rect, label) {
  fillRoundedRect(context, rect.x, rect.y, rect.width, rect.height, 12, themeTokens.color.buttonSurface);
  context.strokeStyle = themeTokens.color.buttonBorder;
  context.lineWidth = 2;
  strokeRoundedRect(context, rect.x + 1, rect.y + 1, rect.width - 2, rect.height - 2, 11);
  context.fillStyle = themeTokens.color.buttonText;
  context.font = "bold 13px sans-serif";
  context.fillText(label, rect.x + 12, rect.y + 20);
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
  drawAlchemyDrawer,
};
