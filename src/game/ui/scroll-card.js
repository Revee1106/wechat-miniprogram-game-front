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
  const summaryBottom = infoTop + 132;
  const equipmentTop = summaryBottom + 14;
  const equipmentBottom = equipmentTop + 102;
  const logTop = equipmentBottom + 18;

  context.fillStyle = "rgba(163, 109, 45, 0.12)";
  context.fillRect(rect.x + 18, logTop - 12, rect.width - 36, 1);

  if (Array.isArray(content.summaryRows)) {
    const columnGap = 20;
    const columnWidth = (rect.width - headerInset * 2 - columnGap) / 2;
    const rowGap = 30;
    content.summaryRows.forEach((row, index) => {
      const column = index % 2;
      const rowIndex = Math.floor(index / 2);
      const left = rect.x + headerInset + column * (columnWidth + columnGap);
      const top = infoTop + rowIndex * rowGap;
      context.fillStyle = themeTokens.color.inkSoft;
      context.font = "13px sans-serif";
      context.fillText(String(row.label), left, top + 18);
      context.fillStyle = themeTokens.color.ink;
      context.font = "bold 14px sans-serif";
      context.fillText(String(row.value), left + 46, top + 18);
    });
  }

  drawEquipmentSlots(context, rect, {
    top: equipmentTop,
    slots: content.equipmentSlots || [],
    registerHitRegion: content.registerHitRegion,
    onEquipmentTap: content.onEquipmentTap,
  });

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

function drawEquipmentSlots(context, rect, options) {
  const slots = Array.isArray(options.slots) ? options.slots : [];
  if (!slots.length) {
    return;
  }

  const headerInset = 22;
  context.fillStyle = "rgba(163, 109, 45, 0.12)";
  context.fillRect(rect.x + 18, options.top - 6, rect.width - 36, 1);
  context.fillStyle = themeTokens.color.accent;
  context.font = "bold 16px sans-serif";
  context.fillText("当前装备", rect.x + headerInset, options.top + 16);

  const columns = 2;
  const gap = 10;
  const slotWidth = (rect.width - headerInset * 2 - gap) / columns;
  const slotHeight = 34;
  const startY = options.top + 28;

  slots.forEach((slot, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const slotRect = {
      x: rect.x + headerInset + column * (slotWidth + gap),
      y: startY + row * (slotHeight + 8),
      width: slotWidth,
      height: slotHeight,
    };
    context.fillStyle = slot.item ? "#efe2d0" : "#f6eddc";
    fillRoundedRect(context, slotRect.x, slotRect.y, slotRect.width, slotRect.height, 10);
    context.strokeStyle = slot.item ? themeTokens.color.bronze : "rgba(119, 96, 68, 0.32)";
    context.lineWidth = 1.5;
    strokeRoundedRect(context, slotRect.x, slotRect.y, slotRect.width, slotRect.height, 10);

    if (!slot.item) {
      context.fillStyle = themeTokens.color.ink;
      context.font = "bold 14px sans-serif";
      context.fillText(`${slot.label}: 空`, slotRect.x + 10, slotRect.y + 22);
    } else {
      context.fillStyle = themeTokens.color.inkSoft;
      context.font = "12px sans-serif";
      context.fillText(slot.label, slotRect.x + 8, slotRect.y + 14);
      context.fillStyle = themeTokens.color.ink;
      context.font = "bold 13px sans-serif";
      context.fillText(trimText(context, slot.title, slotWidth - 52), slotRect.x + 44, slotRect.y + 14);
      context.fillStyle = themeTokens.color.inkSoft;
      context.font = "12px sans-serif";
      context.fillText(trimText(context, slot.detail, slotWidth - 16), slotRect.x + 8, slotRect.y + 28);
    }

    if (slot.item && typeof options.registerHitRegion === "function") {
      options.registerHitRegion({
        ...slotRect,
        onTap: () => options.onEquipmentTap(slot.item),
      });
    }
  });
}

function trimText(context, text, maxWidth) {
  const value = String(text || "");
  if (context.measureText(value).width <= maxWidth) {
    return value;
  }
  let next = value;
  while (next.length > 1 && context.measureText(`${next}…`).width > maxWidth) {
    next = next.slice(0, -1);
  }
  return `${next}…`;
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
