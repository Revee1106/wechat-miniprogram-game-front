const { themeTokens } = require("../theme/tokens");

function drawPlaque(context, rect, content = {}) {
  if (!context || !rect) {
    return;
  }

  fillRoundedRect(context, rect.x, rect.y, rect.width, rect.height, 26, themeTokens.color.jadeDeep);

  context.fillStyle = "rgba(255, 248, 235, 0.08)";
  context.fillRect(rect.x + 14, rect.y + 14, Math.max(0, rect.width - 28), 1);

  context.fillStyle = themeTokens.color.creamText;
  context.font = `bold ${themeTokens.font.title}px sans-serif`;
  context.fillText(String(content.title || ""), rect.x + 20, rect.y + 36);

  context.fillStyle = "rgba(255, 248, 235, 0.78)";
  context.font = `${themeTokens.font.body}px sans-serif`;
  context.fillText(String(content.subtitle || ""), rect.x + 20, rect.y + 64);

  if (content.badge) {
    const badgeRect = {
      x: rect.x + rect.width - 74,
      y: rect.y + 16,
      width: 54,
      height: 28,
    };
    fillRoundedRect(context, badgeRect.x, badgeRect.y, badgeRect.width, badgeRect.height, 14, "rgba(255, 248, 235, 0.08)");
    context.fillStyle = themeTokens.color.creamText;
    context.font = "bold 12px sans-serif";
    context.fillText(String(content.badge), badgeRect.x + 16, badgeRect.y + 18);
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

module.exports = {
  drawPlaque,
};
