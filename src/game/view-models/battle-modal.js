const { formatRealmName } = require("../utils/display-text");

function buildBattleModalViewModel(snapshot) {
  const run = snapshot && snapshot.run ? snapshot.run : null;
  const battle = run ? run.active_battle : null;
  if (!run || !battle) {
    return null;
  }

  const player = battle.player || {};
  const enemy = battle.enemy || {};

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
        label: `服丹 (${Math.max(0, Number(battle.pill_count) || 0)})`,
        disabled: (Number(battle.pill_count) || 0) <= 0,
      },
      {
        action: "flee",
        label: "逃跑",
        disabled: battle.allow_flee === false,
      },
    ],
  };
}

module.exports = {
  buildBattleModalViewModel,
};
