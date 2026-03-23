Component({
  properties: {
    visible: {
      type: Boolean,
      value: false,
    },
    title: {
      type: String,
      value: "",
    },
    message: {
      type: String,
      value: "",
    },
    actionText: {
      type: String,
      value: "确认",
    },
  },
  methods: {
    handleConfirm() {
      this.triggerEvent("confirm");
    },
  },
});
