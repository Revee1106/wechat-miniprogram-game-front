const store = require("../../utils/run-store");

Page({
  data: {
    run: null,
    dwellingLevel: 1,
  },

  onShow() {
    const run = store.getState().run;
    this.setData({
      run,
      dwellingLevel: run ? run.dwelling_level : 1,
    });
  },
});
