Component({
  properties: {
    choices: {
      type: Array,
      value: [],
    },
    loading: {
      type: Boolean,
      value: false,
    },
  },
  data: {
    displayChoices: [],
  },
  observers: {
    choices(choices) {
      this.setData({
        displayChoices: normalizeChoices(choices),
      });
    },
  },
  methods: {
    handleTap(event) {
      if (this.data.loading) {
        return;
      }

      this.triggerEvent("choose", {
        optionId: event.currentTarget.dataset.optionId,
      });
    },
  },
});

function normalizeChoices(choices) {
  if (!Array.isArray(choices)) {
    return [];
  }

  return choices.map((choice) => {
    const resourceEntries = Object.entries(choice.requires_resources || {});
    return {
      ...choice,
      hasResourceRequirements: resourceEntries.length > 0,
      resourceText: resourceEntries
        .map(([name, amount]) => `${formatResourceName(name)} ${amount}`)
        .join("、"),
    };
  });
}

function formatResourceName(name) {
  const map = {
    spirit_stone: "灵石",
    herbs: "药草",
    iron_essence: "玄铁精华",
  };

  return map[name] || name;
}
