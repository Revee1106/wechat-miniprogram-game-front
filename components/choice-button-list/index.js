Component({
  properties: {
    choices: {
      type: Array,
      value: [],
    },
    choicePattern: {
      type: String,
      value: "",
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
    "choices, choicePattern"(choices, choicePattern) {
      this.setData({
        displayChoices: normalizeChoices(choices, choicePattern),
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

function normalizeChoices(choices, choicePattern) {
  if (!Array.isArray(choices)) {
    return [];
  }

  return choices.map((choice) => {
    const resourceEntries = Object.entries(choice.requires_resources || {});
    return {
      ...choice,
      displayText: choicePattern === "single_outcome" ? "完成事件" : choice.option_text,
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
