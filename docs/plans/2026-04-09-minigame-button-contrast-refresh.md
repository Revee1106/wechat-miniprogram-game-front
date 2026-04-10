# Minigame Button Contrast Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refresh the minigame’s dark green action buttons into high-contrast white buttons with dark borders and text, while keeping event time-cost text red and more readable.

**Architecture:** Keep the canvas screen structure unchanged and update shared theme tokens plus the small set of drawing modules that currently render jade action buttons. Use source-based frontend tests to lock the new visual contract before code changes.

**Tech Stack:** WeChat minigame frontend, CommonJS modules, canvas rendering, Node assert-based frontend tests

---

### Task 1: Lock the new contrast-button contract with tests

**Files:**
- Modify: `E:/game/wechat-miniprogram-game-front/tests/frontend/minigame_screen_modules.test.mjs`
- Modify: `E:/game/wechat-miniprogram-game-front/tests/frontend/core_loop_pages.test.mjs`

**Step 1: Write the failing test**

Add assertions that:

- themed action screens reference new contrast-button tokens
- the event modal still renders time-cost text
- old jade/cream action treatment is no longer the required source contract for those buttons

**Step 2: Run test to verify it fails**

Run: `node --test tests/frontend/minigame_screen_modules.test.mjs tests/frontend/core_loop_pages.test.mjs`

Expected: FAIL because the current sources still rely on the old dark-fill action treatment.

**Step 3: Write minimal implementation**

Update token usage and drawing modules to satisfy the new assertions.

**Step 4: Run test to verify it passes**

Run: `node --test tests/frontend/minigame_screen_modules.test.mjs tests/frontend/core_loop_pages.test.mjs`

Expected: PASS

**Step 5: Commit**

```bash
git add tests/frontend/minigame_screen_modules.test.mjs tests/frontend/core_loop_pages.test.mjs src/game/theme/tokens.js src/game/ui/seal-button.js src/game/screens/event-modal.js src/game/screens/resources-drawer.js src/game/screens/cultivation-drawer.js src/game/screens/dwelling-drawer.js src/game/screens/summary-modal.js src/game/screens/alchemy-drawer.js
git commit -m "feat: improve minigame button contrast"
```

### Task 2: Introduce contrast-first button tokens

**Files:**
- Modify: `E:/game/wechat-miniprogram-game-front/src/game/theme/tokens.js`

**Step 1: Write the failing test**

Use the Task 1 source assertions as the failing spec for new button token names.

**Step 2: Run test to verify it fails**

Run: `node --test tests/frontend/minigame_screen_modules.test.mjs tests/frontend/core_loop_pages.test.mjs`

Expected: FAIL before token definitions exist.

**Step 3: Write minimal implementation**

Add explicit contrast-button tokens such as:

- surface
- border
- text
- disabled surface
- disabled border
- disabled text
- danger/accent text for time cost

**Step 4: Run test to verify it passes**

Run: `node --test tests/frontend/minigame_screen_modules.test.mjs tests/frontend/core_loop_pages.test.mjs`

Expected: PASS or progress toward PASS

**Step 5: Commit**

```bash
git add src/game/theme/tokens.js
git commit -m "feat: add contrast button theme tokens"
```

### Task 3: Update shared and direct-draw action surfaces

**Files:**
- Modify: `E:/game/wechat-miniprogram-game-front/src/game/ui/seal-button.js`
- Modify: `E:/game/wechat-miniprogram-game-front/src/game/screens/event-modal.js`
- Modify: `E:/game/wechat-miniprogram-game-front/src/game/screens/resources-drawer.js`
- Modify: `E:/game/wechat-miniprogram-game-front/src/game/screens/cultivation-drawer.js`
- Modify: `E:/game/wechat-miniprogram-game-front/src/game/screens/dwelling-drawer.js`
- Modify: `E:/game/wechat-miniprogram-game-front/src/game/screens/summary-modal.js`
- Modify: `E:/game/wechat-miniprogram-game-front/src/game/screens/alchemy-drawer.js`
- Modify: `E:/game/wechat-miniprogram-game-front/src/game/screens/confirm-modal.js`

