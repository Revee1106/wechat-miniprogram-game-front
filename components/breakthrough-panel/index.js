Component({
  properties: {
    player: {
      type: Object,
      value: null,
    },
    resources: {
      type: Object,
      value: null,
    },
    canBreakthrough: {
      type: Boolean,
      value: false,
    },
    hint: {
      type: String,
      value: "",
    },
    breakthroughTargetExp: {
      type: Number,
      value: 0,
    },
    breakthroughTargetSpiritStone: {
      type: Number,
      value: 0,
    },
  },
  methods: {
    submitBreakthrough() {
      this.triggerEvent("breakthrough");
    },
  },
});
