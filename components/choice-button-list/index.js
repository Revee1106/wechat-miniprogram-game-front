const {
  formatResourceName,
  localizePlayerFacingText,
} = require("../../src/game/utils/display-text.js");

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
    "choices, choicePattern, loading"(choices, choicePattern, loading) {
      this.setData({
        displayChoices: normalizeChoices(choices, choicePattern, loading),
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

function normalizeChoices(choices, choicePattern, loading) {
  if (!Array.isArray(choices)) {
    return [];
  }

  return choices.map((choice) => {
    const resourceEntries = Object.entries(choice.requires_resources || {});
    return {
      ...choice,
      displayText: choicePattern === "single_outcome" ? "完成事件" : choice.option_text,
      buttonClass: choice.is_available ? "secondary-button" : "ghost-button",
      isDisabled: Boolean(loading || !choice.is_available),
      showDisabledReason: Boolean(!choice.is_available && choice.disabled_reason),
      disabledReason: localizePlayerFacingText(choice.disabled_reason || ""),
      hasResourceRequirements: resourceEntries.length > 0,
      resourceText: resourceEntries
        .map(([name, amount]) => `${formatResourceName(name, "")} ${amount}`)
        .join("、"),
    };
  });
}
