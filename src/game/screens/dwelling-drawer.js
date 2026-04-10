const { themeTokens } = require("../theme/tokens");

function drawDwellingDrawer(context, layout, viewModel, registerHitRegion, actions) {
  if (!context || !viewModel) {
    return;
  }

  const width = layout.width;
  const height = layout.height;
  const drawerY = height * 0.24;
  const cardGap = 16;
  const cardWidth = (width - 56) / 2;

  context.fillStyle = themeTokens.color.overlay;
  context.fillRect(0, 0, width, height);

  fillRoundedRect(context, 0, drawerY, width, height - drawerY, 28, themeTokens.color.paperSoft);

  drawHeader(context, drawerY, viewModel);
  drawSummary(context, width, drawerY, viewModel);

  const productionRows = Math.max(1, Math.ceil(((viewModel.productionSummaryItems || []).length || 1) / 2));
  const cardsTop = drawerY + 162 + productionRows * 24;

  viewModel.facilityCards.slice(0, 4).forEach((card, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const left = 20 + column * (cardWidth + cardGap);
    const top = cardsTop + row * 122;
    drawFacilityCard(
      context,
      {
        x: left,
        y: top,
        width: cardWidth,
        height: 106,
      },
      card,
      registerHitRegion,
      actions
    );
  });
}

function drawHeader(context, drawerY, viewModel) {
  context.fillStyle = themeTokens.color.jade;
  context.font = "bold 22px sans-serif";
  context.fillText(viewModel.title, 24, drawerY + 34);

  context.fillStyle = themeTokens.color.ink;
  context.font = "bold 14px sans-serif";
  context.fillText(`Lv.${viewModel.dwellingLevel}`, 76, drawerY + 48);
}

function drawSummary(context, width, drawerY, viewModel) {
  const summaryStats = viewModel.summaryStats || {};
  const leftStat = summaryStats.currentSpiritStone || { label: "当前灵石", value: 0, unit: "" };
  const rightStat = summaryStats.totalMaintenanceSpiritStone || { label: "每月维护", value: 0, unit: "灵石" };

  context.fillStyle = themeTokens.color.ink;
  context.font = "16px sans-serif";
  context.fillText(formatStat(leftStat), 24, drawerY + 74);
  context.fillText(formatStat(rightStat), width / 2, drawerY + 74);

  context.font = "bold 15px sans-serif";
  context.fillText("总产出", 24, drawerY + 108);

  const items = (viewModel.productionSummaryItems || []).length
    ? viewModel.productionSummaryItems
    : [{ key: "cultivation", label: "修为", value: 0 }];
  context.font = "15px sans-serif";
  items.forEach((item, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = 24 + column * ((width - 48) / 2);
    const y = drawerY + 136 + row * 22;
    context.fillText(`${item.label} ${item.value}`, x, y);
  });
}

function drawFacilityCard(context, rect, card, registerHitRegion, actions) {
  fillRoundedRect(context, rect.x, rect.y, rect.width, rect.height, 16, "#f3e6cf");
  if (card.isStalled) {
    context.strokeStyle = "#b14a38";
    context.lineWidth = 3;
    strokeRoundedRect(context, rect.x + 1.5, rect.y + 1.5, rect.width - 3, rect.height - 3, 14.5);
  }

  context.fillStyle = themeTokens.color.ink;
  context.font = "bold 18px sans-serif";
  context.fillText(card.title, rect.x + 14, rect.y + 28);

  context.font = "15px sans-serif";
  context.fillText(`Lv.${card.level}`, rect.x + 14, rect.y + 54);

  if (card.isStalled) {
    context.fillStyle = "#b14a38";
    context.font = "bold 13px sans-serif";
    const stalledText = "已停摆";
    const stalledTextWidth = context.measureText(stalledText).width;
    context.fillText(stalledText, rect.x + rect.width - 14 - stalledTextWidth, rect.y + 28);
  }

  const buttonRect = {
    x: rect.x + 12,
    y: rect.y + rect.height - 42,
    width: rect.width - 24,
    height: 30,
  };
  const buttonFill = card.action.disabled ? "#e5ddd0" : themeTokens.color.buttonSurface;
  const buttonBorder = card.action.disabled ? "#b7ab98" : themeTokens.color.buttonBorder;
  const buttonText = card.action.disabled ? "#8c7f6c" : themeTokens.color.buttonText;

  fillRoundedRect(context, buttonRect.x, buttonRect.y, buttonRect.width, buttonRect.height, 14, buttonFill);
  context.strokeStyle = buttonBorder;
  context.lineWidth = 2;
  strokeRoundedRect(context, buttonRect.x + 1, buttonRect.y + 1, buttonRect.width - 2, buttonRect.height - 2, 13);
  context.fillStyle = buttonText;
  context.font = "bold 15px sans-serif";
  const labelWidth = context.measureText(card.action.label).width;
  context.fillText(card.action.label, buttonRect.x + (buttonRect.width - labelWidth) / 2, buttonRect.y + 21);

  if (!card.action.disabled) {
    registerHitRegion({
      ...buttonRect,
      onTap: () => actions.onFacilityAction(card.action),
    });
  }
}

function formatStat(stat) {
  return stat.unit ? `${stat.label}: ${stat.value} ${stat.unit}` : `${stat.label}: ${stat.value}`;
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
  drawDwellingDrawer,
};
