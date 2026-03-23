Component({
  properties: {
    player: {
      type: Object,
      value: null,
    },
  },
  data: {
    lifespanText: "",
  },
  observers: {
    player(player) {
      this.setData({
        lifespanText: formatLifespan(player),
      });
    },
  },
});

function formatLifespan(player) {
  if (!player) {
    return "";
  }

  return `${formatMonths(player.lifespan_current)} / ${formatMonths(player.lifespan_max)}`;
}

function formatMonths(totalMonths) {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (months === 0) {
    return `${years}年`;
  }

  return `${years}年${months}个月`;
}
