# Minigame Dwelling Drawer Condensed Layout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rework the minigame dwelling drawer so the header and summary become compact and facility cards render in a two-column layout without changing build or upgrade behavior.

**Architecture:** Keep the existing dwelling action flow and max-level logic intact. Move summary aggregation into the dwelling drawer view model, then update the canvas drawer renderer to use a two-row summary section plus a two-column facility grid with per-card stalled warnings.

**Tech Stack:** Node.js tests, CommonJS view models, canvas screen rendering in the minigame frontend.

---

### Task 1: Aggregate condensed dwelling summary data

**Files:**
- Modify: `src/game/view-models/dwelling-drawer.js`
- Test: `tests/frontend/minigame_dwelling_drawer_view_model.test.mjs`

**Step 1: Write the failing test**

Add assertions for:
- total maintenance spirit stone
- aggregated production items across facilities
- stalled facility flag staying on the specific card

**Step 2: Run test to verify it fails**

Run: `node --test tests/frontend/minigame_dwelling_drawer_view_model.test.mjs`
Expected: FAIL because the new summary fields do not exist yet.

**Step 3: Write minimal implementation**

Update the dwelling drawer view model to:
- expose `summaryStats`
- expose `productionSummaryItems`
- expose per-card `isStalled`

**Step 4: Run test to verify it passes**

Run: `node --test tests/frontend/minigame_dwelling_drawer_view_model.test.mjs`
Expected: PASS

### Task 2: Render the compact dwelling drawer layout

**Files:**
- Modify: `src/game/screens/dwelling-drawer.js`
- Test: `tests/frontend/minigame_screen_modules.test.mjs`

**Step 1: Write the failing test**

Add source-level assertions for:
- two-column card layout math
- summary stat rendering
- production summary rendering
- stalled warning rendering

**Step 2: Run test to verify it fails**

Run: `node --test tests/frontend/minigame_screen_modules.test.mjs`
Expected: FAIL because the new layout code is absent.

**Step 3: Write minimal implementation**

Update the drawer renderer to:
- place dwelling level near the title
- render first-row stats and second-row production summary
- render facility cards in a two-column grid
- keep buttons unchanged except for new positions

**Step 4: Run test to verify it passes**

Run: `node --test tests/frontend/minigame_screen_modules.test.mjs`
Expected: PASS

### Task 3: Preserve interaction behavior after the layout change

**Files:**
- Modify: `tests/frontend/minigame_screen_interactions.test.mjs`
- Verify: `src/game/screens/main-stage-screen.js`

**Step 1: Write the failing test**

Adjust dwelling tap coordinates for the two-column layout and assert:
- normal facility button still opens the confirm flow
- max-level card still does not react

**Step 2: Run test to verify it fails**

Run: `node --test tests/frontend/minigame_screen_interactions.test.mjs`
Expected: FAIL if hit regions no longer match.

**Step 3: Write minimal implementation**

Only if needed, adjust draw-time hit regions to match the new layout.

**Step 4: Run tests to verify they pass**

Run: `node --test tests/frontend/minigame_dwelling_drawer_view_model.test.mjs tests/frontend/minigame_screen_modules.test.mjs tests/frontend/minigame_screen_interactions.test.mjs tests/frontend/core_loop_pages.test.mjs`
Expected: PASS
