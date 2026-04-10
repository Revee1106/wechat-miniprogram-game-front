const { formatRealmName } = require("../utils/display-text");

function buildSummaryModalViewModel(snapshot) {
  const run = snapshot && snapshot.run ? snapshot.run : null;
  if (!run || !run.character || run.character.is_dead !== true) {
    return null;
  }

  const profile = snapshot && snapshot.playerProfile ? snapshot.playerProfile : null;

  return {
    title: "此世终卷",
    summary: run.result_summary || "寿元已尽，此世落幕。",
    realm: formatRealmName(run.character.realm, run.character.realm_display_name),
    spiritStone: Number((run.resources || {}).spirit_stone || 0),
    rebirthCount: Number((profile || {}).total_rebirth_count || 0),
    rebirthPoints: Number((profile || {}).rebirth_points || 0),
    primaryAction: {
      action: "rebirth",
      label: "转生再启",
    },
  };
}

module.exports = {
  buildSummaryModalViewModel,
};
