const { formatResourceName } = require("../utils/display-text");

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
    conversionRateText: "1 灵石 = 3 修为",
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
    label: "玄品精华",
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
    label: "妖兽材料",
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
    label: "炼器材料",
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
    label: "基础药草",
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
    label: "基础矿材",
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
  const alchemyInventoryItems = buildAlchemyInventoryItems(run);
  const equipmentInventoryItems = buildEquipmentInventoryItems(run);

  const definedItems = RESOURCE_DEFS.flatMap((definition) => {
    if (definition.key === "pill" && alchemyInventoryItems.length > 0) {
      return alchemyInventoryItems;
    }

    return [
      {
        key: definition.key,
        label: resolveResourceLabel(definition, run),
        amount: definition.getAmount(run),
        actions: definition.buildActions(),
        conversionRateText: definition.conversionRateText || "",
      },
    ];
  }).filter((item) => item.amount > 0);

  const knownResourceKeys = new Set(
    RESOURCE_DEFS.flatMap((definition) => definition.sourceKeys || [definition.key])
  );

  const extraResourceItems = Object.keys(resources)
    .filter((key) => !knownResourceKeys.has(key))
    .map((key) => ({
      key,
      label: formatResourceName(key, "", run),
      amount: Number(resources[key]) || 0,
      actions: buildActionSet("sell-resource", "出售"),
    }))
    .filter((item) => item.amount > 0);

  const extraStackItems = Object.keys(stackAmounts)
    .filter((key) => !knownResourceKeys.has(key))
    .map((key) => ({
      key,
      label: formatResourceName(key, "", run),
      amount: stackAmounts[key],
      actions: buildActionSet("sell-resource", "出售"),
    }))
    .filter((item) => item.amount > 0);

  return {
    title: "行囊",
    items: [...definedItems, ...equipmentInventoryItems, ...extraResourceItems, ...extraStackItems],
  };
}

function resolveResourceLabel(definition, run) {
  const configuredName = formatResourceName(definition.key, "", run);
  return configuredName === "资源" ? definition.label : configuredName;
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

function buildAlchemyInventoryItems(run) {
  const inventory =
    run && run.alchemy_state && Array.isArray(run.alchemy_state.inventory) ? run.alchemy_state.inventory : [];

  return inventory
    .map((item) => ({
      key: `alchemy_item:${item.item_id}:${item.quality}`,
      label: item.display_name || item.item_id,
      tagLabel: `${formatQuality(item)} · ${item.display_name || item.item_id}`,
      quality: item.quality,
      qualityLabel: formatQuality(item),
      qualityTone: getQualityTone(item),
      amount: Number(item.amount) || 0,
      detailText: `${formatQuality(item)}，${buildAlchemyItemEffectText(item)}`,
      actions: [
        {
          key: `consume-alchemy-item:${item.item_id}:${item.quality}`,
          action: "consume-alchemy-item",
          amountMode: "one",
          label: "服用一枚",
          itemId: item.item_id,
          quality: item.quality,
        },
        {
          key: `consume-alchemy-item:${item.item_id}:${item.quality}:all`,
          action: "consume-alchemy-item",
          amountMode: "all",
          label: "服用全部",
          itemId: item.item_id,
          quality: item.quality,
        },
        {
          key: `consume-alchemy-item:${item.item_id}:${item.quality}:custom`,
          action: "consume-alchemy-item",
          amountMode: "custom",
          label: "输入数量服用",
          itemId: item.item_id,
          quality: item.quality,
        },
      ],
    }))
    .filter((item) => item.amount > 0);
}

function buildEquipmentInventoryItems(run) {
  const inventory = run && Array.isArray(run.equipment_inventory) ? run.equipment_inventory : [];

  return inventory.map((item) => {
    const equipped = item.is_equipped === true;
    return {
      key: `equipment:${item.item_id}`,
      label: item.display_name || item.item_id,
      tagLabel: `${item.slot_label || "装备"} · ${item.display_name || item.item_id}`,
      amount: 1,
      isEquipment: true,
      isEquipped: equipped,
      qualityTone: equipped ? "equipped" : "equipment",
      detailText: buildEquipmentDetailText(item),
      actions: [
        {
          key: `${equipped ? "unequip" : "equip"}:${item.item_id}`,
          action: equipped ? "unequip-item" : "equip-item",
          amountMode: "one",
          label: equipped ? "卸下" : "装备",
          itemId: item.item_id,
        },
      ],
    };
  });
}

function buildEquipmentDetailText(item) {
  const parts = [`${item.slot_label || "装备"}`];
  if (Number(item.attack || 0)) {
    parts.push(`攻击 +${Number(item.attack)}`);
  }
  if (Number(item.defense || 0)) {
    parts.push(`防御 +${Number(item.defense)}`);
  }
  if (Number(item.speed || 0)) {
    parts.push(`速度 +${Number(item.speed)}`);
  }
  if (Number(item.hp_max || 0)) {
    parts.push(`气血上限 +${Number(item.hp_max)}`);
  }
  if (item.is_equipped) {
    parts.push("已穿戴");
  }
  return parts.join("，");
}

function formatQuality(qualityOrItem) {
  if (qualityOrItem && typeof qualityOrItem === "object" && qualityOrItem.quality_label) {
    return qualityOrItem.quality_label;
  }
  const quality = qualityOrItem && typeof qualityOrItem === "object" ? qualityOrItem.quality : qualityOrItem;
  return {
    low: "下品",
    mid: "中品",
    high: "上品",
    supreme: "极品",
  }[quality] || String(quality || "未知品质");
}

function buildAlchemyItemEffectText(item) {
  const value = Math.trunc(Number(item.effect_value || 0) * getQualityMultiplier(item));
  if (item.effect_type === "cultivation_exp") {
    return `服用后提升 ${value} 点修为`;
  }
  if (item.effect_type === "hp_restore") {
    return `服用后恢复 ${value} 点气血`;
  }
  if (item.effect_type === "lifespan_restore") {
    return `服用后恢复 ${value} 个月寿元`;
  }
  if (item.effect_type === "breakthrough_bonus") {
    return `服用后提高 ${value} 点突破辅助值`;
  }
  return item.effect_summary || "可服用丹药";
}

function getQualityMultiplier(quality) {
  if (quality && typeof quality === "object" && Number(quality.effect_multiplier) > 0) {
    return Number(quality.effect_multiplier);
  }
  const qualityKey = quality && typeof quality === "object" ? quality.quality : quality;
  return {
    low: 1,
    mid: 1.25,
    high: 1.5,
    supreme: 2,
  }[qualityKey] || 1;
}

function getQualityTone(item) {
  const color = String(item.quality_color || "").trim();
  if (color) {
    return color;
  }
  return {
    low: "white",
    mid: "green",
    high: "blue",
    supreme: "purple",
  }[item.quality] || "white";
}

module.exports = {
  buildResourcesDrawerViewModel,
};
