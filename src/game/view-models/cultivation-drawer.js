const { formatRealmName } = require("../utils/display-text");

function buildCultivationDrawerViewModel(snapshot) {
  const run = snapshot && snapshot.run ? snapshot.run : null;
  const requirements = run && run.breakthrough_requirements ? run.breakthrough_requirements : null;
  const cultivationExp = Number((run && run.character && run.character.cultivation_exp) || 0);
  const spiritStone = Number((run && run.resources && run.resources.spirit_stone) || 0);
  const requiredCultivationExp = Number((requirements && requirements.required_cultivation_exp) || 0);
  const requiredSpiritStone = Number((requirements && requirements.required_spirit_stone) || 0);

  const canBreakthrough =
    Boolean(run) &&
    Boolean(requirements) &&
    !(run.character && run.character.is_dead) &&
    cultivationExp >= requiredCultivationExp &&
    spiritStone >= requiredSpiritStone;

  let hint = "境界未开。";
  if (run && run.character && run.character.is_dead) {
    hint = "此身已尽，无法再行突破。";
  } else if (!requirements) {
    hint = "当前已无可突破境界。";
  } else if (canBreakthrough) {
    hint = "修为与灵石已备，可以尝试突破。";
  } else if (cultivationExp < requiredCultivationExp) {
    hint = `修为不足，还需达到 ${requiredCultivationExp}。`;
  } else if (spiritStone < requiredSpiritStone) {
    hint = `灵石不足，还需 ${requiredSpiritStone}。`;
  }

  return {
    title: "修行",
    currentRealm: run && run.character
      ? formatRealmName(run.character.realm, run.character.realm_display_name)
      : "未启程",
    targetRealm: requirements
      ? formatRealmName(requirements.target_realm_key, requirements.target_realm_display_name)
      : "无",
    currentCultivationExp: cultivationExp,
    currentSpiritStone: spiritStone,
    requiredCultivationExp,
    requiredSpiritStone,
    canBreakthrough,
    hint,
  };
}

module.exports = {
  buildCultivationDrawerViewModel,
};
