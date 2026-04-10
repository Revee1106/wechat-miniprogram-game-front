const { themeTokens } = require("../theme/tokens");

function drawConfirmModal(context, layout, viewModel, registerHitRegion, actions) {
  if (!context || !viewModel) {
    return;
  }

  const width = layout.width;
  const height = layout.height;
  const panelWidth = width - 56;
  const panelHeight = 214;
  const panelX = 28;
  const panelY = Math.max(120, (height - panelHeight) / 2);

  context.fillStyle = themeTokens.color.overlayHeavy;
  context.fillRect(0, 0, width, height);

  fillRoundedRect(context, panelX, panelY, panelWidth, panelHeight, 24, themeTokens.color.paperSoft);
  context.strokeStyle = themeTokens.color.bronzeSoft;
  context.lineWidth = 2;
  strokeRoundedRect(context, panelX, panelY, panelWidth, panelHeight, 24);

  context.fillStyle = themeTokens.color.jade;
  context.font = "bold 22px sans-serif";
  context.fillText(viewModel.title, panelX + 24, panelY + 38);

  context.fillStyle = themeTokens.color.ink;
  context.font = "16px sans-serif";
  (viewModel.bodyLines || []).slice(0, 3).forEach((line, index) => {
    context.fillText(String(line), panelX + 24, panelY + 82 + index * 26);
  });

  const cancelRect = { x: panelX + 24, y: panelY + panelHeight - 64, width: panelWidth / 2 - 36, height: 40 };
  const confirmRect = { x: panelX + panelWidth / 2 + 12, y: panelY + panelHeight - 64, width: panelWidth / 2 - 36, height: 40 };

  fillRoundedRect(
    context,
    cancelRect.x,
    cancelRect.y,
    cancelRect.width,
    cancelRect.height,
    14,
    themeTokens.color.buttonSurface
  );
  fillRoundedRect(
    context,
    confirmRect.x,
    confirmRect.y,
    confirmRect.width,
    confirmRect.height,
    14,
    themeTokens.color.buttonSurface
  );
  context.strokeStyle = themeTokens.color.buttonBorder;
  context.lineWidth = 2;
  strokeRoundedRect(context, cancelRect.x + 1, cancelRect.y + 1, cancelRect.width - 2, cancelRect.height - 2, 13);
  strokeRoundedRect(context, confirmRect.x + 1, confirmRect.y + 1, confirmRect.width - 2, confirmRect.height - 2, 13);

  context.fillStyle = themeTokens.color.buttonText;
  context.font = "bold 16px sans-serif";
  context.fillText(viewModel.cancelText || "取消", cancelRect.x + 20, cancelRect.y + 25);
  context.fillText(viewModel.confirmText || "确认", confirmRect.x + 20, confirmRect.y + 25);

  registerHitRegion({
    x: 0,
    y: 0,
    width,
    height,
    onTap: actions.onCancel,
  });
  registerHitRegion({
    ...cancelRect,
    onTap: actions.onCancel,
  });
  registerHitRegion({
    ...confirmRect,
    onTap: actions.onConfirm,
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
  drawConfirmModal,
};
