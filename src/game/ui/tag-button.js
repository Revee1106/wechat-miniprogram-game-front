const { themeTokens } = require("../theme/tokens");

function drawTagButton(context, rect, content = {}) {
  if (!context || !rect) {
    return;
  }

  const active = Boolean(content.active);
  const fillStyle = themeTokens.color.buttonSurface;

  context.fillStyle = "rgba(44, 30, 16, 0.1)";
  context.fillRect(rect.x + 2, rect.y + 5, rect.width, rect.height);

  context.beginPath();
  context.moveTo(rect.x, rect.y);
  context.lineTo(rect.x + rect.width, rect.y);
  context.lineTo(rect.x + rect.width, rect.y + rect.height - 8);
  context.lineTo(rect.x + rect.width / 2, rect.y + rect.height);
  context.lineTo(rect.x, rect.y + rect.height - 8);
  context.closePath();
  context.fillStyle = fillStyle;
  context.fill();
  context.strokeStyle = active ? themeTokens.color.ink : themeTokens.color.buttonBorder;
  context.lineWidth = active ? 3 : 2;
  context.stroke();

  context.fillStyle = themeTokens.color.buttonText;
  context.font = "bold 16px sans-serif";
  const label = String(content.label || "");
  const textWidth = context.measureText(label).width;
  context.fillText(label, rect.x + (rect.width - textWidth) / 2, rect.y + 26);
}

module.exports = {
  drawTagButton,
};
