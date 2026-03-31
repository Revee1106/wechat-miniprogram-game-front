const store = require("../../utils/run-store");
const {
  buildBreakthroughHint,
  canAttemptBreakthrough,
  getBreakthroughRequirements,
} = require("../../utils/breakthrough");

Page({
  data: {
    run: null,
    currentEvent: null,
    player: null,
    resources: null,
    dwellingLevel: 1,
    canBreakthrough: false,
    breakthroughHint: "",
    breakthroughTargetExp: 0,
    breakthroughTargetSpiritStone: 0,
    journeySummary: "",
    eventHistory: [],
    elapsedText: "",
    lifespanText: "",
    activeSection: "player",
    error: "",
    loading: false,
  },

  async onShow() {
    const snapshot = store.getState();
    if (snapshot.run) {
      try {
        await store.refreshRun();
      } catch (error) {
        if (isMissingRunError(error)) {
          store.clearRun();
          this.syncState();
          wx.reLaunch({ url: "/pages/home/home" });
          return;
        }
        this.setData({ error: error.message });
      }
    }
    this.syncState();
  },

  syncState() {
    const snapshot = store.getState();
    const run = snapshot.run;

    if (run && run.character && run.character.is_dead) {
      wx.reLaunch({ url: "/pages/summary/summary" });
      return;
    }

    const requirements = getBreakthroughRequirements(run);
    const canBreakthrough = canAttemptBreakthrough(run);

    this.setData({
      run,
      currentEvent: run ? run.current_event : null,
      player: run ? run.character : null,
      resources: run ? run.resources : null,
      dwellingLevel: run ? run.dwelling_level || 1 : 1,
      canBreakthrough,
      breakthroughHint: buildBreakthroughHint(run, canBreakthrough),
      breakthroughTargetExp: requirements.requiredCultivationExp,
      breakthroughTargetSpiritStone: requirements.requiredSpiritStone,
      journeySummary: buildJourneySummary(run),
      eventHistory: snapshot.eventHistory || [],
      elapsedText: run ? formatMonths(run.round_index || 0) : "0年0个月",
      lifespanText:
        run && run.character ? formatMonths(run.character.lifespan_current) : "0年0个月",
      error: snapshot.error,
    });
  },

  async advanceTime() {
    if (!this.data.run) {
      wx.reLaunch({ url: "/pages/home/home" });
      return;
    }

    this.setData({ loading: true, error: "" });

    try {
      const snapshot = await store.advanceTime();
      this.syncState();

      if (snapshot.run && snapshot.run.character && snapshot.run.character.is_dead) {
        wx.reLaunch({ url: "/pages/summary/summary" });
      }
    } catch (error) {
      if (isMissingRunError(error)) {
        store.clearRun();
        this.syncState();
        wx.reLaunch({ url: "/pages/home/home" });
        return;
      }
      this.setData({ error: error.message });
    } finally {
      this.setData({ loading: false });
    }
  },

  async handleChoice(event) {
    this.setData({ loading: true, error: "" });

    try {
      const snapshot = await store.resolveEvent(event.detail.optionId);
      this.syncState();

      if (snapshot.run && snapshot.run.character && snapshot.run.character.is_dead) {
        wx.reLaunch({ url: "/pages/summary/summary" });
      }
    } catch (error) {
      if (isMissingRunError(error)) {
        store.clearRun();
        this.syncState();
        wx.reLaunch({ url: "/pages/home/home" });
        return;
      }
      this.setData({ error: error.message });
    } finally {
      this.setData({ loading: false });
    }
  },

  async attemptBreakthrough() {
    if (!this.data.run) {
      wx.reLaunch({ url: "/pages/home/home" });
      return;
    }

    this.setData({ loading: true, error: "" });

    try {
      const result = await store.breakthrough();
      this.syncState();
      wx.showToast({
        title: result.breakthrough.success ? "破境成功" : "破境未成",
        icon: "none",
      });
    } catch (error) {
      if (isMissingRunError(error)) {
        store.clearRun();
        this.syncState();
        wx.reLaunch({ url: "/pages/home/home" });
        return;
      }
      this.setData({ error: error.message });
    } finally {
      this.setData({ loading: false });
    }
  },

  handleSectionChange(event) {
    this.setData({ activeSection: event.detail.section });
  },
});

function buildJourneySummary(run) {
  if (!run) {
    return "命卷未立，尚无可推演之程。";
  }

  if (run.character && run.character.is_dead) {
    return "此身寿尽，请转往终卷。";
  }

  if (run.current_event) {
    return "异闻已现，先定去留，再续行程。";
  }

  return "此刻只需继续推进时间。";
}

function formatMonths(totalMonths) {
  const safeMonths = Math.max(0, Number(totalMonths) || 0);
  const years = Math.floor(safeMonths / 12);
  const months = safeMonths % 12;
  return `${years}年${months}个月`;
}

function isMissingRunError(error) {
  const message = String((error && error.message) || "");
  return /run .* not found/i.test(message) || /No active run/i.test(message);
}
