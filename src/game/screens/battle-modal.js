const { themeTokens } = require("../theme/tokens");

function drawBattleModal(context, layout, viewModel, registerHitRegion, onChoose) {
  if (!context || !viewModel) {
    return;
  }

  const width = layout.width;
  const height = layout.height;
  const panelX = 24;
  const panelY = 72;
  const panelWidth = width - 48;
  const panelHeight = Math.min(height - 144, 500);
  const logRect = {
    x: panelX + 20,
    y: panelY + 198,
    width: panelWidth - 40,
    height: 108,
  };

  context.fillStyle = themeTokens.color.overlayHeavy;
  context.fillRect(0, 0, width, height);

  context.fillStyle = themeTokens.color.paperSoft;
  fillRoundedRect(context, panelX, panelY, panelWidth, panelHeight, 24);
  context.strokeStyle = themeTokens.color.bronzeSoft;
  context.lineWidth = 2;
  strokeRoundedRect(context, panelX, panelY, panelWidth, panelHeight, 24);

  context.fillStyle = themeTokens.color.jade;
  context.font = "bold 24px sans-serif";
  context.fillText(viewModel.title, panelX + 20, panelY + 36);
  context.fillStyle = themeTokens.color.inkSoft;
  context.font = "14px sans-serif";
  context.fillText(viewModel.subtitle, panelX + 20, panelY + 62);

  drawActorCard(context, panelX + 20, panelY + 86, panelWidth - 40, 48, viewModel.player, true);
  drawActorCard(context, panelX + 20, panelY + 140, panelWidth - 40, 48, viewModel.enemy, false);

  context.fillStyle = themeTokens.color.paper;
  fillRoundedRect(context, logRect.x, logRect.y, logRect.width, logRect.height, 18);
  context.strokeStyle = themeTokens.color.scrollEdge;
  context.lineWidth = 1.5;
  strokeRoundedRect(context, logRect.x, logRect.y, logRect.width, logRect.height, 18);

  context.fillStyle = themeTokens.color.ink;
  context.font = "14px sans-serif";
  (viewModel.logLines || []).forEach((line, index) => {
    context.fillText(String(line), logRect.x + 14, logRect.y + 26 + index * 24);
  });

  const actions = Array.isArray(viewModel.actions) ? viewModel.actions : [];
  const columns = 2;
  const gap = 12;
  const buttonWidth = (panelWidth - 40 - gap) / columns;
  const buttonHeight = 54;
  const actionTop = logRect.y + logRect.height + 18;

  actions.forEach((actionItem, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const rect = {
      x: panelX + 20 + column * (buttonWidth + gap),
      y: actionTop + row * (buttonHeight + 12),
      width: buttonWidth,
      height: buttonHeight,
    };

    drawActionButton(context, rect, actionItem);
    if (!actionItem.disabled) {
      registerHitRegion({
        ...rect,
        onTap: () => onChoose(actionItem.action),
      });
    }
  });
}

function drawActorCard(context, x, y, width, height, actor, isPlayer) {
  context.fillStyle = isPlayer ? "#f4ecdd" : "#efe2d0";
  fillRoundedRect(context, x, y, width, height, 16);
  context.strokeStyle = isPlayer ? themeTokens.color.jadeSoft : themeTokens.color.bronze;
  context.lineWidth = 1.5;
  strokeRoundedRect(context, x, y, width, height, 16);

  context.fillStyle = themeTokens.color.ink;
  context.font = "bold 16px sans-serif";
  context.fillText(`${actor.name} ${actor.realm}`, x + 14, y + 20);
  context.font = "13px sans-serif";
  context.fillText(`气血 ${actor.hpCurrent}/${actor.hpMax}`, x + 14, y + 40);
  context.fillText(`攻 ${actor.attack} 防 ${actor.defense} 速 ${actor.speed}`, x + width - 120, y + 40);
}

function drawActionButton(context, rect, actionItem) {
  const disabled = actionItem.disabled === true;
  context.fillStyle = disabled ? themeTokens.color.buttonDisabledSurface : themeTokens.color.buttonSurface;
  fillRoundedRect(context, rect.x, rect.y, rect.width, rect.height, 18);
  context.strokeStyle = disabled ? themeTokens.color.buttonDisabledBorder : themeTokens.color.buttonBorder;
  context.lineWidth = 2;
  strokeRoundedRect(context, rect.x, rect.y, rect.width, rect.height, 18);
  context.fillStyle = disabled ? themeTokens.color.buttonDisabledText : themeTokens.color.buttonText;
  context.font = "bold 16px sans-serif";
  const metrics = context.measureText(actionItem.label);
  context.fillText(actionItem.label, rect.x + (rect.width - metrics.width) / 2, rect.y + 32);
}

function fillRoundedRect(context, x, y, width, height, radius) {
  traceRoundedRect(context, x, y, width, height, radius);
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
  drawBattleModal,
};
