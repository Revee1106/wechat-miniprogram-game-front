const { formatRealmName } = require("../utils/display-text");

function getPrimaryAction(snapshot) {
  const run = snapshot && snapshot.run ? snapshot.run : null;
  if (!run) {
    return {
      action: "create-run",
      label: "启程",
    };
  }

  if (run.character && run.character.is_dead) {
    return {
      action: "open-summary",
      label: "查看终卷",
    };
  }

  if (run.active_battle) {
    return {
      action: "open-battle",
      label: "战斗中",
    };
  }

  if (run.current_event) {
    return {
      action: "open-event",
      label: "处理事件",
    };
  }

  return {
    action: "advance-time",
    label: "推进时间",
  };
}

function buildMainStageViewModel(snapshot) {
  const run = snapshot && snapshot.run ? snapshot.run : null;
  const playerProfile = snapshot && snapshot.playerProfile ? snapshot.playerProfile : null;

  if (!run) {
    return {
      mode: "boot",
      heroTitle: "问道长生",
      subtitle: "自此启程，再入尘寰。",
      topSummary: null,
      logEntries: [
        {
          id: "boot-log",
          title: "初入尘寰",
          detailLines: ["尚未启程，先开始这一世。"],
        },
      ],
      primaryAction: getPrimaryAction(snapshot),
    };
  }

  const topSummary = {
    round: Number(run.round_index) || 0,
    realm: run.character
      ? formatRealmName(run.character.realm, run.character.realm_display_name)
      : "",
    cultivationExp: (run.character && Number(run.character.cultivation_exp)) || 0,
    spiritStone: (run.resources && Number(run.resources.spirit_stone)) || 0,
    lifespan: (run.character && Number(run.character.lifespan_current)) || 0,
    hpCurrent: (run.character && Number(run.character.hp_current)) || 0,
    hpMax: (run.character && Number(run.character.hp_max)) || 0,
    attack: (run.character && Number(run.character.attack)) || 0,
    defense: (run.character && Number(run.character.defense)) || 0,
    speed: (run.character && Number(run.character.speed)) || 0,
    rebirthCount: (playerProfile && Number(playerProfile.total_rebirth_count)) || 0,
  };
  const equipmentSlots = buildEquipmentSlots(run);

  const baseViewModel = {
    heroTitle: "问道长生",
    topSummary,
    equipmentSlots,
    logEntries: buildLogEntries(snapshot, run),
    primaryAction: getPrimaryAction(snapshot),
  };

  if (run.character && run.character.is_dead) {
    return {
      ...baseViewModel,
      mode: "summary",
      deathNotice: "此世已尽",
    };
  }

  if (run.active_battle) {
    return {
      ...baseViewModel,
      mode: "battle",
    };
  }

  if (run.current_event) {
    return {
      ...baseViewModel,
      mode: "event",
      eventHint: {
        id: run.current_event.event_id,
        title: run.current_event.event_name,
        body: run.current_event.body_text || "",
        optionCount: Array.isArray(run.current_event.options) ? run.current_event.options.length : 0,
      },
    };
  }

  return {
    ...baseViewModel,
    mode: "journey",
    journeyHint: "继续推进时间，等待新的遭遇。",
  };
}

function buildLogEntries(snapshot, run) {
  const eventHistory = snapshot && Array.isArray(snapshot.eventHistory) ? snapshot.eventHistory : [];
  if (eventHistory.length > 0) {
    return eventHistory.slice(0, 2).map((item) => ({
      id: item.historyKey,
      title: item.eventName || "异闻",
      detailLines: Array.isArray(item.impactLines) && item.impactLines.length > 0
        ? item.impactLines.slice(0, 3)
        : [item.summary || "已结算"],
      highlightedLines: Array.isArray(item.highlightedLines) ? item.highlightedLines : [],
    }));
  }

  const dwellingHistory = snapshot && Array.isArray(snapshot.dwellingSettlementHistory)
    ? snapshot.dwellingSettlementHistory
    : [];
  if (dwellingHistory.length > 0) {
    return dwellingHistory.slice(0, 2).map((item) => ({
      id: item.historyKey,
      title: `洞府月结 ${item.summary || ""}`.trim(),
      detailLines: Array.isArray(item.impactLines) && item.impactLines.length > 0
        ? item.impactLines.slice(0, 2)
        : ["尚无新的洞府变化"],
    }));
  }

  if (run && run.current_event) {
    return [
      {
        id: run.current_event.event_id || "current-event",
        title: run.current_event.event_name || "异闻将至",
        detailLines: [run.current_event.body_text || "有新的事件等待处理。"],
      },
    ];
  }

  return [
    {
      id: "journey-log",
      title: "行程",
      detailLines: ["继续推进时间，等待新的遭遇。"],
    },
  ];
}

function buildEquipmentSlots(run) {
  const equippedItems = ((run && run.character && run.character.equipped_items) || {});
  const inventory = Array.isArray(run && run.equipment_inventory) ? run.equipment_inventory : [];
  const byId = Object.fromEntries(inventory.map((item) => [item.item_id, item]));

  return [
    { slot: "weapon", label: "武器" },
    { slot: "armor", label: "防具" },
    { slot: "accessory", label: "饰品" },
    { slot: "artifact", label: "法宝" },
  ].map((slotDef) => {
    const item = byId[equippedItems[slotDef.slot]] || null;
    return {
      ...slotDef,
      item,
      title: item ? item.display_name || item.item_id : "空",
      detail: item ? formatEquipmentStats(item) : "",
    };
  });
}

function formatEquipmentStats(item) {
  const parts = [];
  if (Number(item.attack || 0)) {
    parts.push(`攻+${Number(item.attack)}`);
  }
  if (Number(item.defense || 0)) {
    parts.push(`防+${Number(item.defense)}`);
  }
  if (Number(item.speed || 0)) {
    parts.push(`速+${Number(item.speed)}`);
  }
  if (Number(item.hp_max || 0)) {
    parts.push(`血+${Number(item.hp_max)}`);
  }
  return parts.join(" ") || "无属性";
}

module.exports = {
  buildMainStageViewModel,
  getPrimaryAction,
};
