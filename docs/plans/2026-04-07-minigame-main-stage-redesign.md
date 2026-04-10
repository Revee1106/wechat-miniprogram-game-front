# Minigame Main Stage Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the mini game main stage into a scroll-themed Canvas interface that stays close to the earlier miniprogram visual language while correctly respecting safe areas on notched and gesture-bar devices.

**Architecture:** Keep the existing `run-store` adapter, view-models, and drawer/modal behavior intact, and limit this redesign to the Canvas presentation layer plus viewport metrics. The main work happens in `src/game/core/layout.js`, `src/game/theme/tokens.js`, `src/game/ui/*`, and `src/game/screens/main-stage-screen.js`, with small tests that lock the new layout helpers and screen structure.

**Tech Stack:** WeChat Mini Game Canvas 2D, CommonJS modules in `src/game/`, Node-based frontend tests with `node` and `assert`.

---

### Task 1: Add Safe-Area Layout Metrics

**Files:**
- Modify: `E:/game/wechat-miniprogram-game-front/src/game/core/layout.js`
- Test: `E:/game/wechat-miniprogram-game-front/tests/frontend/minigame_layout.test.mjs`

**Step 1: Write the failing test**

```js
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createViewportLayout } = require("../../src/game/core/layout.js");

const layout = createViewportLayout(375, 812, {
  safeArea: { left: 0, right: 375, top: 44, bottom: 778 },
});

assert.equal(layout.safeTop, 44);
assert.equal(layout.safeBottom, 34);
assert.equal(layout.contentLeft, 24);
assert.ok(layout.footerHeight > 0);
```

**Step 2: Run test to verify it fails**

Run: `node tests/frontend/minigame_layout.test.mjs`
Expected: FAIL because `createViewportLayout` does not yet expose safe-area-aware metrics.

**Step 3: Write minimal implementation**

```js
function createViewportLayout(width, height, options = {}) {
  const safeArea = options.safeArea || null;
  const safeTop = safeArea ? Math.max(0, safeArea.top) : 0;
  const safeBottom = safeArea ? Math.max(0, height - safeArea.bottom) : 0;

  return {
    width,
    height,
    safeTop,
    safeBottom,
    contentLeft: 24,
    contentRight: width - 24,
    headerTop: safeTop + 18,
    footerHeight: 132 + safeBottom,
  };
}
```

**Step 4: Run test to verify it passes**

Run: `node tests/frontend/minigame_layout.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/frontend/minigame_layout.test.mjs src/game/core/layout.js
git commit -m "feat: add safe area layout metrics"
```

### Task 2: Expand Theme Tokens For Scroll-Style UI

**Files:**
- Modify: `E:/game/wechat-miniprogram-game-front/src/game/theme/tokens.js`
- Test: `E:/game/wechat-miniprogram-game-front/tests/frontend/minigame_layout.test.mjs`

**Step 1: Write the failing test**

```js
const { themeTokens } = require("../../src/game/theme/tokens.js");

assert.equal(themeTokens.color.paperSoft, "#f6eddc");
assert.equal(themeTokens.radius.pill, 999);
assert.ok(themeTokens.shadow.cardBlur > 0);
```

**Step 2: Run test to verify it fails**

Run: `node tests/frontend/minigame_layout.test.mjs`
Expected: FAIL because the new token fields do not exist.

**Step 3: Write minimal implementation**

```js
const themeTokens = {
  color: {
    paperSoft: "#f6eddc",
    jadeDeep: "#163530",
    bronze: "#a36d2d",
    bronzeSoft: "#c69657",
  },
  radius: {
    pill: 999,
  },
  shadow: {
    cardBlur: 18,
    cardOffsetY: 8,
  },
};
```

**Step 4: Run test to verify it passes**

Run: `node tests/frontend/minigame_layout.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/frontend/minigame_layout.test.mjs src/game/theme/tokens.js
git commit -m "feat: add scroll stage design tokens"
```

### Task 3: Add Reusable Canvas Blocks For Plaque, Scroll Card, Seal CTA, And Tag Buttons

**Files:**
- Create: `E:/game/wechat-miniprogram-game-front/src/game/ui/plaque.js`
- Create: `E:/game/wechat-miniprogram-game-front/src/game/ui/scroll-card.js`
- Create: `E:/game/wechat-miniprogram-game-front/src/game/ui/seal-button.js`
- Create: `E:/game/wechat-miniprogram-game-front/src/game/ui/tag-button.js`
- Test: `E:/game/wechat-miniprogram-game-front/tests/frontend/minigame_screen_modules.test.mjs`

**Step 1: Write the failing test**

