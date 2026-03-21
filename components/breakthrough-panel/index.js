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
  },
  methods: {
    submitBreakthrough() {
      this.triggerEvent("breakthrough");
    },
  },
});
