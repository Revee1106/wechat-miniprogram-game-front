# Shanhai Scroll Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the mini program UI into a coherent “Shanhai scroll” experience without changing the existing gameplay APIs.

**Architecture:** Keep the current page routing, store, and API calls intact while restructuring page WXML, shared component markup, and the global style system. Concentrate logic changes in page/component view models only where the redesign needs derived labels or state explanations.

**Tech Stack:** WeChat Mini Program (`wxml`, `wxss`, `js`), Node-based frontend tests, git

---

### Task 1: Lock the new global visual system

**Files:**
- Modify: `app.json`
- Modify: `app.wxss`
- Test: `tests/frontend/app_manifest.test.mjs`

**Step 1: Write the failing test**

Add assertions in `tests/frontend/app_manifest.test.mjs` for the corrected app title text and any navigation/window values that should change with the redesign.

**Step 2: Run test to verify it fails**

Run: `node tests/frontend/app_manifest.test.mjs`
Expected: FAIL because the new title or manifest values are not present yet.

**Step 3: Write minimal implementation**

- Fix the navigation bar title text encoding in `app.json`
- Expand `app.wxss` into a reusable theme layer with:
  - color variables via WXSS custom properties
  - shared shell, panel, pill, ribbon, ink, and status classes
  - reusable button styles for primary, secondary, ghost, and disabled states

**Step 4: Run test to verify it passes**

Run: `node tests/frontend/app_manifest.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add app.json app.wxss tests/frontend/app_manifest.test.mjs
git commit -m "feat: add shanhai global theme"
```

### Task 2: Redesign the home page as the main scroll

**Files:**
- Modify: `pages/home/home.wxml`
- Modify: `pages/home/home.wxss`
- Modify: `pages/home/home.js`
- Modify: `components/player-status-card/index.wxml`
- Modify: `components/player-status-card/index.wxss`
- Modify: `components/resource-bar/index.wxml`
- Modify: `components/resource-bar/index.wxss`
- Test: `tests/frontend/core_loop_pages.test.mjs`

**Step 1: Write the failing test**

Update `tests/frontend/core_loop_pages.test.mjs` to assert:
- the home page still renders `player-status-card` and `resource-bar`
- the home page still binds `createRun`, `advanceTime`, `openCultivation`, `openCrafting`, `openDwelling`
- the old `openSummary` entry is removed from the home page markup
- new structural classes or labels required by the redesign are present

**Step 2: Run test to verify it fails**

Run: `node tests/frontend/core_loop_pages.test.mjs`
Expected: FAIL because the old home structure still exists.

**Step 3: Write minimal implementation**

- Rebuild home page markup into:
  - hero scroll header
  - player status area
  - horizontal resource strip
  - core action block
  - three sub-scroll entry cards
- Remove the summary page entry from the living-state home page
- Add any derived copy in `pages/home/home.js` that supports the new layout without changing gameplay behavior
- Upgrade `player-status-card` and `resource-bar` styles to match the new theme

**Step 4: Run test to verify it passes**

Run: `node tests/frontend/core_loop_pages.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add pages/home/home.* components/player-status-card/* components/resource-bar/* tests/frontend/core_loop_pages.test.mjs
git commit -m "feat: redesign home scroll"
```

### Task 3: Rebuild the event experience around the story card

**Files:**
- Modify: `pages/event/event.wxml`
- Modify: `pages/event/event.wxss`
- Modify: `components/event-card/index.wxml`
- Modify: `components/event-card/index.wxss`
- Modify: `components/event-card/index.js`
- Modify: `components/choice-button-list/index.wxml`
- Modify: `components/choice-button-list/index.wxss`
- Modify: `components/choice-button-list/index.js`
- Test: `tests/frontend/core_loop_pages.test.mjs`

**Step 1: Write the failing test**

Extend `tests/frontend/core_loop_pages.test.mjs` to assert the event page still includes `event-card`, `choice-button-list`, option binding, and loading semantics while also checking for redesigned structural markers.

**Step 2: Run test to verify it fails**

