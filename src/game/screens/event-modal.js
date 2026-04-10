const { themeTokens } = require("../theme/tokens");

function drawEventModal(context, layout, viewModel, registerHitRegion, onChoose) {
  if (!context || !viewModel) {
    return;
  }

  const width = layout.width;
  const height = layout.height;
  const panelX = 28;
  const panelWidth = width - 56;
  context.font = "16px sans-serif";
  const bodyLines = wrapText(context, viewModel.body, panelWidth - 48).slice(0, 4);
  const optionLayouts = buildOptionLayouts(context, viewModel.options, panelWidth - 48);
  const optionsHeight =
    optionLayouts.reduce((total, item) => total + item.height, 0) + Math.max(0, optionLayouts.length - 1) * 12;
  const panelHeight = Math.min(
    Math.max(320, 116 + bodyLines.length * 24 + optionsHeight),
    height - 48
  );
  const panelY = Math.max(24, (height - panelHeight) / 2);

  context.fillStyle = themeTokens.color.overlayHeavy;
  context.fillRect(0, 0, width, height);

  context.fillStyle = themeTokens.color.paperSoft;
  fillRoundedRect(context, panelX, panelY, panelWidth, panelHeight, 24);
  context.strokeStyle = themeTokens.color.bronzeSoft;
  context.lineWidth = 2;
  strokeRoundedRect(context, panelX, panelY, panelWidth, panelHeight, 24);

  context.fillStyle = themeTokens.color.jade;
  context.font = "bold 24px sans-serif";
  context.fillText(viewModel.title, panelX + 24, panelY + 36);

  context.fillStyle = themeTokens.color.ink;
  context.font = "16px sans-serif";
  bodyLines.forEach((line, index) => {
    context.fillText(line, panelX + 24, panelY + 74 + index * 24);
  });

  let currentY = panelY + 92 + bodyLines.length * 24;

  optionLayouts.forEach((layoutItem) => {
    const { option, optionHeight, titleLines } = layoutItem;
    const y = currentY;
    const fillStyle = option.disabled
      ? themeTokens.color.buttonDisabledSurface
      : themeTokens.color.buttonSurface;
    fillRoundedRect(context, panelX + 24, y, panelWidth - 48, optionHeight, 18, fillStyle);
    context.strokeStyle = option.disabled
      ? themeTokens.color.buttonDisabledBorder
      : themeTokens.color.buttonBorder;
    context.lineWidth = 2;
    strokeRoundedRect(context, panelX + 25, y + 1, panelWidth - 50, optionHeight - 2, 17);

    context.fillStyle = option.disabled
      ? themeTokens.color.buttonDisabledText
      : themeTokens.color.buttonText;
    context.font = "bold 18px sans-serif";
    titleLines.forEach((line, index) => {
      context.fillText(line, panelX + 40, y + 28 + index * 20);
    });

    let metaY = y + 28 + titleLines.length * 20;

    if (option.timeCostText) {
      context.fillStyle = themeTokens.color.timeCostText;
      context.font = "bold 13px sans-serif";
      context.fillText(option.timeCostText, panelX + 40, metaY);
      metaY += 18;
    }

    if (option.disabled && option.disabledReason) {
      context.fillStyle = themeTokens.color.disabledText;
      context.font = "14px sans-serif";
      context.fillText(option.disabledReason, panelX + 40, metaY);
    }

    if (!option.disabled) {
      registerHitRegion({
        x: panelX + 24,
        y,
        width: panelWidth - 48,
        height: optionHeight,
        onTap: () => onChoose(option.optionId),
      });
    }

    currentY += optionHeight + 12;
  });
}

function buildOptionLayouts(context, options, optionWidth) {
  context.font = "bold 18px sans-serif";
  const titleWidth = optionWidth - 32;

  return (options || []).map((option) => {
    const titleLines = wrapText(context, option.title, titleWidth);
    const titleLineCount = Math.max(1, titleLines.length);
    const extraLineCount = (option.timeCostText ? 1 : 0) + (option.disabled && option.disabledReason ? 1 : 0);
    const optionHeight = Math.max(option.timeCostText ? 72 : 56, 30 + titleLineCount * 20 + extraLineCount * 18);

    return {
      option,
      titleLines,
      optionHeight,
      height: optionHeight,
    };
  });
}

function wrapText(context, text, maxWidth) {
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
      continue;
    }
    current = next;
  }
  if (current) {
    lines.push(current);
  }
  return lines;
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
  drawEventModal,
};
