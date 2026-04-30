const { formatResourceName } = require("../utils/display-text");

function buildAlchemyDrawerViewModel(snapshot) {
  const run = snapshot && snapshot.run ? snapshot.run : null;
  const alchemyState = run ? run.alchemy_state || {} : {};
  const spiritSpringWaterAmount = getResourceStackAmount(run, "spirit_spring_water");

  const recipeCards = (alchemyState.available_recipes || []).map((recipe) => ({
    id: recipe.recipe_id,
    title: recipe.display_name,
    description: recipe.description || "",
    effectSummary: buildRecipeEffectText(recipe),
    canStart: recipe.can_start === true,
    ingredientsText: buildIngredientsText(recipe.ingredients || {}),
    durationText: `${Number(recipe.duration_months || 0)} 月`,
    successRateText: formatSuccessRate(recipe.current_success_rate ?? recipe.base_success_rate),
    qualityChanceText: buildQualityChanceText(recipe.quality_chances || []),
    requiredText: `丹道 ${Number(recipe.required_alchemy_level || 0)} 级`,
    disabledReason: recipe.disabled_reason || "",
    action: {
      action: "start-alchemy",
      label: "开炉",
      recipeId: recipe.recipe_id,
    },
  }));

  return {
    title: "炼丹",
    masteryTitle: alchemyState.mastery_title || "丹道未入门",
    masteryExp: Number(alchemyState.mastery_exp || 0),
    spiritSpringWaterAmount,
    hasActiveJob: Boolean(alchemyState.active_job),
    recipeCards,
    activeJobSummary: alchemyState.active_job
      ? `${alchemyState.active_job.recipe_name} 尚需 ${Number(alchemyState.active_job.remaining_months || 0)} 月`
      : "当前没有在炼丹方",
    lastResultSummary: alchemyState.last_result ? alchemyState.last_result.summary || "" : "",
  };
}

function getResourceStackAmount(run, resourceKey) {
  const stack = (((run || {}).resource_stacks) || []).find((item) => item.resource_key === resourceKey);
  return stack ? Number(stack.amount) || 0 : 0;
}

function buildIngredientsText(ingredients) {
  return Object.entries(ingredients)
    .map(([key, amount]) => `${formatResourceName(key)} x${amount}`)
    .join(" / ");
}

function buildRecipeEffectText(recipe) {
  const value = Number(recipe.effect_value || 0);
  if (recipe.effect_type === "cultivation_exp") {
    return `服用后提升 ${value} 点修为`;
  }
  if (recipe.effect_type === "hp_restore") {
    return `服用后恢复 ${value} 点气血`;
  }
  if (recipe.effect_type === "lifespan_restore") {
    return `服用后恢复 ${value} 个月寿元`;
  }
  if (recipe.effect_type === "breakthrough_bonus") {
    return `服用后提高 ${value} 点突破辅助值`;
  }
  return recipe.effect_summary || recipe.effectSummary || "";
}

function formatSuccessRate(value) {
  const rate = Number(value || 0);
  return `${Math.round(rate * 100)}%`;
}

function buildQualityChanceText(chances) {
  if (!Array.isArray(chances) || chances.length === 0) {
    return "";
  }
  return chances
    .map((item) => `${item.display_name || item.quality}: ${Math.round(Number(item.chance || 0) * 100)}%`)
    .join(" / ");
}

module.exports = {
  buildAlchemyDrawerViewModel,
};
