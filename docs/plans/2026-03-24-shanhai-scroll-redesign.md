# Shanhai Linear Flow Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert the mini program into a non-scrolling, single-focus flow with a cover page, a travel page, an event page, a death summary page, and an on-demand info sheet.

**Architecture:** Keep the existing store and API contract, but simplify page responsibilities so the main flow only presents one action or one decision area per screen. Move character, inventory, cultivation, and dwelling details behind a unified front-end info sheet component that can be opened on demand.

**Tech Stack:** WeChat Mini Program (`wxml`, `wxss`, `js`), Node-based frontend tests, git

---

### Task 1: Update manifest and tests for the linear flow

**Files:**
- Modify: `tests/frontend/app_manifest.test.mjs`
- Modify: `tests/frontend/core_loop_pages.test.mjs`
- Modify: `app.json` if route order or titles need adjustment

**Step 1: Write the failing test**

Adjust the frontend tests so they assert the new UX direction:

- `home` is a cover page with a single primary action
- the persistent summary entry is gone
- the main flow has a lightweight inspection entry instead of dense overview cards
- summary still exists as a route, but only as the death ending page

**Step 2: Run test to verify it fails**

Run: `node tests/frontend/core_loop_pages.test.mjs`
Expected: FAIL because the current page markup still reflects the denser redesign.

**Step 3: Write minimal implementation**

- Update any route title or manifest text needed by the simplified flow
- Keep tests focused on structural behavior, not full prose copy

**Step 4: Run test to verify it passes**

Run: `node tests/frontend/core_loop_pages.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add app.json tests/frontend/app_manifest.test.mjs tests/frontend/core_loop_pages.test.mjs
git commit -m "test: lock linear flow structure"
```

### Task 2: Collapse the home page into a cover screen

**Files:**
- Modify: `pages/home/home.js`
- Modify: `pages/home/home.wxml`
- Modify: `pages/home/home.wxss`

**Step 1: Write the failing test**

Extend `tests/frontend/core_loop_pages.test.mjs` to assert that:

- `home` still binds `createRun`
- `home` no longer renders `player-status-card` or `resource-bar`
- `home` contains one cover-style primary action
- the page no longer renders multiple sub-page cards

**Step 2: Run test to verify it fails**

Run: `node tests/frontend/core_loop_pages.test.mjs`
Expected: FAIL because the current home page still contains overview content.

**Step 3: Write minimal implementation**

- Rebuild `home` as a cover page with:
  - title
  - one short intro line
  - one primary button
- If a run already exists, make the primary action continue the run instead of reopening dense overview content

**Step 4: Run test to verify it passes**

Run: `node tests/frontend/core_loop_pages.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add pages/home/home.* tests/frontend/core_loop_pages.test.mjs
git commit -m "feat: simplify home into cover screen"
```

### Task 3: Build the inspection sheet for auxiliary information

**Files:**
- Create: `components/inspection-sheet/index.js`
- Create: `components/inspection-sheet/index.json`
- Create: `components/inspection-sheet/index.wxml`
- Create: `components/inspection-sheet/index.wxss`
- Modify: any page that should open the sheet, likely `pages/event/event.wxml`, `pages/event/event.js`, and possibly the active flow page JS/WXML
- Test: `tests/frontend/core_loop_pages.test.mjs`

**Step 1: Write the failing test**

Add assertions that the active flow page includes:

- one inspection entry
- the new inspection sheet component
- bindings needed to open, close, and switch sections

**Step 2: Run test to verify it fails**

Run: `node tests/frontend/core_loop_pages.test.mjs`
Expected: FAIL because the inspection sheet does not exist yet.

**Step 3: Write minimal implementation**

- Implement a bottom-sheet style component with tabs for:
  - `命牌`
  - `行囊`
  - `修炼`
  - `洞府`
- Render only one section at a time
- Accept existing player/resource/run props and derive simple display copy
- Do not move business logic into the component

**Step 4: Run test to verify it passes**

Run: `node tests/frontend/core_loop_pages.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add components/inspection-sheet/* pages/event/* tests/frontend/core_loop_pages.test.mjs
git commit -m "feat: add inspection sheet"
```

### Task 4: Turn the active flow page into a single-action travel screen

**Files:**
- Modify: `pages/event/event.js` or the chosen active flow page JS
- Modify: `pages/event/event.wxml` or the chosen active flow page WXML
- Modify: `pages/event/event.wxss` or the chosen active flow page WXSS
- Reuse or trim existing components only if still needed