**Step 1: Write the failing test**

Keep the Task 1 source assertions active.

**Step 2: Run test to verify it fails**

Run: `node --test tests/frontend/minigame_screen_modules.test.mjs tests/frontend/core_loop_pages.test.mjs`

Expected: FAIL until all targeted screens use the new token set.

**Step 3: Write minimal implementation**

Implement:

- white button/card fills
- dark borders
- dark label text
- muted disabled variants
- stronger red event time-cost caption

**Step 4: Run test to verify it passes**

Run: `node --test tests/frontend/minigame_screen_modules.test.mjs tests/frontend/core_loop_pages.test.mjs`

Expected: PASS

**Step 5: Commit**

```bash
git add src/game/ui/seal-button.js src/game/screens/event-modal.js src/game/screens/resources-drawer.js src/game/screens/cultivation-drawer.js src/game/screens/dwelling-drawer.js src/game/screens/summary-modal.js src/game/screens/alchemy-drawer.js src/game/screens/confirm-modal.js
git commit -m "feat: restyle minigame action buttons for readability"
```

### Task 4: Run broader frontend verification

**Files:**
- Test: `E:/game/wechat-miniprogram-game-front/tests/frontend/minigame_screen_modules.test.mjs`
- Test: `E:/game/wechat-miniprogram-game-front/tests/frontend/core_loop_pages.test.mjs`
- Test: `E:/game/wechat-miniprogram-game-front/tests/frontend/minigame_event_modal_view_model.test.mjs`
- Test: `E:/game/wechat-miniprogram-game-front/tests/frontend/minigame_drawers_view_model.test.mjs`
- Test: `E:/game/wechat-miniprogram-game-front/tests/frontend/minigame_dwelling_drawer_view_model.test.mjs`
- Test: `E:/game/wechat-miniprogram-game-front/tests/frontend/minigame_alchemy_drawer_view_model.test.mjs`
- Test: `E:/game/wechat-miniprogram-game-front/tests/frontend/minigame_summary_modal_view_model.test.mjs`

**Step 1: Run targeted verification**

Run: `node --test tests/frontend/minigame_screen_modules.test.mjs tests/frontend/core_loop_pages.test.mjs tests/frontend/minigame_event_modal_view_model.test.mjs tests/frontend/minigame_drawers_view_model.test.mjs tests/frontend/minigame_dwelling_drawer_view_model.test.mjs tests/frontend/minigame_alchemy_drawer_view_model.test.mjs tests/frontend/minigame_summary_modal_view_model.test.mjs`

Expected: PASS

**Step 2: Inspect diff**

Run: `git diff -- src/game/theme/tokens.js src/game/ui/seal-button.js src/game/screens/event-modal.js src/game/screens/resources-drawer.js src/game/screens/cultivation-drawer.js src/game/screens/dwelling-drawer.js src/game/screens/summary-modal.js src/game/screens/alchemy-drawer.js src/game/screens/confirm-modal.js tests/frontend/minigame_screen_modules.test.mjs tests/frontend/core_loop_pages.test.mjs`

Expected: only readability-focused visual token and drawing changes.

**Step 3: Commit**

```bash
git add src/game/theme/tokens.js src/game/ui/seal-button.js src/game/screens/event-modal.js src/game/screens/resources-drawer.js src/game/screens/cultivation-drawer.js src/game/screens/dwelling-drawer.js src/game/screens/summary-modal.js src/game/screens/alchemy-drawer.js src/game/screens/confirm-modal.js tests/frontend/minigame_screen_modules.test.mjs tests/frontend/core_loop_pages.test.mjs docs/plans/2026-04-09-minigame-button-contrast-refresh-design.md docs/plans/2026-04-09-minigame-button-contrast-refresh.md
git commit -m "feat: improve minigame UI contrast"
```
