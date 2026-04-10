const { themeTokens } = require("../theme/tokens");

function drawSealButton(context, rect, content = {}) {
  if (!context || !rect) {
    return;
  }

  const fillStyle = content.disabled
    ? themeTokens.color.buttonDisabledSurface
    : themeTokens.color.buttonSurface;
  fillRoundedRect(context, rect.x, rect.y, rect.width, rect.height, 26, fillStyle);
  context.strokeStyle = content.disabled
    ? themeTokens.color.buttonDisabledBorder
    : themeTokens.color.buttonBorder;
  context.lineWidth = 2;
  strokeRoundedRect(context, rect.x + 1, rect.y + 1, rect.width - 2, rect.height - 2, 25);

  context.fillStyle = content.disabled
    ? themeTokens.color.buttonDisabledText
    : themeTokens.color.buttonText;
  context.font = "bold 20px sans-serif";
  const label = String(content.label || "");
  const metrics = context.measureText(label);
  const textX = rect.x + (rect.width - metrics.width) / 2;
  const textY = rect.y + rect.height / 2 + 7;
  context.fillText(label, textX, textY);
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
  drawSealButton,
};
