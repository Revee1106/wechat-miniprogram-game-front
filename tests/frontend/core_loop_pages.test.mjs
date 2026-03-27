import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const homeWxml = readFileSync("pages/home/home.wxml", "utf8");
const eventWxml = readFileSync("pages/event/event.wxml", "utf8");
const summaryWxml = readFileSync("pages/summary/summary.wxml", "utf8");
const homeJs = readFileSync("pages/home/home.js", "utf8");
const eventPageJs = readFileSync("pages/event/event.js", "utf8");
const summaryJs = readFileSync("pages/summary/summary.js", "utf8");
const runStoreSource = readFileSync("utils/run-store.js", "utf8");
const eventCardJs = readFileSync("components/event-card/index.js", "utf8");
const eventCardWxml = readFileSync("components/event-card/index.wxml", "utf8");
const choiceButtonListJs = readFileSync("components/choice-button-list/index.js", "utf8");
const choiceButtonListWxml = readFileSync("components/choice-button-list/index.wxml", "utf8");
const inspectionSheetJs = readFileSync("components/inspection-sheet/index.js", "utf8");
const inspectionSheetWxml = readFileSync("components/inspection-sheet/index.wxml", "utf8");
const runResultModalWxml = readFileSync("components/run-result-modal/index.wxml", "utf8");
const storeSource = readFileSync("utils/run-store.js", "utf8");
const apiSource = readFileSync("utils/api.js", "utf8");
const componentDir = "components";
const forbiddenSelectorPattern = /(^|\n)\s*view\s*\{/;

assert.match(homeWxml, /bindtap="createRun"/);
assert.match(homeWxml, /启程/);
assert.doesNotMatch(homeWxml, /继续启程/);
assert.doesNotMatch(homeWxml, /bindtap="advanceTime"/);
assert.doesNotMatch(homeWxml, /player-status-card/);
assert.doesNotMatch(homeWxml, /resource-bar/);
assert.doesNotMatch(homeWxml, /entry-card/);
assert.match(homeJs, /store\.createRun/);
assert.match(homeJs, /wx\.navigateTo\(\{ url: "\/pages\/event\/event" \}\)/);

assert.match(eventWxml, /inspection-sheet/);
assert.match(eventWxml, /bind:change="handleSectionChange"/);
assert.match(eventWxml, /bind:choose="handleChoice"/);
assert.match(eventWxml, /choicePattern="{{currentEvent\.choice_pattern}}"/);
assert.match(eventWxml, /bindtap="advanceTime"/);
assert.match(eventWxml, /已行 {{elapsedText}}/);
assert.match(eventWxml, /剩余寿元 {{lifespanText}}/);
assert.match(eventWxml, /事件结果/);
assert.match(eventWxml, /eventHistory/);
assert.match(eventWxml, /wx:key="historyKey"/);
assert.doesNotMatch(eventWxml, /wx:key="summary"/);
assert.doesNotMatch(eventWxml, /bindtap="openInspection"/);
assert.doesNotMatch(eventWxml, /player-status-card/);
assert.doesNotMatch(eventWxml, /resource-bar/);
assert.match(eventPageJs, /store\.advanceTime\(\)/);
assert.match(eventPageJs, /store\.resolveEvent\(event\.detail\.optionId\)/);
assert.match(eventPageJs, /store\.refreshRun\(\)/);
assert.match(eventPageJs, /store\.clearRun\(\)/);
assert.match(eventPageJs, /wx\.reLaunch\(\{ url: "\/pages\/home\/home" \}\)/);
assert.match(eventPageJs, /activeSection: "player"/);
assert.match(eventPageJs, /elapsedText:/);
assert.match(eventPageJs, /lifespanText:/);
assert.match(eventPageJs, /eventHistory:/);
assert.match(eventPageJs, /BREAKTHROUGH_TARGET_EXP = 100/);

assert.match(summaryWxml, /run-result-modal/);
assert.match(summaryWxml, /bind:confirm="handleRebirth"/);
assert.match(summaryWxml, /转生再启/);
assert.match(summaryWxml, /此世终卷/);
assert.doesNotMatch(summaryWxml, /player-status-card/);
assert.doesNotMatch(summaryWxml, /resource-bar/);
assert.match(summaryJs, /store\.rebirth\(\)/);
assert.match(summaryJs, /wx\.reLaunch\(\{ url: "\/pages\/home\/home" \}\)/);

assert.match(storeSource, /createRun/);
assert.match(storeSource, /clearRun/);
assert.match(storeSource, /advanceTime/);
assert.match(storeSource, /resolveEvent\(optionId\)/);
assert.match(apiSource, /\/api\/run\/create/);
assert.match(apiSource, /\/api\/run\/advance/);
assert.match(apiSource, /option_id: optionId/);

assert.match(eventCardJs, /formatTriggerSources/);
assert.match(eventCardWxml, /event\.title_text \|\| event\.event_name/);
assert.match(eventCardWxml, /event\.body_text/);
assert.match(eventCardWxml, /event\.event_type/);
assert.match(eventCardWxml, /event\.outcome_type/);
assert.match(eventCardWxml, /event\.risk_level/);
assert.match(eventCardWxml, /triggerSourcesText/);
assert.match(eventCardWxml, /event\.status/);

assert.match(choiceButtonListJs, /optionId: event\.currentTarget\.dataset\.optionId/);
assert.match(choiceButtonListJs, /normalizeChoices/);
assert.match(choiceButtonListJs, /choicePattern/);
assert.match(choiceButtonListJs, /完成事件/);
assert.match(choiceButtonListJs, /resourceText/);
assert.match(choiceButtonListWxml, /wx:key="option_id"/);
assert.match(choiceButtonListWxml, /data-option-id="{{item\.option_id}}"/);
assert.match(choiceButtonListWxml, /item\.displayText/);
assert.doesNotMatch(choiceButtonListWxml, /item\.is_default/);
assert.match(choiceButtonListWxml, /item\.resourceText/);
assert.match(choiceButtonListWxml, /item\.is_available/);
assert.match(choiceButtonListWxml, /item\.disabled_reason/);
assert.match(choiceButtonListWxml, /disabled="{{loading \|\| !item\.is_available}}"/);

assert.match(inspectionSheetJs, /breakthroughTargetExp/);
assert.match(inspectionSheetWxml, /activeSection === 'player'/);
assert.match(inspectionSheetWxml, /activeSection === 'resources'/);
assert.match(inspectionSheetWxml, /activeSection === 'cultivation'/);
assert.match(inspectionSheetWxml, /activeSection === 'dwelling'/);
assert.match(inspectionSheetWxml, /命牌/);
assert.match(inspectionSheetWxml, /行囊/);
assert.match(inspectionSheetWxml, /修炼/);
assert.match(inspectionSheetWxml, /洞府/);
assert.match(inspectionSheetWxml, /player\.cultivation_exp \+ " \/ " \+ breakthroughTargetExp/);
assert.match(runStoreSource, /eventHistory/);
assert.match(runStoreSource, /pushEventHistory/);
assert.match(runStoreSource, /historyKey/);
assert.match(runStoreSource, /buildImpactLines/);
assert.match(runResultModalWxml, /actionText/);

for (const entry of readdirSync(componentDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) {
    continue;
  }

  const wxssPath = path.join(componentDir, entry.name, "index.wxss");
  const wxssSource = readFileSync(wxssPath, "utf8");
  assert.doesNotMatch(
    wxssSource,
    forbiddenSelectorPattern,
    `${wxssPath} should not use tag-name selectors in component WXSS`
  );
}