```js
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

assert.equal(typeof require("../../src/game/ui/plaque.js").drawPlaque, "function");
assert.equal(typeof require("../../src/game/ui/scroll-card.js").drawScrollCard, "function");
assert.equal(typeof require("../../src/game/ui/seal-button.js").drawSealButton, "function");
assert.equal(typeof require("../../src/game/ui/tag-button.js").drawTagButton, "function");
```

**Step 2: Run test to verify it fails**

Run: `node tests/frontend/minigame_screen_modules.test.mjs`
Expected: FAIL because the new UI modules are missing.

**Step 3: Write minimal implementation**

```js
function drawPlaque(context, rect, content) {}
function drawScrollCard(context, rect, content) {}
function drawSealButton(context, rect, content) {}
function drawTagButton(context, rect, content) {}

module.exports = { drawPlaque };
```

Implement each module as a small focused Canvas helper that only draws shapes and text. Do not move business logic into the UI helpers.

**Step 4: Run test to verify it passes**

Run: `node tests/frontend/minigame_screen_modules.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/frontend/minigame_screen_modules.test.mjs src/game/ui/plaque.js src/game/ui/scroll-card.js src/game/ui/seal-button.js src/game/ui/tag-button.js
git commit -m "feat: add main stage canvas building blocks"
```

### Task 4: Redesign Main Stage Layout Around Header, Scroll Core, Seal CTA, And Bottom Tags

**Files:**
- Modify: `E:/game/wechat-miniprogram-game-front/src/game/screens/main-stage-screen.js`
- Modify: `E:/game/wechat-miniprogram-game-front/src/game/core/layout.js`
- Modify: `E:/game/wechat-miniprogram-game-front/src/game/theme/tokens.js`
- Test: `E:/game/wechat-miniprogram-game-front/tests/frontend/minigame_shell.test.mjs`
- Test: `E:/game/wechat-miniprogram-game-front/tests/frontend/minigame_screen_modules.test.mjs`

**Step 1: Write the failing test**

```js
const screenModule = require("../../src/game/screens/main-stage-screen.js");
assert.equal(typeof screenModule.createMainStageScreen, "function");

const source = readFileSync(
  new URL("../../src/game/screens/main-stage-screen.js", import.meta.url),
  "utf8"
);

assert.match(source, /createViewportLayout/);
assert.match(source, /drawPlaque/);
assert.match(source, /drawScrollCard/);
assert.match(source, /drawSealButton/);
assert.match(source, /drawTagButton/);
```

**Step 2: Run test to verify it fails**

Run: `node tests/frontend/minigame_screen_modules.test.mjs`
Expected: FAIL because the screen still draws flat rectangles directly.

**Step 3: Write minimal implementation**

```js
const layout = createViewportLayout(width, height, frame.systemInfo);

drawPlaque(context, plaqueRect, {
  title: stage.heroTitle,
  subtitle: stage.subtitle,
});

drawScrollCard(context, scrollRect, {
  summary: stage.topSummary,
  hint: stage.eventHint || stage.deathNotice || stage.journeyHint,
});

drawSealButton(context, primaryRect, {
  label: stage.primaryAction.label,
  disabled: uiState.busy,
});

drawTagButton(context, tagRect, {
  label: "行囊",
  active: uiState.activeDrawer === "resources",
});
```

Keep the hit-region behavior intact while replacing the old flat blocks with the new layout.

**Step 4: Run test to verify it passes**

Run: `node tests/frontend/minigame_screen_modules.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add src/game/screens/main-stage-screen.js src/game/core/layout.js src/game/theme/tokens.js tests/frontend/minigame_shell.test.mjs tests/frontend/minigame_screen_modules.test.mjs
git commit -m "feat: redesign minigame main stage layout"
```

### Task 5: Make The Main Stage Safe-Area-Aware In Runtime

**Files:**
- Modify: `E:/game/wechat-miniprogram-game-front/game.js`
- Modify: `E:/game/wechat-miniprogram-game-front/src/game/core/runtime.js`
- Modify: `E:/game/wechat-miniprogram-game-front/src/game/screens/main-stage-screen.js`
- Test: `E:/game/wechat-miniprogram-game-front/tests/frontend/minigame_shell.test.mjs`

**Step 1: Write the failing test**

```js
const shellSource = readFileSync(
  new URL("../../game.js", import.meta.url),
  "utf8"
);

assert.match(shellSource, /getSystemInfoSync/);
assert.match(shellSource, /safeArea/);
```

**Step 2: Run test to verify it fails**

Run: `node tests/frontend/minigame_shell.test.mjs`
Expected: FAIL because the runtime does not yet pass system safe-area data into the render frame.

**Step 3: Write minimal implementation**

```js
const systemInfo = typeof wx.getSystemInfoSync === "function" ? wx.getSystemInfoSync() : null;

runtime.render({
  canvas,
  context,
  width,
  height,
  systemInfo,
});
```

