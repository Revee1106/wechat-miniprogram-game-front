const { formatRealmName } = require("../utils/display-text");

function buildBattleModalViewModel(snapshot) {
  const run = snapshot && snapshot.run ? snapshot.run : null;
  const battle = run ? run.active_battle : null;
  if (!run || !battle) {
    return null;
  }

  const player = battle.player || {};
  const enemy = battle.enemy || {};
  const battlePillOptions = buildBattlePillOptions(run);
  const battlePillCount = battlePillOptions.reduce((sum, item) => sum + item.amount, 0);

  return {
    title: enemy.name ? `遭遇 ${enemy.name}` : "模拟战斗",
    subtitle: `第 ${Math.max(1, Number(battle.round_index) || 1)} 回合`,
    player: {
      name: "你",
      realm: formatRealmName(run.character.realm, player.realm_label || run.character.realm_display_name),
      hpCurrent: Math.max(0, Number(player.hp_current) || 0),
      hpMax: Math.max(1, Number(player.hp_max) || 1),
      attack: Math.max(0, Number(player.attack) || 0),
      defense: Math.max(0, Number(player.defense) || 0),
      speed: Math.max(0, Number(player.speed) || 0),
    },
    enemy: {
      name: enemy.name || "敌人",
      realm: formatRealmName("", enemy.realm_label),
      hpCurrent: Math.max(0, Number(enemy.hp_current) || 0),
      hpMax: Math.max(1, Number(enemy.hp_max) || 1),
      attack: Math.max(0, Number(enemy.attack) || 0),
      defense: Math.max(0, Number(enemy.defense) || 0),
      speed: Math.max(0, Number(enemy.speed) || 0),
    },
    logLines:
      Array.isArray(battle.log_lines) && battle.log_lines.length > 0
        ? battle.log_lines.slice(-3)
        : ["战斗已开始。"],
    actions: [
      { action: "attack", label: "攻击" },
      { action: "defend", label: "防御" },
      {
        action: "use_pill",
        label: `服丹 (${battlePillCount})`,
        disabled: battlePillCount <= 0,
      },
      {
        action: "flee",
        label: "逃跑",
        disabled: battle.allow_flee === false,
      },
    ],
    battlePillOptions,
  };
}

function buildBattlePillOptions(run) {
  const inventory =
    run && run.alchemy_state && Array.isArray(run.alchemy_state.inventory)
      ? run.alchemy_state.inventory
      : [];

  return inventory
    .filter((item) => Number(item.amount || 0) > 0)
    .filter((item) => item.usable_in_battle === true && item.effect_type === "hp_restore")
    .map((item) => {
      const amount = Math.max(0, Number(item.amount) || 0);
      const healAmount = Math.max(
        0,
        Math.trunc(Number(item.effect_value || 0) * getQualityMultiplier(item))
      );
      const qualityLabel = formatQuality(item);
      const displayName = item.display_name || item.item_id || "丹药";
      return {
        key: `${item.item_id}:${item.quality}`,
        itemId: item.item_id,
        quality: item.quality,
        label: `${qualityLabel} · ${displayName} x${amount}`,
        detail: healAmount > 0 ? `恢复 ${healAmount} 点气血` : item.effect_summary || "恢复气血",
        amount,
        action: {
          action: "use_pill",
          itemId: item.item_id,
          quality: item.quality,
        },
      };
    });
}

function formatQuality(item) {
  if (item && item.quality_label) {
    return item.quality_label;
  }
  return {
    low: "下品",
    mid: "中品",
    high: "上品",
    supreme: "极品",
  }[item && item.quality] || "未知品质";
}

function getQualityMultiplier(item) {
  if (Number(item && item.effect_multiplier) > 0) {
    return Number(item.effect_multiplier);
  }
  return {
    low: 1,
    mid: 1.25,
    high: 1.5,
    supreme: 2,
  }[item && item.quality] || 1;
}

module.exports = {
  buildBattleModalViewModel,
};
