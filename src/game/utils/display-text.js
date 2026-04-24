const ERROR_CODE_MESSAGES = {
  "core.time.dead_character_cannot_advance": "寿元已尽，无法再推进时间。",
  "core.time.resolve_event_before_advance": "尚有事件未处理，需先完成当前事件。",
  "core.time.not_enough_spirit_stones": "灵石不足，无法推进时间。",
  "core.run.not_found": "当前没有进行中的修仙历程，请先启程。",
  "core.breakthrough.dead_character_cannot_breakthrough": "寿元已尽，无法再尝试突破。",
  "core.breakthrough.already_at_maximum_realm": "当前已达最高境界。",
  "core.breakthrough.not_enough_cultivation_exp": "修为不足，尚不能突破。",
  "core.breakthrough.not_enough_spirit_stones": "灵石不足，尚不能突破。",
  "core.dwelling.facility_already_built": "该设施已经建成。",
  "core.dwelling.facility_not_built": "该设施尚未建造。",
  "core.dwelling.facility_already_at_max_level": "该设施已达当前最高等级。",
  "core.dwelling.unknown_facility": "未找到对应洞府设施。",
  "core.dwelling.not_enough_resources": "资源不足，无法执行洞府操作。",
  "core.resource_sale.invalid_amount": "出售数量必须为正整数。",
  "core.resource_sale.resource_cannot_be_sold": "该资源当前不可出售。",
  "core.resource_sale.not_enough_resources": "资源不足，无法出售。",
  "core.resource_conversion.invalid_amount": "转换数量必须为正整数。",
  "core.resource_conversion.not_enough_spirit_stone": "灵石不足，无法转化。",
  "core.realm.unknown": "未找到当前境界配置。",
};

const LEGACY_ERROR_PATTERNS = [
  [/not enough spirit stones to advance time/i, "灵石不足，无法推进时间。"],
  [/dead characters cannot advance time/i, "寿元已尽，无法再推进时间。"],
  [/resolve the current event before advancing time/i, "尚有事件未处理，需先完成当前事件。"],
  [/run .* not found/i, "当前没有进行中的修仙历程，请先启程。"],
  [/no active run/i, "当前没有进行中的修仙历程，请先启程。"],
  [/dead characters cannot breakthrough/i, "寿元已尽，无法再尝试突破。"],
  [/already at maximum realm/i, "当前已达最高境界。"],
  [/not enough cultivation exp to breakthrough/i, "修为不足，尚不能突破。"],
  [/not enough spirit stones to breakthrough/i, "灵石不足，尚不能突破。"],
  [/facility '.*' is already built/i, "该设施已经建成。"],
  [/facility '.*' is not built/i, "该设施尚未建造。"],
  [/facility '.*' is already at max level/i, "该设施已达当前最高等级。"],
  [/unknown dwelling facility/i, "未找到对应洞府设施。"],
  [/not enough resources for dwelling action/i, "资源不足，无法执行洞府操作。"],
  [/sale amount must be a positive integer/i, "出售数量必须为正整数。"],
  [/resource '.*' cannot be sold/i, "该资源当前不可出售。"],
  [/not enough resources to sell/i, "资源不足，无法出售。"],
  [/conversion amount must be a positive integer/i, "转换数量必须为正整数。"],
  [/not enough spirit stone to convert/i, "灵石不足，无法转化。"],
  [/there is no pending event to resolve/i, "当前没有可处理的事件。"],
  [/option '.*' is not available/i, "该选项当前不可用。"],
  [/option is unavailable/i, "该选项当前不可用。"],
  [/there is already an active alchemy job/i, "当前已有炼丹事务在进行。"],
  [/recipe cannot be started/i, "当前丹方无法开炉。"],
  [/not enough resources for alchemy/i, "资源不足，无法开始炼丹。"],
  [/battle is already in progress/i, "当前战斗还在进行中，请先继续战斗。"],
  [/there is no active battle/i, "当前没有正在进行的战斗。"],
  [/battle has already finished/i, "当前战斗已经结束。"],
];

const RESOURCE_LABELS = {
  spirit_stone: "灵石",
  herb: "药草",
  herbs: "药草",
  ore: "灵矿",
  basic_herb: "灵植",
  basic_ore: "灵矿石",
  spirit_spring_water: "灵泉水",
  basic_breakthrough_material: "普通晋级材料",
  rare_material: "稀有材料",
  craft_material: "杂材",
  iron_essence: "玄铁精华",
  beast_material: "兽材",
  pill: "丹药",
};

const FACILITY_LABELS = {
  spirit_field: "灵田",
  spirit_spring: "灵泉",
  mine_cave: "矿洞",
  alchemy_room: "炼丹房",
  spirit_gathering_array: "聚灵阵",
};

