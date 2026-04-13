Component({
  properties: {
    facility: {
      type: Object,
      value: null,
    },
  },
  data: {
    maintenanceSpiritStoneText: "0",
    herbYieldText: "0",
    oreYieldText: "0",
    cultivationGainText: "0",
    nextUpgradeSpiritStoneText: "0",
  },
  observers: {
    facility(facility) {
      this.setData({
        maintenanceSpiritStoneText: formatNestedNumber(facility, ["maintenance_cost", "spirit_stone"]),
        herbYieldText: formatNestedNumber(facility, ["monthly_resource_yields", "herb"]),
        oreYieldText: formatNestedNumber(facility, ["monthly_resource_yields", "ore"]),
        cultivationGainText: formatNestedNumber(facility, ["monthly_cultivation_exp_gain"]),
        nextUpgradeSpiritStoneText: formatNestedNumber(facility, ["next_upgrade_cost", "spirit_stone"]),
      });
    },
  },
});

function formatNestedNumber(value, path) {
  let current = value;

  for (const key of path) {
    current = current && typeof current === "object" ? current[key] : null;
  }

  return `${Number(current || 0)}`;
}
