const { formatResourceName } = require("../utils/display-text");

function buildAlchemyDrawerViewModel(snapshot) {
  const run = snapshot && snapshot.run ? snapshot.run : null;
  const alchemyState = run ? run.alchemy_state || {} : {};
  const spiritSpringWaterAmount = getResourceStackAmount(run, "spirit_spring_water");

  const recipeCards = (alchemyState.available_recipes || []).map((recipe) => ({
    id: recipe.recipe_id,
    title: recipe.display_name,
    description: recipe.description || "",
    canStart: recipe.can_start === true,
    ingredientsText: buildIngredientsText(recipe.ingredients || {}),
    action: {
      action: "start-alchemy",
      label: "开炉",
      recipeId: recipe.recipe_id,
    },
    springAction: {
      action: "start-alchemy-with-spring",
      label: "借灵泉",
      recipeId: recipe.recipe_id,
    },
  }));

  const inventoryCards = (alchemyState.inventory || []).map((item) => ({
    id: `${item.item_id}-${item.quality}`,
    title: `${item.display_name} / ${item.quality}`,
    amount: Number(item.amount) || 0,
    effectSummary: item.effect_summary || "",
    consumeAction: {
      action: "consume-item",
      label: "服用",
      itemId: item.item_id,
      quality: item.quality,
    },
  }));

  return {
    title: "炼丹",
    masteryTitle: alchemyState.mastery_title || "丹道未入门",
    masteryExp: Number(alchemyState.mastery_exp || 0),
    spiritSpringWaterAmount,
    recipeCards,
    inventoryCards,
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

module.exports = {
  buildAlchemyDrawerViewModel,
};
