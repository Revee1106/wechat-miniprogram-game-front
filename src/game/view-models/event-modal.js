const { localizePlayerFacingText } = require("../utils/display-text.js");

function buildEventModalViewModel(snapshot) {
  const event = snapshot && snapshot.run ? snapshot.run.current_event : null;
  if (!event) {
    return null;
  }

  const options = Array.isArray(event.options)
    ? event.options.map((option) => ({
        optionId: option.option_id,
        title: option.title_text || option.option_text || option.option_id,
        timeCostText:
          Number(option.time_cost_months) > 0
            ? `额外耗时 ${Number(option.time_cost_months)}个月`
            : "",
        disabled: option.is_available === false,
        disabledReason: localizePlayerFacingText(option.disabled_reason || ""),
      }))
    : [];

  return {
    title: event.event_name || event.title_text || "异闻",
    body: event.body_text || event.event_description || "",
    options,
  };
}

module.exports = {
  buildEventModalViewModel,
};
