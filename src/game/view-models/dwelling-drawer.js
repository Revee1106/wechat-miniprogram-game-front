const PRODUCTION_LABELS = {
  basic_herb: "灵植",
  herb: "灵植",
  basic_ore: "灵矿",
  ore: "灵矿",
  spirit_stone: "灵石",
  spirit_spring_water: "灵泉水",
};

function buildDwellingDrawerViewModel(snapshot) {
  const run = snapshot && snapshot.run ? snapshot.run : null;
  const facilities = run ? run.dwelling_facilities || [] : [];
  const settlement = run ? run.dwelling_last_settlement : null;
  const currentSpiritStone = run ? Number((run.resources || {}).spirit_stone || 0) : 0;

  const totalMaintenanceSpiritStone = facilities.reduce(
    (sum, facility) => sum + Number(((facility.maintenance_cost || {}).spirit_stone || 0)),
    0
  );

  const productionTotals = aggregateProductionTotals(facilities);

  const facilityCards = facilities.map((facility) => {
    const resourceYields = facility.monthly_resource_yields || {};
    const nextUpgradeCost = facility.next_upgrade_cost || {};
    const nextUpgradeCostSpiritStone = Number(nextUpgradeCost.spirit_stone || 0);
    const isBuilt = Number(facility.level) > 0;
    const maxLevel = Number(facility.max_level) || 0;
    const isMaxLevel = (maxLevel > 0 && Number(facility.level) >= maxLevel) || facility.status === "max_level";
    const isStalled = facility.status === "stalled";
    const action = isBuilt
      ? isMaxLevel
        ? { action: "upgrade-facility", label: "已满级", facilityId: facility.facility_id, disabled: true }
        : { action: "upgrade-facility", label: "升级", facilityId: facility.facility_id, disabled: false }
      : { action: "build-facility", label: "建造", facilityId: facility.facility_id, disabled: false };

    return {
      id: facility.facility_id,
      title: facility.display_name,
      level: Number(facility.level) || 0,
      maxLevel,
      isMaxLevel,
      isStalled,
      status: facility.status || "unbuilt",
      maintenanceText: `${Number((facility.maintenance_cost || {}).spirit_stone || 0)} 灵石`,
      yieldText: buildFacilityYieldText(resourceYields, facility.monthly_cultivation_exp_gain),
      nextUpgradeText: isMaxLevel ? "已满级" : `${nextUpgradeCostSpiritStone} 灵石`,
      nextUpgradeCostSpiritStone,
      canAfford: !isMaxLevel && currentSpiritStone >= nextUpgradeCostSpiritStone,
      action,
    };
  });

  return {
    title: "洞府",
    dwellingLevel: run ? Number(run.dwelling_level) || 1 : 1,
    currentSpiritStone,
    summaryStats: {
      currentSpiritStone: { label: "当前灵石", value: currentSpiritStone, unit: "" },
      totalMaintenanceSpiritStone: { label: "每月维护", value: totalMaintenanceSpiritStone, unit: "灵石" },
    },
    productionSummaryItems: buildProductionSummaryItems(productionTotals),
    facilityCards,
    settlementSummary: settlement
      ? `支出 ${Number((settlement.total_maintenance_paid || {}).spirit_stone || 0)} 灵石，收入 ${Number(
          (settlement.total_resource_gains || {}).spirit_stone || 0
        )} 灵石`
      : "尚无月结记录",
    stallWarning: "",
  };
}

function aggregateProductionTotals(facilities) {
  const totals = {};

  facilities.forEach((facility) => {
    const resourceYields = facility.monthly_resource_yields || {};
    Object.keys(resourceYields).forEach((key) => {
      const amount = Number(resourceYields[key] || 0);
      if (amount === 0) {
        return;
      }

      const normalizedKey = normalizeProductionKey(key);
      totals[normalizedKey] = (Number(totals[normalizedKey]) || 0) + amount;
    });

    totals.cultivation = (Number(totals.cultivation) || 0) + Number(facility.monthly_cultivation_exp_gain || 0);
  });

  return totals;
}

function buildProductionSummaryItems(totals) {
  const orderedKeys = ["basic_herb", "basic_ore", "spirit_stone", "spirit_spring_water", "cultivation"];
  const items = orderedKeys
    .filter((key) => key === "cultivation" || Number(totals[key] || 0) > 0)
    .map((key) => ({
      key,
      label: key === "cultivation" ? "修为" : PRODUCTION_LABELS[key] || key,
      value: Number(totals[key] || 0),
    }));

  return items.length ? items : [{ key: "cultivation", label: "修为", value: 0 }];
}

function buildFacilityYieldText(resourceYields, cultivationExpGain) {
  return [
    `灵植 ${Number(resourceYields.basic_herb || resourceYields.herb || 0)}`,
    `灵矿 ${Number(resourceYields.basic_ore || resourceYields.ore || 0)}`,
    `灵石 ${Number(resourceYields.spirit_stone || 0)}`,
    `修为 ${Number(cultivationExpGain || 0)}`,
  ].join(" / ");
}

function normalizeProductionKey(key) {
  if (key === "herb") {
    return "basic_herb";
  }

  if (key === "ore") {
    return "basic_ore";
  }

  return key;
}

module.exports = {
  buildDwellingDrawerViewModel,
};