Run: `node tests/frontend/core_loop_pages.test.mjs`
Expected: FAIL because the new event structure is not implemented yet.

**Step 3: Write minimal implementation**

- Convert `event-card` to a primary scroll layout with title, body, tags, and source summary
- Convert `choice-button-list` to annotated choice blocks that show:
  - option text
  - default choice note
  - resource cost note
  - unavailable reason
- Keep `option_id`, `loading`, and `handleChoice` behavior unchanged

**Step 4: Run test to verify it passes**

Run: `node tests/frontend/core_loop_pages.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add pages/event/* components/event-card/* components/choice-button-list/* tests/frontend/core_loop_pages.test.mjs
git commit -m "feat: redesign event scroll"
```

### Task 4: Refresh the support pages and death summary

**Files:**
- Modify: `pages/cultivation/cultivation.wxml`
- Modify: `pages/cultivation/cultivation.wxss`
- Modify: `pages/cultivation/cultivation.js`
- Modify: `pages/crafting/crafting.wxml`
- Modify: `pages/crafting/crafting.wxss`
- Modify: `pages/dwelling/dwelling.wxml`
- Modify: `pages/dwelling/dwelling.wxss`
- Modify: `pages/summary/summary.wxml`
- Modify: `pages/summary/summary.wxss`
- Modify: `components/breakthrough-panel/index.wxml`
- Modify: `components/breakthrough-panel/index.wxss`
- Modify: `components/dwelling-bonus-panel/index.wxml`
- Modify: `components/dwelling-bonus-panel/index.wxss`
- Modify: `components/run-result-modal/index.wxml`
- Modify: `components/run-result-modal/index.wxss`
- Test: `tests/frontend/core_loop_pages.test.mjs`

**Step 1: Write the failing test**

Update `tests/frontend/core_loop_pages.test.mjs` to keep existing summary component assertions and add checks for new structure or copy on cultivation, crafting, dwelling, and summary pages where appropriate.

**Step 2: Run test to verify it fails**

Run: `node tests/frontend/core_loop_pages.test.mjs`
Expected: FAIL until the redesigned support pages land.

**Step 3: Write minimal implementation**

- Redesign cultivation as a “breakthrough ritual” page
- Add a derived explanation string in `pages/cultivation/cultivation.js` for disabled breakthrough states
- Redesign crafting as an intentional preview page, not a blank placeholder
- Redesign dwelling as a “cave record” page
- Redesign summary into a death-only “final scroll” feel while preserving `run-result-modal` and rebirth binding

**Step 4: Run test to verify it passes**

Run: `node tests/frontend/core_loop_pages.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add pages/cultivation/* pages/crafting/* pages/dwelling/* pages/summary/* components/breakthrough-panel/* components/dwelling-bonus-panel/* components/run-result-modal/* tests/frontend/core_loop_pages.test.mjs
git commit -m "feat: redesign support scrolls"
```

### Task 5: Verify text cleanup and regressions

**Files:**
- Modify: any remaining touched WXML/WXSS/JS files with garbled Chinese copy
- Test: `tests/frontend/app_manifest.test.mjs`
- Test: `tests/frontend/core_loop_pages.test.mjs`
- Test: `tests/frontend/dev_config.test.mjs`

**Step 1: Write the failing test**

Add or refine test assertions for corrected human-readable labels where the redesign depends on visible copy, without over-coupling tests to every sentence.

**Step 2: Run test to verify it fails**

Run: `node tests/frontend/app_manifest.test.mjs`
Expected: FAIL if any required updated text is still missing.

**Step 3: Write minimal implementation**

- Sweep touched files for garbled Chinese strings
- Keep only meaningful textual assertions in tests
- Avoid adding new business logic or data dependencies

**Step 4: Run test to verify it passes**

Run:
- `node tests/frontend/app_manifest.test.mjs`
- `node tests/frontend/core_loop_pages.test.mjs`
- `node tests/frontend/dev_config.test.mjs`

Expected: PASS for all three commands

**Step 5: Commit**

```bash
git add app.json app.wxss pages components tests/frontend
git commit -m "fix: finalize shanhai redesign copy"
```
