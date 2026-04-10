const { themeTokens } = require("../theme/tokens");

function drawSummaryModal(context, layout, viewModel, registerHitRegion, onRebirth) {
  if (!context || !viewModel) {
    return;
  }

  const width = layout.width;
  const height = layout.height;
  const panelX = 28;
  const panelY = height * 0.24;
  const panelWidth = width - 56;
  const panelHeight = 260;

  context.fillStyle = themeTokens.color.overlayHeavy;
  context.fillRect(0, 0, width, height);

  fillRoundedRect(context, panelX, panelY, panelWidth, panelHeight, 24, themeTokens.color.paperSoft);
  context.strokeStyle = themeTokens.color.bronzeSoft;
  context.lineWidth = 2;
  strokeRoundedRect(context, panelX, panelY, panelWidth, panelHeight, 24);

  context.fillStyle = themeTokens.color.jade;
  context.font = "bold 24px sans-serif";
  context.fillText(viewModel.title, panelX + 24, panelY + 38);

  context.fillStyle = themeTokens.color.ink;
  context.font = "16px sans-serif";
  context.fillText(viewModel.summary, panelX + 24, panelY + 78);
  context.fillText(`境界: ${viewModel.realm}`, panelX + 24, panelY + 116);
  context.fillText(`灵石: ${viewModel.spiritStone}`, panelX + 24, panelY + 146);
  context.fillText(`轮回次数: ${viewModel.rebirthCount}`, panelX + 24, panelY + 176);
  context.fillText(`轮回点: ${viewModel.rebirthPoints}`, panelX + 24, panelY + 206);

  const buttonRect = { x: panelX + 24, y: panelY + 220, width: panelWidth - 48, height: 50 };
  fillRoundedRect(
    context,
    buttonRect.x,
    buttonRect.y,
    buttonRect.width,
    buttonRect.height,
    18,
    themeTokens.color.buttonSurface
  );
  context.strokeStyle = themeTokens.color.buttonBorder;
  context.lineWidth = 2;
  strokeRoundedRect(context, buttonRect.x + 1, buttonRect.y + 1, buttonRect.width - 2, buttonRect.height - 2, 17);
  context.fillStyle = themeTokens.color.buttonText;
  context.font = "bold 18px sans-serif";
  context.fillText(viewModel.primaryAction.label, buttonRect.x + 16, buttonRect.y + 32);

  registerHitRegion({
    ...buttonRect,
    onTap: onRebirth,
  });
}

function fillRoundedRect(context, x, y, width, height, radius, fillStyle) {
  traceRoundedRect(context, x, y, width, height, radius);
  context.fillStyle = fillStyle;
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
  drawSummaryModal,
};
