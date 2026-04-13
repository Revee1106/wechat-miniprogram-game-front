Component({
  properties: {
    event: {
      type: Object,
      value: null,
    },
  },
  data: {
    triggerSourcesText: "",
    displayTitle: "",
  },
  observers: {
    event(event) {
      this.setData({
        triggerSourcesText: formatTriggerSources(event),
        displayTitle: formatDisplayTitle(event),
      });
    },
  },
});

function formatTriggerSources(event) {
  if (!event || !Array.isArray(event.trigger_sources) || event.trigger_sources.length === 0) {
    return "无记载";
  }

  return event.trigger_sources.join(" / ");
}

function formatDisplayTitle(event) {
  if (!event) {
    return "";
  }

  return event.title_text || event.event_name || "";
}
