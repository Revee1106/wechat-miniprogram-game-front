import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const homeWxml = readFileSync("pages/home/home.wxml", "utf8");
const eventWxml = readFileSync("pages/event/event.wxml", "utf8");
const summaryWxml = readFileSync("pages/summary/summary.wxml", "utf8");
const eventPageJs = readFileSync("pages/event/event.js", "utf8");
const resourceBarWxml = readFileSync("components/resource-bar/index.wxml", "utf8");
const playerStatusCardJs = readFileSync("components/player-status-card/index.js", "utf8");
const eventCardJs = readFileSync("components/event-card/index.js", "utf8");
const eventCardWxml = readFileSync("components/event-card/index.wxml", "utf8");
const choiceButtonListJs = readFileSync("components/choice-button-list/index.js", "utf8");
const choiceButtonListWxml = readFileSync("components/choice-button-list/index.wxml", "utf8");
const storeSource = readFileSync("utils/run-store.js", "utf8");
const apiSource = readFileSync("utils/api.js", "utf8");
const componentDir = "components";
const forbiddenSelectorPattern = /(^|\n)\s*view\s*\{/;

assert.match(homeWxml, /player-status-card/);
assert.match(homeWxml, /resource-bar/);
assert.match(homeWxml, /bindtap="createRun"/);
assert.match(homeWxml, /bindtap="advanceTime"/);
assert.match(homeWxml, /bindtap="openCultivation"/);
assert.match(homeWxml, /bindtap="openCrafting"/);
assert.match(homeWxml, /bindtap="openDwelling"/);
assert.match(homeWxml, /bindtap="openSummary"/);
assert.match(eventWxml, /event-card/);
assert.match(eventWxml, /choice-button-list/);
assert.match(eventWxml, /choices="{{currentEvent\.options \|\| \[\]}}"/);
assert.match(eventWxml, /loading="{{loading}}"/);
assert.match(summaryWxml, /run-result-modal/);
assert.match(summaryWxml, /bind:confirm="handleRebirth"/);
assert.match(resourceBarWxml, /resources\.spirit_stone/);
assert.match(resourceBarWxml, /resources\.herbs/);
assert.match(resourceBarWxml, /resources\.iron_essence/);
assert.match(playerStatusCardJs, /formatLifespan/);
assert.match(storeSource, /createRun/);
assert.match(storeSource, /resolveEvent/);
assert.match(storeSource, /resolveEvent\(optionId\)/);
assert.match(apiSource, /\/api\/run\/create/);
assert.match(apiSource, /\/api\/run\/advance/);
assert.match(apiSource, /option_id: optionId/);
assert.match(eventPageJs, /currentEvent: snapshot\.run \? snapshot\.run\.current_event : null/);
assert.match(eventPageJs, /store\.resolveEvent\(event\.detail\.optionId\)/);
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
assert.match(choiceButtonListJs, /resourceText/);
assert.match(choiceButtonListWxml, /wx:key="option_id"/);
assert.match(choiceButtonListWxml, /data-option-id="{{item\.option_id}}"/);
assert.match(choiceButtonListWxml, /item\.option_text/);
assert.match(choiceButtonListWxml, /item\.is_default/);
assert.match(choiceButtonListWxml, /item\.resourceText/);
assert.match(choiceButtonListWxml, /item\.is_available/);
assert.match(choiceButtonListWxml, /item\.disabled_reason/);
assert.match(choiceButtonListWxml, /disabled="{{loading \|\| !item\.is_available}}"/);

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
