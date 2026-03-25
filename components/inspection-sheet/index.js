Component({
  properties: {
    activeSection: {
      type: String,
      value: "player",
    },
    player: {
      type: Object,
      value: null,
    },
    resources: {
      type: Object,
      value: null,
    },
    dwellingLevel: {
      type: Number,
      value: 1,
    },
    canBreakthrough: {
      type: Boolean,
      value: false,
    },
    breakthroughHint: {
      type: String,
      value: "",
    },
    breakthroughTargetExp: {
      type: Number,
      value: 100,
    },
  },
  methods: {
    handleSectionTap(event) {
      this.triggerEvent("change", {
        section: event.currentTarget.dataset.section,
      });
    },
  },
});
