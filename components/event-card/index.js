Component({
  properties: {
    event: {
      type: Object,
      value: null,
    },
  },
  data: {
    triggerSourcesText: "",
  },
  observers: {
    event(event) {
      this.setData({
        triggerSourcesText: formatTriggerSources(event),
      });
    },
  },
});

function formatTriggerSources(event) {
  if (!event || !Array.isArray(event.trigger_sources) || event.trigger_sources.length === 0) {
    return "";
  }

  return event.trigger_sources.join(" / ");
}
