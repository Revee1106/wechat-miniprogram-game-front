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
      value: "Confirm",
    },
  },
  methods: {
    handleConfirm() {
      this.triggerEvent("confirm");
    },
  },
});
