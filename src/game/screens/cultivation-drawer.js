const { themeTokens } = require("../theme/tokens");

function drawCultivationDrawer(context, layout, viewModel, registerHitRegion, actions) {
  if (!context || !viewModel) {
    return;
  }

  const width = layout.width;
  const height = layout.height;
  const safeBottom = layout.viewport ? layout.viewport.safeBottom : 0;
  const drawerY = height * 0.4;
  const buttonRect = { x: 24, y: height - safeBottom - 116, width: width - 48, height: 54 };

  context.fillStyle = themeTokens.color.overlay;
  context.fillRect(0, 0, width, height);

  fillRoundedRect(context, 0, drawerY, width, height - drawerY, 28, themeTokens.color.paperSoft);

  context.fillStyle = themeTokens.color.jade;
  context.font = "bold 22px sans-serif";
  context.fillText(viewModel.title, 24, drawerY + 34);

  context.fillStyle = themeTokens.color.ink;
  context.font = "16px sans-serif";
  context.fillText(`当前境界: ${viewModel.currentRealm}`, 24, drawerY + 76);
  context.fillText(`目标境界: ${viewModel.targetRealm}`, 24, drawerY + 108);
  context.fillText(`修为: ${viewModel.currentCultivationExp} / ${viewModel.requiredCultivationExp}`, 24, drawerY + 140);
  context.fillText(`灵石: ${viewModel.currentSpiritStone} / ${viewModel.requiredSpiritStone}`, 24, drawerY + 172);
  context.fillText(viewModel.hint, 24, drawerY + 216);

  fillRoundedRect(
    context,
    buttonRect.x,
    buttonRect.y,
    buttonRect.width,
    buttonRect.height,
    18,
    viewModel.canBreakthrough
      ? themeTokens.color.buttonSurface
      : themeTokens.color.buttonDisabledSurface
  );
  context.strokeStyle = viewModel.canBreakthrough
    ? themeTokens.color.buttonBorder
    : themeTokens.color.buttonDisabledBorder;
  context.lineWidth = 2;
  strokeRoundedRect(context, buttonRect.x + 1, buttonRect.y + 1, buttonRect.width - 2, buttonRect.height - 2, 17);
  context.fillStyle = viewModel.canBreakthrough
    ? themeTokens.color.buttonText
    : themeTokens.color.buttonDisabledText;
  context.font = "bold 18px sans-serif";
  context.fillText("尝试突破", buttonRect.x + 16, buttonRect.y + 34);

  if (viewModel.canBreakthrough) {
    registerHitRegion({ ...buttonRect, onTap: actions.onBreakthrough });
  }
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
  drawCultivationDrawer,
};
