const { themeTokens } = require("../theme/tokens");

function drawConfirmModal(context, layout, viewModel, registerHitRegion, actions) {
  if (!context || !viewModel) {
    return;
  }

  const width = layout.width;
  const height = layout.height;
  const panelWidth = width - 56;
  const bodyTextWidth = panelWidth - 48;
  context.font = "16px sans-serif";
  const visibleBodyLines = wrapBodyLines(context, viewModel.bodyLines || [], bodyTextWidth, 8);
  const bodyLineHeight = 24;
  const panelHeight = Math.min(height - 64, Math.max(214, 136 + visibleBodyLines.length * bodyLineHeight));
  const panelX = 28;
  const panelY = Math.max(32, (height - panelHeight) / 2);

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
  visibleBodyLines.forEach((line, index) => {
    context.fillText(String(line), panelX + 24, panelY + 82 + index * bodyLineHeight);
  });

  const cancelRect = { x: panelX + 24, y: panelY + panelHeight - 64, width: panelWidth / 2 - 36, height: 40 };
  const confirmRect = { x: panelX + panelWidth / 2 + 12, y: panelY + panelHeight - 64, width: panelWidth / 2 - 36, height: 40 };
  const singleConfirmRect = { x: panelX + 24, y: panelY + panelHeight - 64, width: panelWidth - 48, height: 40 };
  const showCancel = viewModel.showCancel !== false;

  if (showCancel) {
    fillRoundedRect(
      context,
      cancelRect.x,
      cancelRect.y,
      cancelRect.width,
      cancelRect.height,
      14,
      themeTokens.color.buttonSurface
    );
  }
  const activeConfirmRect = showCancel ? confirmRect : singleConfirmRect;
  fillRoundedRect(
    context,
    activeConfirmRect.x,
    activeConfirmRect.y,
    activeConfirmRect.width,
    activeConfirmRect.height,
    14,
    themeTokens.color.buttonSurface
  );
  context.strokeStyle = themeTokens.color.buttonBorder;
  context.lineWidth = 2;
  if (showCancel) {
    strokeRoundedRect(context, cancelRect.x + 1, cancelRect.y + 1, cancelRect.width - 2, cancelRect.height - 2, 13);
  }
  strokeRoundedRect(
    context,
    activeConfirmRect.x + 1,
    activeConfirmRect.y + 1,
    activeConfirmRect.width - 2,
    activeConfirmRect.height - 2,
    13
  );

  context.fillStyle = themeTokens.color.buttonText;
  context.font = "bold 16px sans-serif";
  if (showCancel) {
    context.fillText(viewModel.cancelText || "取消", cancelRect.x + 20, cancelRect.y + 25);
  }
  const confirmLabel = viewModel.confirmText || "确认";
  const confirmTextWidth = context.measureText(confirmLabel).width;
  context.fillText(confirmLabel, activeConfirmRect.x + (activeConfirmRect.width - confirmTextWidth) / 2, activeConfirmRect.y + 25);

  registerHitRegion({
    x: 0,
    y: 0,
    width,
    height,
    onTap: actions.onCancel,
  });
  if (showCancel) {
    registerHitRegion({
      ...cancelRect,
      onTap: actions.onCancel,
    });
  }
  registerHitRegion({
    ...activeConfirmRect,
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

function wrapBodyLines(context, lines, maxWidth, maxLines) {
  const wrappedLines = [];
  for (const rawLine of lines) {
    const nextLines = wrapLine(context, String(rawLine || ""), maxWidth);
    for (const line of nextLines) {
      if (wrappedLines.length >= maxLines) {
        return wrappedLines;
      }
      wrappedLines.push(line);
    }
  }
  return wrappedLines;
}

function wrapLine(context, text, maxWidth) {
  if (!text || context.measureText(text).width <= maxWidth) {
    return [text];
  }

  const lines = [];
  let currentLine = "";
  Array.from(text).forEach((character) => {
    const candidate = `${currentLine}${character}`;
    if (currentLine && context.measureText(candidate).width > maxWidth) {
      lines.push(currentLine);
      currentLine = character;
      return;
    }
    currentLine = candidate;
  });

  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

module.exports = {
  drawConfirmModal,
};
