const store = require("../../utils/run-store");

Page({
  data: {
    run: null,
  },

  onShow() {
    this.setData({
      run: store.getState().run,
    });
  },
});