const REALM_LABELS = {
  qi_refining_early: "炼气初期",
  qi_refining_mid: "炼气中期",
  qi_refining_late: "炼气后期",
  qi_refining_peak: "炼气大圆满",
  foundation_early: "筑基初期",
  foundation_mid: "筑基中期",
  foundation_late: "筑基后期",
  foundation_peak: "筑基大圆满",
  golden_core_early: "金丹初期",
  golden_core_mid: "金丹中期",
  golden_core_late: "金丹后期",
  golden_core_peak: "金丹大圆满",
  nascent_soul_early: "元婴初期",
  nascent_soul_mid: "元婴中期",
  nascent_soul_late: "元婴后期",
  nascent_soul_peak: "元婴大圆满",
};

function localizeErrorCode(code, params = {}, fallbackMessage = "") {
  if (ERROR_CODE_MESSAGES[code]) {
    return ERROR_CODE_MESSAGES[code];
  }
  return localizeLegacyErrorMessage(fallbackMessage, params);
}

function localizeLegacyErrorMessage(message, params = {}) {
  const rawMessage = String(message || "").trim();
  if (!rawMessage) {
    return "操作失败，请稍后重试。";
  }

  for (const [pattern, localizedMessage] of LEGACY_ERROR_PATTERNS) {
    if (pattern.test(rawMessage)) {
      return localizedMessage;
    }
  }

  if (params && typeof params === "object") {
    if (params.facility_id && FACILITY_LABELS[params.facility_id]) {
      return rawMessage.replace(String(params.facility_id), FACILITY_LABELS[params.facility_id]);
    }
    if (params.realm && REALM_LABELS[params.realm]) {
      return rawMessage.replace(String(params.realm), REALM_LABELS[params.realm]);
    }
    if (params.resource_key && RESOURCE_LABELS[params.resource_key]) {
      return rawMessage.replace(String(params.resource_key), RESOURCE_LABELS[params.resource_key]);
    }
  }

  return rawMessage;
}

function createLocalizedApiError(payload, statusCode) {
  const detail = payload && payload.detail;
  if (detail && typeof detail === "object" && !Array.isArray(detail)) {
    const code = typeof detail.code === "string" ? detail.code : "";
    const params = detail.params && typeof detail.params === "object" ? detail.params : {};
    const message = localizeErrorCode(code, params, typeof detail.message === "string" ? detail.message : "");
    const error = new Error(message);
    error.code = code;
    error.params = params;
    error.rawMessage = typeof detail.message === "string" ? detail.message : "";
    return error;
  }

  if (typeof detail === "string" && detail) {
    return new Error(localizeLegacyErrorMessage(detail));
  }

  return new Error(`请求失败，状态码：${statusCode}`);
}

function isMissingRunError(error) {
  const code = String((error && error.code) || "");
  if (code === "core.run.not_found") {
    return true;
  }
  const message = String((error && error.message) || "");
  return /run .* not found/i.test(message) || /No active run/i.test(message) || /当前没有进行中的修仙历程/.test(message);
}

function formatRealmName(realmKey, displayName) {
  const display = String(displayName || "").trim();
  if (display) {
    return display;
  }
  return REALM_LABELS[realmKey] || String(realmKey || "");
}

function formatFacilityName(facilityId, displayName) {
  const display = String(displayName || "").trim();
  if (display) {
    return display;
  }
  return FACILITY_LABELS[facilityId] || String(facilityId || "");
}

function formatResourceName(resourceKey, displayName) {
  const display = String(displayName || "").trim();
  if (display) {
    return display;
  }
  return RESOURCE_LABELS[resourceKey] || "资源";
}

function localizePlayerFacingText(message) {
  const rawMessage = String(message || "").trim();
  if (!rawMessage) {
    return "";
  }

  const resourceMatch = rawMessage.match(/^requires resources\s+(.+)$/i);
  if (resourceMatch) {
    const details = resourceMatch[1]
      .split(/\s*,\s*/)
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [resourceKey, amount] = entry.split(":");
        const label = formatResourceName(String(resourceKey || "").trim(), "");
        const value = Number(amount);
        return Number.isFinite(value) && value > 0 ? `${label} ${value}` : label;
      })
      .join("、");
    return details ? `资源不足：${details}` : "资源不足";
  }

  if (/^requires statuses\b/i.test(rawMessage)) {
    return "条件不足：需要状态条件";
  }
  if (/^requires techniques\b/i.test(rawMessage)) {
    return "条件不足：需要功法条件";
  }
  if (/^requires equipment_tags\b/i.test(rawMessage)) {
    return "条件不足：需要装备条件";
  }

  return localizeLegacyErrorMessage(rawMessage);
}

module.exports = {
  createLocalizedApiError,
  formatFacilityName,
  formatRealmName,
  formatResourceName,
  isMissingRunError,
  localizeErrorCode,
  localizeLegacyErrorMessage,
  localizePlayerFacingText,
};
