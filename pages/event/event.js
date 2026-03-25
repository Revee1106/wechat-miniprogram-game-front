const store = require("../../utils/run-store");

const BREAKTHROUGH_TARGET_EXP = 100;

Page({
  data: {
    run: null,
    currentEvent: null,
    player: null,
    resources: null,
    dwellingLevel: 1,
    canBreakthrough: false,
    breakthroughHint: "",
    breakthroughTargetExp: BREAKTHROUGH_TARGET_EXP,
    journeySummary: "",
    eventHistory: [],
    elapsedText: "",
    lifespanText: "",
    activeSection: "player",
    error: "",
    loading: false,
  },

  onShow() {
    this.syncState();
  },

  syncState() {
    const snapshot = store.getState();
    const run = snapshot.run;

    if (run && run.character && run.character.is_dead) {
      wx.reLaunch({ url: "/pages/summary/summary" });
      return;
    }

    const canBreakthrough = Boolean(
      run &&
        !run.character.is_dead &&
        run.character.cultivation_exp >= BREAKTHROUGH_TARGET_EXP &&
        run.resources.spirit_stone >= 50
    );

    this.setData({
      run,
      currentEvent: run ? run.current_event : null,
      player: run ? run.character : null,
      resources: run ? run.resources : null,
      dwellingLevel: run ? run.dwelling_level || 1 : 1,
      canBreakthrough,
      breakthroughHint: buildBreakthroughHint(run, canBreakthrough),
      breakthroughTargetExp: BREAKTHROUGH_TARGET_EXP,
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

function buildBreakthroughHint(run, canBreakthrough) {
  if (!run) {
    return "命卷未启，暂无可修之身。";
  }

  if (run.character.is_dead) {
    return "此身已尽，无法再行破境。";
  }

  if (canBreakthrough) {
    return "修为与灵石已备，可以尝试破境。";
  }

  if (run.character.cultivation_exp < BREAKTHROUGH_TARGET_EXP) {
    return "修为未满，还需继续推演。";
  }

  if (run.resources.spirit_stone < 50) {
    return "灵石不足，尚不能支撑破境。";
  }

  return "时机未至，暂且收束心神。";
}

function formatMonths(totalMonths) {
  const safeMonths = Math.max(0, Number(totalMonths) || 0);
  const years = Math.floor(safeMonths / 12);
  const months = safeMonths % 12;
  return `${years}年${months}个月`;
}