**Step 1: Write the failing test**

Add assertions that the active flow page:

- shows one primary `推进时间` action when no unresolved event exists
- shows a small current-state summary
- does not render dense character/resource cards inline
- includes the inspection entry and sheet component

**Step 2: Run test to verify it fails**

Run: `node tests/frontend/core_loop_pages.test.mjs`
Expected: FAIL because the page still renders the heavier scroll layout.

**Step 3: Write minimal implementation**

- Reframe the active flow page around:
  - current month or phase
  - one-line journey summary
  - one primary action
- Keep navigation to the dedicated event decision state when an event appears
- Ensure the page fits within one screen on typical mobile viewport assumptions

**Step 4: Run test to verify it passes**

Run: `node tests/frontend/core_loop_pages.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add pages/event/* tests/frontend/core_loop_pages.test.mjs
git commit -m "feat: simplify active travel screen"
```

### Task 5: Slim the event page into a decision-only screen

**Files:**
- Modify: `components/event-card/index.wxml`
- Modify: `components/event-card/index.wxss`
- Modify: `components/event-card/index.js` if needed
- Modify: `components/choice-button-list/index.wxml`
- Modify: `components/choice-button-list/index.wxss`
- Modify: `components/choice-button-list/index.js` if needed
- Test: `tests/frontend/core_loop_pages.test.mjs`

**Step 1: Write the failing test**

Adjust assertions so the decision page still preserves option wiring while dropping dense metadata presentation from the main body.

**Step 2: Run test to verify it fails**

Run: `node tests/frontend/core_loop_pages.test.mjs`
Expected: FAIL because event content is still too descriptive or too dense.

**Step 3: Write minimal implementation**

- Keep title, body, and options as the main surface
- Demote risk/source/status into a lighter hint area or a secondary note
- Keep option availability, default marker, and disabled reasons intact

**Step 4: Run test to verify it passes**

Run: `node tests/frontend/core_loop_pages.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add components/event-card/* components/choice-button-list/* tests/frontend/core_loop_pages.test.mjs
git commit -m "feat: focus event screen on decisions"
```

### Task 6: Rework summary into the only ending screen

**Files:**
- Modify: `pages/summary/summary.wxml`
- Modify: `pages/summary/summary.wxss`
- Modify: `pages/summary/summary.js` if needed
- Modify: `components/run-result-modal/*` if the summary presentation should be simplified
- Test: `tests/frontend/core_loop_pages.test.mjs`

**Step 1: Write the failing test**

Assert that summary:

- renders the death-ending layout
- keeps `bind:confirm="handleRebirth"`
- avoids presenting itself like a general-purpose overview page

**Step 2: Run test to verify it fails**

Run: `node tests/frontend/core_loop_pages.test.mjs`
Expected: FAIL if summary still mirrors the dense information model.

**Step 3: Write minimal implementation**

- Keep only:
  - result summary
  - permanent progression
  - rebirth action
- Remove any unnecessary surviving-state presentation

**Step 4: Run test to verify it passes**

Run: `node tests/frontend/core_loop_pages.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add pages/summary/* components/run-result-modal/* tests/frontend/core_loop_pages.test.mjs
git commit -m "feat: simplify ending summary"
```

### Task 7: Verify copy cleanup and regression coverage

**Files:**
- Modify: any touched WXML/WXSS/JS files with garbled or obsolete copy
- Test: `tests/frontend/app_manifest.test.mjs`
- Test: `tests/frontend/core_loop_pages.test.mjs`
- Test: `tests/frontend/dev_config.test.mjs`

**Step 1: Write the failing test**

Refine tests to keep only durable assertions for the simplified flow and the corrected visible labels that matter.

**Step 2: Run test to verify it fails**

Run: `node tests/frontend/core_loop_pages.test.mjs`
Expected: FAIL if outdated structure or labels remain.

**Step 3: Write minimal implementation**

- Sweep remaining touched files for outdated dense-layout wording
- Keep copy concise and consistent with the single-focus flow
- Ensure no legacy summary entry remains on living-state screens

**Step 4: Run test to verify it passes**

Run:
- `node tests/frontend/app_manifest.test.mjs`
- `node tests/frontend/core_loop_pages.test.mjs`
- `node tests/frontend/dev_config.test.mjs`

Expected: PASS for all three commands

**Step 5: Commit**

```bash
git add app.json app.wxss pages components tests/frontend
git commit -m "fix: finalize linear flow redesign"
```
