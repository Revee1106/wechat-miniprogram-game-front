const { themeTokens } = require("../theme/tokens");

function drawAlchemyDrawer(context, layout, viewModel, registerHitRegion, actions) {
  if (!context || !viewModel) {
    return;
  }

  const width = layout.width;
  const height = layout.height;
  const safeBottom = layout.viewport ? layout.viewport.safeBottom : 0;
  const drawerY = height * 0.2;
  const selectedRecipeId = actions.selectedRecipeId || "";
  const selectedRecipe = viewModel.recipeCards.find((card) => card.id === selectedRecipeId) || null;

  context.fillStyle = themeTokens.color.overlay;
  context.fillRect(0, 0, width, height);

  fillRoundedRect(context, 0, drawerY, width, height - drawerY, 28, themeTokens.color.paperSoft);

  context.fillStyle = themeTokens.color.jade;
  context.font = "bold 22px sans-serif";
  context.fillText(viewModel.title, 24, drawerY + 34);

  context.fillStyle = themeTokens.color.ink;
  context.font = "16px sans-serif";
  context.fillText(`丹道: ${viewModel.masteryTitle}`, 24, drawerY + 70);
  context.fillText(`熟练度: ${viewModel.masteryExp}`, 24, drawerY + 100);
  context.fillText(`灵泉水: ${viewModel.spiritSpringWaterAmount}`, 24, drawerY + 130);
  if (viewModel.hasActiveJob) {
    context.fillStyle = themeTokens.color.timeCostText;
    context.font = "bold 16px sans-serif";
  }
  context.fillText(viewModel.activeJobSummary, 24, drawerY + 160);
  context.fillStyle = themeTokens.color.ink;
  context.font = "16px sans-serif";
  if (viewModel.lastResultSummary) {
    context.fillText(`最近结果: ${viewModel.lastResultSummary}`, 24, drawerY + 190);
  }
  if (viewModel.spiritSpringHint) {
    context.font = "13px sans-serif";
    context.fillText(viewModel.spiritSpringHint, 24, drawerY + (viewModel.lastResultSummary ? 214 : 190));
  }

  const recipeStartY = drawerY + (viewModel.lastResultSummary ? 238 : 214);
  const recipeRows = Math.ceil(viewModel.recipeCards.length / 2);
  const recipeAreaBottom = recipeStartY + recipeRows * 52;
  const detailTop = recipeAreaBottom + 18;
  const detailHeight = Math.max(210, height - safeBottom - detailTop - 28);

  drawRecipeTags(
    context,
    width,
    recipeStartY,
    viewModel.recipeCards,
    selectedRecipeId,
    registerHitRegion,
    actions
  );

  drawRecipeDetail(
    context,
    {
      x: 20,
      y: detailTop,
      width: width - 40,
      height: detailHeight,
    },
    selectedRecipe,
    registerHitRegion,
    actions
  );
}

function drawRecipeTags(context, width, startY, recipeCards, selectedRecipeId, registerHitRegion, actions) {
  const chipWidth = (width - 72) / 2;
  const chipHeight = 40;

  recipeCards.forEach((card, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const rect = {
      x: 24 + col * (chipWidth + 16),
      y: startY + row * 52,
      width: chipWidth,
      height: chipHeight,
    };
    const active = card.id === selectedRecipeId;
    fillRoundedRect(context, rect.x, rect.y, rect.width, rect.height, 18, active ? themeTokens.color.buttonSurface : "#f3e6cf");
    if (active) {
      context.strokeStyle = themeTokens.color.buttonBorder;
      context.lineWidth = 2;
      strokeRoundedRect(context, rect.x + 1, rect.y + 1, rect.width - 2, rect.height - 2, 17);
    }
    context.fillStyle = active ? themeTokens.color.buttonText : themeTokens.color.ink;
    context.font = "bold 15px sans-serif";
    context.fillText(card.title, rect.x + 14, rect.y + 25);

    registerHitRegion({
      ...rect,
      onTap: () => actions.onSelectRecipe(card.id),
    });
  });
}

function drawRecipeDetail(context, rect, selectedRecipe, registerHitRegion, actions) {
  fillRoundedRect(context, rect.x, rect.y, rect.width, rect.height, 20, "#f3e6cf");
  context.fillStyle = themeTokens.color.accent;
  context.font = "bold 18px sans-serif";
  context.fillText(selectedRecipe ? selectedRecipe.title : "丹方详情", rect.x + 18, rect.y + 28);

  context.fillStyle = themeTokens.color.ink;
  context.font = "16px sans-serif";
  if (!selectedRecipe) {
    context.fillText("点选上方丹方后，再决定是否开炉炼制。", rect.x + 18, rect.y + 60);
    return;
  }

  const detailLines = wrapDetailLines(context, [
    `作用: ${selectedRecipe.effectSummary}`,
    `材料: ${selectedRecipe.ingredientsText}`,
    `炼制: ${selectedRecipe.durationText}, 基础评分 ${selectedRecipe.successRateText}`,
    `要求: ${selectedRecipe.requiredText}`,
    selectedRecipe.disabledReason ? `状态: ${selectedRecipe.disabledReason}` : "借灵泉: 额外消耗 1 灵泉水, 炼丹评分 +0.08",
  ], rect.width - 36, 7);
  detailLines.forEach((line, index) => {
    context.fillText(line, rect.x + 18, rect.y + 60 + index * 24);
  });

  const buttonTop = rect.y + rect.height - 100;
  const startRect = { x: rect.x + 18, y: buttonTop, width: rect.width - 36, height: 40 };
  const springRect = { x: rect.x + 18, y: buttonTop + 52, width: rect.width - 36, height: 40 };
  drawActionButton(context, startRect, selectedRecipe.action.label, { disabled: !selectedRecipe.canStart });
  drawActionButton(context, springRect, selectedRecipe.springAction.label, { disabled: !selectedRecipe.canStart });

  if (selectedRecipe.canStart) {
    registerHitRegion({ ...startRect, onTap: () => actions.onRecipeAction(selectedRecipe.action) });
    registerHitRegion({ ...springRect, onTap: () => actions.onRecipeAction(selectedRecipe.springAction) });
  }
}

function wrapDetailLines(context, lines, maxWidth, maxLines) {
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

function drawActionButton(context, rect, label, options = {}) {
  const disabled = options.disabled === true;
  fillRoundedRect(
    context,
    rect.x,
    rect.y,
    rect.width,
    rect.height,
    12,
    disabled ? themeTokens.color.buttonDisabledSurface : themeTokens.color.buttonSurface
  );
  context.strokeStyle = disabled ? themeTokens.color.buttonDisabledBorder : themeTokens.color.buttonBorder;
  context.lineWidth = 2;
  strokeRoundedRect(context, rect.x + 1, rect.y + 1, rect.width - 2, rect.height - 2, 17);
  context.fillStyle = disabled ? themeTokens.color.buttonDisabledText : themeTokens.color.buttonText;
  context.font = "bold 16px sans-serif";
  const textWidth = context.measureText(label).width;
  context.fillText(label, rect.x + (rect.width - textWidth) / 2, rect.y + 26);
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
  drawAlchemyDrawer,
};
