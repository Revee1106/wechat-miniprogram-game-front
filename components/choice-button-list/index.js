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
        .map(([name, amount]) => `${name}:${amount}`)
        .join(", "),
    };
  });
}
