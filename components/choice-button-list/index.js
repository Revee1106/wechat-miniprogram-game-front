Component({
  properties: {
    choices: {
      type: Array,
      value: [],
    },
  },
  methods: {
    handleTap(event) {
      this.triggerEvent("choose", {
        choiceKey: event.currentTarget.dataset.choiceKey,
      });
    },
  },
});
