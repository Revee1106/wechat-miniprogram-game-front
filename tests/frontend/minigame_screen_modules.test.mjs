import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const themeSource = readFileSync(
  new URL("../../src/game/theme/tokens.js", import.meta.url),
  "utf8"
);

assert.equal(typeof require("../../src/game/ui/scroll-card.js").drawScrollCard, "function");
assert.equal(typeof require("../../src/game/ui/seal-button.js").drawSealButton, "function");
assert.equal(typeof require("../../src/game/ui/tag-button.js").drawTagButton, "function");
assert.equal(typeof require("../../src/game/screens/confirm-modal.js").drawConfirmModal, "function");
assert.equal(typeof require("../../src/game/screens/battle-modal.js").drawBattleModal, "function");

const mainStageSource = readFileSync(
  new URL("../../src/game/screens/main-stage-screen.js", import.meta.url),
  "utf8"
);

assert.match(mainStageSource, /createViewportLayout/);
assert.match(mainStageSource, /drawScrollCard/);
assert.match(mainStageSource, /drawSealButton/);
assert.match(mainStageSource, /drawTagButton/);
assert.match(mainStageSource, /drawConfirmModal/);
assert.match(mainStageSource, /buildBattleModalViewModel/);
assert.match(mainStageSource, /drawBattleModal/);
assert.match(mainStageSource, /气血/);
assert.match(mainStageSource, /攻击/);
assert.match(mainStageSource, /防御/);
assert.match(mainStageSource, /速度/);
assert.match(mainStageSource, /confirmDialog/);
assert.match(mainStageSource, /setTimeout/);
assert.match(mainStageSource, /clearTimeout/);
assert.match(mainStageSource, /toastTimer/);
assert.match(mainStageSource, /if \(uiState\.toast\)/);
assert.match(mainStageSource, /uiState\.toast = ""/);
assert.match(mainStageSource, /handleTouchEnd/);
assert.doesNotMatch(mainStageSource, /drawPlaque/);
assert.match(mainStageSource, /selectedResourceKey/);
assert.match(themeSource, /buttonSurface/);
assert.match(themeSource, /buttonBorder/);
assert.match(themeSource, /buttonText/);
assert.match(themeSource, /buttonDisabledSurface/);
assert.match(themeSource, /buttonDisabledBorder/);
assert.match(themeSource, /buttonDisabledText/);
assert.match(themeSource, /timeCostText/);

const toastIndex = mainStageSource.indexOf("if (uiState.toast)");
const dwellingIndex = mainStageSource.indexOf("if (dwellingDrawer)");
assert.ok(toastIndex > dwellingIndex, "toast should render after drawers so it stays visible");
assert.doesNotMatch(mainStageSource, /primaryButtonY - 54/);

const themedScreenFiles = [
  "../../src/game/screens/battle-modal.js",
  "../../src/game/screens/event-modal.js",
  "../../src/game/screens/resources-drawer.js",
  "../../src/game/screens/cultivation-drawer.js",
  "../../src/game/screens/dwelling-drawer.js",
  "../../src/game/screens/alchemy-drawer.js",
  "../../src/game/screens/summary-modal.js",
  "../../src/game/screens/confirm-modal.js",
];

for (const file of themedScreenFiles) {
  const source = readFileSync(new URL(file, import.meta.url), "utf8");
  assert.match(source, /themeTokens/);
}

const sealButtonSource = readFileSync(
  new URL("../../src/game/ui/seal-button.js", import.meta.url),
  "utf8"
);
assert.match(sealButtonSource, /buttonSurface/);
assert.match(sealButtonSource, /buttonBorder/);
assert.match(sealButtonSource, /buttonText/);
assert.doesNotMatch(sealButtonSource, /creamText/);

const scrollCardSource = readFileSync(
  new URL("../../src/game/ui/scroll-card.js", import.meta.url),
  "utf8"
);
assert.match(scrollCardSource, /rowGap/);
assert.match(scrollCardSource, /rowCount/);

const tagButtonSource = readFileSync(
  new URL("../../src/game/ui/tag-button.js", import.meta.url),
  "utf8"
);
assert.match(tagButtonSource, /buttonSurface/);
assert.match(tagButtonSource, /buttonBorder/);
assert.match(tagButtonSource, /buttonText/);
assert.doesNotMatch(tagButtonSource, /creamText/);

const resourcesDrawerSource = readFileSync(
  new URL("../../src/game/screens/resources-drawer.js", import.meta.url),
  "utf8"
);

assert.match(resourcesDrawerSource, /selectedResourceKey/);
assert.match(resourcesDrawerSource, /onSelectResource/);
assert.match(resourcesDrawerSource, /Math\.ceil/);
assert.doesNotMatch(resourcesDrawerSource, /const detailTop = drawerY \+ 176/);

const dwellingDrawerSource = readFileSync(
  new URL("../../src/game/screens/dwelling-drawer.js", import.meta.url),
  "utf8"
);

assert.match(dwellingDrawerSource, /summaryStats/);
assert.match(dwellingDrawerSource, /productionSummaryItems/);
assert.match(dwellingDrawerSource, /index % 2/);
assert.match(dwellingDrawerSource, /isStalled/);
assert.match(dwellingDrawerSource, /drawerY \+ 48/);
assert.match(dwellingDrawerSource, /rect\.x \+ rect\.width - 14/);
assert.match(dwellingDrawerSource, /#b14a38/);