Ensure `frame.systemInfo.safeArea` reaches `createViewportLayout(...)` so the title and bottom tags stay clear of the notch and gesture area.

**Step 4: Run test to verify it passes**

Run: `node tests/frontend/minigame_shell.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add game.js src/game/core/runtime.js src/game/screens/main-stage-screen.js tests/frontend/minigame_shell.test.mjs
git commit -m "feat: wire safe area data into minigame runtime"
```

### Task 6: Retune Drawer And Modal Visual Connection With The New Main Stage

**Files:**
- Modify: `E:/game/wechat-miniprogram-game-front/src/game/screens/event-modal.js`
- Modify: `E:/game/wechat-miniprogram-game-front/src/game/screens/resources-drawer.js`
- Modify: `E:/game/wechat-miniprogram-game-front/src/game/screens/cultivation-drawer.js`
- Modify: `E:/game/wechat-miniprogram-game-front/src/game/screens/dwelling-drawer.js`
- Modify: `E:/game/wechat-miniprogram-game-front/src/game/screens/alchemy-drawer.js`
- Modify: `E:/game/wechat-miniprogram-game-front/src/game/screens/summary-modal.js`
- Modify: `E:/game/wechat-miniprogram-game-front/src/game/theme/tokens.js`
- Test: `E:/game/wechat-miniprogram-game-front/tests/frontend/minigame_screen_modules.test.mjs`

**Step 1: Write the failing test**

```js
const files = [
  "../../src/game/screens/event-modal.js",
  "../../src/game/screens/resources-drawer.js",
  "../../src/game/screens/cultivation-drawer.js",
  "../../src/game/screens/dwelling-drawer.js",
  "../../src/game/screens/alchemy-drawer.js",
  "../../src/game/screens/summary-modal.js",
];

for (const file of files) {
  const source = readFileSync(new URL(file, import.meta.url), "utf8");
  assert.match(source, /themeTokens/);
}
```

**Step 2: Run test to verify it fails**

Run: `node tests/frontend/minigame_screen_modules.test.mjs`
Expected: FAIL where screens still hardcode old flat colors or do not use the revised tokens.

**Step 3: Write minimal implementation**

```js
context.fillStyle = themeTokens.color.paperSoft;
context.strokeStyle = themeTokens.color.bronzeSoft;
```

Adjust the drawer and modal visuals so their header bars, paper backgrounds, and overlays feel like the same scroll-themed UI without changing business behavior.

**Step 4: Run test to verify it passes**

Run: `node tests/frontend/minigame_screen_modules.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add src/game/screens/event-modal.js src/game/screens/resources-drawer.js src/game/screens/cultivation-drawer.js src/game/screens/dwelling-drawer.js src/game/screens/alchemy-drawer.js src/game/screens/summary-modal.js src/game/theme/tokens.js tests/frontend/minigame_screen_modules.test.mjs
git commit -m "feat: align drawers and modals with scroll theme"
```

### Task 7: Verify, Update Docs, And Leave Manual DevTools Checkpoints

**Files:**
- Modify: `E:/game/wechat-miniprogram-game-front/README.md`
- Modify: `E:/game/wechat-miniprogram-game-front/docs/2026-04-02-completed-features.md`

**Step 1: Update docs**

Add a short section that the current mini game main stage now uses:

```md
- safe-area-aware title plaque
- scroll-core summary card
- seal-style primary action
- tag-style bottom navigation for drawers
```

**Step 2: Run automated verification**

Run:

```bash
node tests/frontend/minigame_layout.test.mjs
node tests/frontend/minigame_screen_modules.test.mjs
node tests/frontend/minigame_shell.test.mjs
node tests/frontend/minigame_main_stage_view_model.test.mjs
node tests/frontend/minigame_event_modal_view_model.test.mjs
node tests/frontend/minigame_drawers_view_model.test.mjs
node tests/frontend/minigame_dwelling_drawer_view_model.test.mjs
node tests/frontend/minigame_alchemy_drawer_view_model.test.mjs
node tests/frontend/minigame_summary_modal_view_model.test.mjs
node tests/frontend/core_loop_pages.test.mjs
node tests/frontend/app_manifest.test.mjs
node tests/frontend/dev_config.test.mjs
node --check game.js
```

Expected: All tests PASS and `node --check game.js` succeeds.

**Step 3: Manual DevTools verification**

Check in WeChat DevTools mini game mode:
- Title stays below the notch on iPhone-like frames.
- Bottom tag buttons stay above the gesture bar.
- Main stage is visually scroll-themed instead of flat blocks.
- The primary seal button is the strongest action on screen.
- Opening `行囊 / 修行 / 洞府 / 炼丹` still works.

**Step 4: Commit**

```bash
git add README.md docs/2026-04-02-completed-features.md
git commit -m "docs: record main stage redesign"
```
