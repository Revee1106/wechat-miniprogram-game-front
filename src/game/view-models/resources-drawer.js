const RESOURCE_DEFS = [
  {
    key: "spirit_stone",
    sourceKeys: ["spirit_stone"],
    label: "灵石",
    getAmount(run) {
      return Number(((run && run.resources) || {}).spirit_stone) || 0;
    },
    buildActions() {
      return buildActionSet("convert-spirit-stone", "转化");
    },
  },
  {
    key: "herb",
    sourceKeys: ["herbs"],
    label: "药草",
    getAmount(run) {
      return Number(((run && run.resources) || {}).herbs) || 0;
    },
    buildActions() {
      return buildActionSet("sell-resource", "出售");
    },
  },
  {
    key: "iron_essence",
    sourceKeys: ["iron_essence"],
    label: "玄铁精华",
    getAmount(run) {
      return Number(((run && run.resources) || {}).iron_essence) || 0;
    },
    buildActions() {
      return buildActionSet("sell-resource", "出售");
    },
  },
  {
    key: "ore",
    sourceKeys: ["ore"],
    label: "灵矿",
    getAmount(run) {
      return Number(((run && run.resources) || {}).ore) || 0;
    },
    buildActions() {
      return buildActionSet("sell-resource", "出售");
    },
  },
  {
    key: "beast_material",
    sourceKeys: ["beast_material"],
    label: "兽材",
    getAmount(run) {
      return Number(((run && run.resources) || {}).beast_material) || 0;
    },
    buildActions() {
      return buildActionSet("sell-resource", "出售");
    },
  },
  {
    key: "pill",
    sourceKeys: ["pill"],
    label: "丹药",
    getAmount(run) {
      return Number(((run && run.resources) || {}).pill) || 0;
    },
    buildActions() {
      return buildActionSet("sell-resource", "出售");
    },
  },
  {
    key: "craft_material",
    sourceKeys: ["craft_material"],
    label: "杂材",
    getAmount(run) {
      return Number(((run && run.resources) || {}).craft_material) || 0;
    },
    buildActions() {
      return buildActionSet("sell-resource", "出售");
    },
  },
  {
    key: "basic_herb",
    sourceKeys: ["basic_herb"],
    label: "灵植",
    getAmount(run) {
      return getResourceStackAmount(run, "basic_herb");
    },
    buildActions() {
      return buildActionSet("sell-resource", "出售");
    },
  },
  {
    key: "basic_ore",
    sourceKeys: ["basic_ore"],
    label: "灵矿石",
    getAmount(run) {
      return getResourceStackAmount(run, "basic_ore");
    },
    buildActions() {
      return buildActionSet("sell-resource", "出售");
    },
  },
  {
    key: "spirit_spring_water",
    sourceKeys: ["spirit_spring_water"],
    label: "灵泉水",
    getAmount(run) {
      return getResourceStackAmount(run, "spirit_spring_water");
    },
    buildActions() {
      return buildActionSet("sell-resource", "出售");
    },
  },
];

function buildResourcesDrawerViewModel(snapshot) {
  const run = snapshot && snapshot.run ? snapshot.run : null;
  const resources = run ? run.resources || {} : {};
  const stackAmounts = getResourceStackAmounts(run);

  const definedItems = RESOURCE_DEFS.map((definition) => ({
    key: definition.key,
    label: definition.label,
    amount: definition.getAmount(run),
    actions: definition.buildActions(),
  })).filter((item) => item.amount > 0);

  const knownResourceKeys = new Set(
    RESOURCE_DEFS.flatMap((definition) => definition.sourceKeys || [definition.key])
  );

  const extraResourceItems = Object.keys(resources)
    .filter((key) => !knownResourceKeys.has(key))
    .map((key) => ({
      key,
      label: key,
      amount: Number(resources[key]) || 0,
      actions: buildActionSet("sell-resource", "出售"),
    }))
    .filter((item) => item.amount > 0);

  const extraStackItems = Object.keys(stackAmounts)
    .filter((key) => !knownResourceKeys.has(key))
    .map((key) => ({
      key,
      label: key,
      amount: stackAmounts[key],
      actions: buildActionSet("sell-resource", "出售"),
    }))
    .filter((item) => item.amount > 0);

  return {
    title: "行囊",
    items: [...definedItems, ...extraResourceItems, ...extraStackItems],
  };
}

function buildActionSet(action, verb) {
  return [
    { key: `${action}-one`, action, amountMode: "one", label: `${verb}一份` },
    { key: `${action}-all`, action, amountMode: "all", label: `全部${verb}` },
    { key: `${action}-custom`, action, amountMode: "custom", label: `输入数量${verb}` },
  ];
}

function getResourceStackAmounts(run) {
  return Object.fromEntries(
    (((run && run.resource_stacks) || []).map((item) => [
      item.resource_key,
      Number(item.amount) || 0,
    ]))
  );
}

function getResourceStackAmount(run, resourceKey) {
  return getResourceStackAmounts(run)[resourceKey] || 0;
}

module.exports = {
  buildResourcesDrawerViewModel,
};
