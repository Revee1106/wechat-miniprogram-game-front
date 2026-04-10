const { formatRealmName } = require("../src/game/utils/display-text");

function getBreakthroughRequirements(run) {
  const requirements = run && run.breakthrough_requirements ? run.breakthrough_requirements : null;
  return {
    requiredCultivationExp: requirements ? Number(requirements.required_cultivation_exp || 0) : 0,
    requiredSpiritStone: requirements ? Number(requirements.required_spirit_stone || 0) : 0,
    targetRealmDisplayName: requirements
      ? formatRealmName(requirements.target_realm_key, requirements.target_realm_display_name)
      : "",
  };
}

function canAttemptBreakthrough(run) {
  if (!run || !run.character || run.character.is_dead || !run.breakthrough_requirements) {
    return false;
  }

  const requirements = getBreakthroughRequirements(run);
  return (
    Number(run.character.cultivation_exp || 0) >= requirements.requiredCultivationExp &&
    Number((run.resources && run.resources.spirit_stone) || 0) >= requirements.requiredSpiritStone
  );
}

function buildBreakthroughHint(run, canBreakthrough) {
  if (!run) {
    return "命卷未启，暂无可修之身。";
  }

  if (run.character.is_dead) {
    return "此身已尽，无法再行破境。";
  }

  if (!run.breakthrough_requirements) {
    return "当前已至已开放境界尽头，暂时无可再破之关。";
  }

  const requirements = getBreakthroughRequirements(run);
  if (canBreakthrough) {
    return "修为与当前所需资材已备，可以尝试破境。";
  }

  if (Number(run.character.cultivation_exp || 0) < requirements.requiredCultivationExp) {
    return `修为未满，还需累积至 ${requirements.requiredCultivationExp}。`;
  }

  if (Number((run.resources && run.resources.spirit_stone) || 0) < requirements.requiredSpiritStone) {
    return requirements.requiredSpiritStone > 0
      ? `灵石不足，当前破境仍需 ${requirements.requiredSpiritStone} 枚灵石。`
      : "当前条件仍未满足，请稍后再试。";
  }

  return "时机未至，暂且收束心神。";
}

module.exports = {
  getBreakthroughRequirements,
  canAttemptBreakthrough,
  buildBreakthroughHint,
};
