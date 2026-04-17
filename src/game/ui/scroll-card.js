const { themeTokens } = require("../theme/tokens");

function drawScrollCard(context, rect, content = {}) {
  if (!context || !rect) {
    return;
  }

  context.fillStyle = "rgba(44, 30, 16, 0.08)";
  fillRoundedRect(context, rect.x + 4, rect.y + themeTokens.shadow.cardOffsetY, rect.width, rect.height, 26);

  fillRoundedRect(context, rect.x, rect.y, rect.width, rect.height, 26, themeTokens.color.paperSoft);
  context.strokeStyle = themeTokens.color.scrollEdge;
  context.lineWidth = 2;
  strokeRoundedRect(context, rect.x, rect.y, rect.width, rect.height, 26);

  const headerInset = 22;
  const infoTop = rect.y + 22;
  const infoBottom = rect.y + Math.floor(rect.height * 0.66);
  const logTop = infoBottom + 18;

  context.fillStyle = "rgba(163, 109, 45, 0.12)";
  context.fillRect(rect.x + 18, logTop - 12, rect.width - 36, 1);

  if (Array.isArray(content.summaryRows)) {
    const rowCount = Math.max(1, content.summaryRows.length);
    const rowGap = Math.min(42, Math.max(26, Math.floor((infoBottom - infoTop - 8) / rowCount)));
    const valueX = rect.x + rect.width * 0.52;
    content.summaryRows.forEach((row, index) => {
      const top = infoTop + index * rowGap;
      context.fillStyle = themeTokens.color.inkSoft;
      context.font = rowGap < 32 ? "13px sans-serif" : "15px sans-serif";
      context.fillText(String(row.label), rect.x + headerInset, top + rowGap - 10);
      context.fillStyle = themeTokens.color.ink;
      context.font = rowGap < 32 ? "bold 14px sans-serif" : "bold 16px sans-serif";
      context.fillText(String(row.value), valueX, top + rowGap - 10);
    });
  }

  context.fillStyle = themeTokens.color.accent;
  context.font = "bold 18px sans-serif";
  context.fillText(String(content.logTitle || "日志"), rect.x + headerInset, logTop + 6);

  const logEntries = Array.isArray(content.logEntries) ? content.logEntries : [];
  logEntries.slice(0, 2).forEach((entry, index) => {
    const baseY = logTop + 34 + index * 56;
    context.fillStyle = themeTokens.color.ink;
    context.font = "bold 15px sans-serif";
    context.fillText(String(entry.title || ""), rect.x + headerInset, baseY);

    context.fillStyle = themeTokens.color.inkSoft;
    context.font = "14px sans-serif";
    (entry.detailLines || []).slice(0, 2).forEach((line, lineIndex) => {
      context.fillText(String(line), rect.x + headerInset, baseY + 22 + lineIndex * 18);
    });
  });

  if (logEntries.length === 0 && content.emptyLogText) {
    context.fillStyle = themeTokens.color.inkSoft;
    context.font = "14px sans-serif";
    context.fillText(String(content.emptyLogText), rect.x + headerInset, logTop + 34);
  }
}

function fillRoundedRect(context, x, y, width, height, radius, fillStyle) {
  traceRoundedRect(context, x, y, width, height, radius);
  if (fillStyle) {
    context.fillStyle = fillStyle;
  }
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
  drawScrollCard,
};
