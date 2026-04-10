# 微信小游戏 Canvas 前端迁移 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 `wechat-miniprogram-game-front` 从微信小程序页面结构迁移为微信小游戏原生 Canvas 2D 单场景前端，并完成主循环、资源动作、洞府、炼丹与结算的可操作闭环。

**Architecture:** 保留现有 `utils/api.js` 与 `utils/run-store.js` 作为业务接入层，新增 `src/game` 作为小游戏渲染与交互层。通过 Canvas 渲染主舞台、抽屉和弹层，并用视图模型把 run state 转成可绘制结构。迁移过程中逐步停止 `pages/**` 的主路径职责，最终由 `game.js` 成为唯一运行入口。

**Tech Stack:** 微信小游戏原生 API、Canvas 2D、Node 静态测试、现有 CommonJS 工具层

---

### Task 1: 建立小游戏前端目录骨架

**Files:**
- Create: `E:/game/wechat-miniprogram-game-front/src/game/core/runtime.js`
- Create: `E:/game/wechat-miniprogram-game-front/src/game/core/layout.js`
- Create: `E:/game/wechat-miniprogram-game-front/src/game/core/input.js`
- Create: `E:/game/wechat-miniprogram-game-front/src/game/core/state.js`
- Create: `E:/game/wechat-miniprogram-game-front/src/game/ui/button.js`
- Create: `E:/game/wechat-miniprogram-game-front/src/game/ui/panel.js`
- Create: `E:/game/wechat-miniprogram-game-front/src/game/ui/drawer.js`
- Create: `E:/game/wechat-miniprogram-game-front/src/game/ui/modal.js`
- Create: `E:/game/wechat-miniprogram-game-front/src/game/theme/tokens.js`
- Test: `E:/game/wechat-miniprogram-game-front/tests/frontend/minigame_shell.test.mjs`

**Step 1: Write the failing test**

Extend `tests/frontend/minigame_shell.test.mjs` to assert that:

- `src/game/core/runtime.js` exists
- `src/game/core/input.js` exists
- `src/game/ui/drawer.js` exists
- `src/game/theme/tokens.js` exists

**Step 2: Run test to verify it fails**

Run:

```bash
node tests/frontend/minigame_shell.test.mjs
```

Expected: FAIL with missing file assertion.

**Step 3: Write minimal implementation**

Create the files with minimal exports:

- runtime boot helpers
- input registration placeholders
- theme token object
- simple UI primitive factories

**Step 4: Run test to verify it passes**

Run:

```bash
node tests/frontend/minigame_shell.test.mjs
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/game tests/frontend/minigame_shell.test.mjs
git commit -m "feat: scaffold minigame canvas runtime"
```

### Task 2: 用 Canvas 运行时替换当前调试壳

**Files:**
- Modify: `E:/game/wechat-miniprogram-game-front/game.js`
- Modify: `E:/game/wechat-miniprogram-game-front/game.json`
- Modify: `E:/game/wechat-miniprogram-game-front/project.config.json`
- Test: `E:/game/wechat-miniprogram-game-front/tests/frontend/minigame_shell.test.mjs`

**Step 1: Write the failing test**

Extend `tests/frontend/minigame_shell.test.mjs` to assert that:

- `game.js` requires `src/game/core/runtime`
- `game.js` no longer centers on `WendaoDebug` console-only boot
- `game.json` contains portrait orientation
- `project.config.json` keeps `compileType: "game"`

**Step 2: Run test to verify it fails**

Run:

```bash
node tests/frontend/minigame_shell.test.mjs
```

Expected: FAIL because `game.js` still uses the temporary console debug shell.

**Step 3: Write minimal implementation**

Replace `game.js` bootstrap with:

- Canvas init
- runtime creation
- input registration
- first render
- optional debug API exposure for diagnostics

Keep `game.json` and project config aligned with小游戏模式。

**Step 4: Run test to verify it passes**

Run:

```bash
node tests/frontend/minigame_shell.test.mjs
node --check game.js
```

Expected: PASS

**Step 5: Commit**

```bash
git add game.js game.json project.config.json tests/frontend/minigame_shell.test.mjs
git commit -m "feat: boot canvas minigame runtime"
```

### Task 3: 接入主舞台视图模型

**Files:**
- Create: `E:/game/wechat-miniprogram-game-front/src/game/view-models/main-stage.js`
- Create: `E:/game/wechat-miniprogram-game-front/src/game/adapters/run-store-adapter.js`
- Test: `E:/game/wechat-miniprogram-game-front/tests/frontend/minigame_main_stage_view_model.test.mjs`

**Step 1: Write the failing test**

Create `tests/frontend/minigame_main_stage_view_model.test.mjs` covering:

- no run 时返回“启程”态
- active run 时返回顶部摘要
- pending event 时返回事件提醒态
- dead run 时返回结算优先态

**Step 2: Run test to verify it fails**

Run:

```bash
node tests/frontend/minigame_main_stage_view_model.test.mjs
```

Expected: FAIL because view model file does not exist.

**Step 3: Write minimal implementation**

Implement:

- `buildMainStageViewModel(snapshot)`
- `getPrimaryAction(snapshot)`
- store adapter that reads from `utils/run-store.js`

**Step 4: Run test to verify it passes**

Run:

```bash
node tests/frontend/minigame_main_stage_view_model.test.mjs
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/game/view-models/main-stage.js src/game/adapters/run-store-adapter.js tests/frontend/minigame_main_stage_view_model.test.mjs
git commit -m "feat: add main stage view model"
```

### Task 4: 渲染主舞台并支持开局与推进时间

**Files:**
- Create: `E:/game/wechat-miniprogram-game-front/src/game/screens/main-stage-screen.js`
- Modify: `E:/game/wechat-miniprogram-game-front/src/game/core/runtime.js`
- Modify: `E:/game/wechat-miniprogram-game-front/src/game/core/input.js`
- Modify: `E:/game/wechat-miniprogram-game-front/game.js`
- Test: `E:/game/wechat-miniprogram-game-front/tests/frontend/minigame_shell.test.mjs`

**Step 1: Write the failing test**

Extend `tests/frontend/minigame_shell.test.mjs` to assert:

- `main-stage-screen.js` exists
- `game.js` wires runtime to main stage screen
- boot path references `createRun` and `advanceTime` through runtime/controller flow

**Step 2: Run test to verify it fails**

Run:

```bash
node tests/frontend/minigame_shell.test.mjs
```

Expected: FAIL because screen runtime wiring is not implemented yet.

**Step 3: Write minimal implementation**

Implement a single visible Canvas scene that supports:

- title / summary rendering
- primary button
- create run
- advance time
- redraw after state changes

**Step 4: Run test to verify it passes**

Run:

```bash
node tests/frontend/minigame_shell.test.mjs
node --check game.js
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/game/core src/game/screens game.js tests/frontend/minigame_shell.test.mjs
git commit -m "feat: render main stage screen"
```

### Task 5: 迁移事件弹层与选项交互

**Files:**
- Create: `E:/game/wechat-miniprogram-game-front/src/game/view-models/event-modal.js`
- Create: `E:/game/wechat-miniprogram-game-front/src/game/screens/event-modal.js`
- Modify: `E:/game/wechat-miniprogram-game-front/src/game/core/runtime.js`
- Test: `E:/game/wechat-miniprogram-game-front/tests/frontend/minigame_event_modal_view_model.test.mjs`

**Step 1: Write the failing test**

Create `tests/frontend/minigame_event_modal_view_model.test.mjs` covering:

- pending event 转换为弹层标题、正文、选项列表
- disabled option 包含禁用态和原因
- no event 时返回 null

**Step 2: Run test to verify it fails**

Run:

```bash
node tests/frontend/minigame_event_modal_view_model.test.mjs
```

Expected: FAIL because event modal view model is missing.

**Step 3: Write minimal implementation**

Implement:

- event modal view model
- Canvas event modal renderer
- option click handling
- `store.resolveEvent()` integration

**Step 4: Run test to verify it passes**

Run:

```bash
node tests/frontend/minigame_event_modal_view_model.test.mjs
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/game/view-models/event-modal.js src/game/screens/event-modal.js tests/frontend/minigame_event_modal_view_model.test.mjs
git commit -m "feat: add event modal flow"
```

### Task 6: 迁移资源抽屉与修行抽屉

**Files:**
- Create: `E:/game/wechat-miniprogram-game-front/src/game/view-models/resources-drawer.js`
- Create: `E:/game/wechat-miniprogram-game-front/src/game/view-models/cultivation-drawer.js`
- Create: `E:/game/wechat-miniprogram-game-front/src/game/screens/resources-drawer.js`
- Create: `E:/game/wechat-miniprogram-game-front/src/game/screens/cultivation-drawer.js`
- Test: `E:/game/wechat-miniprogram-game-front/tests/frontend/minigame_drawers_view_model.test.mjs`

**Step 1: Write the failing test**

Create `tests/frontend/minigame_drawers_view_model.test.mjs` covering:

- resource list formatting
- sell action metadata
- convert action metadata
- breakthrough target summary and unmet requirement state

**Step 2: Run test to verify it fails**

Run:

```bash
node tests/frontend/minigame_drawers_view_model.test.mjs
```

Expected: FAIL because drawer view models do not exist.

**Step 3: Write minimal implementation**

Implement resource and cultivation drawers with:

- open / close
- list rendering
- sell resource action
- spirit stone convert action
- breakthrough action

**Step 4: Run test to verify it passes**

Run:

```bash
node tests/frontend/minigame_drawers_view_model.test.mjs
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/game/view-models src/game/screens tests/frontend/minigame_drawers_view_model.test.mjs
git commit -m "feat: add resource and cultivation drawers"
```

### Task 7: 迁移洞府抽屉

**Files:**
- Create: `E:/game/wechat-miniprogram-game-front/src/game/view-models/dwelling-drawer.js`
- Create: `E:/game/wechat-miniprogram-game-front/src/game/screens/dwelling-drawer.js`
- Test: `E:/game/wechat-miniprogram-game-front/tests/frontend/minigame_dwelling_drawer_view_model.test.mjs`

**Step 1: Write the failing test**

Create `tests/frontend/minigame_dwelling_drawer_view_model.test.mjs` covering:

- facility card summary
- build / upgrade actions
- stalled warning text
- settlement summary lines

**Step 2: Run test to verify it fails**

Run:

```bash
node tests/frontend/minigame_dwelling_drawer_view_model.test.mjs
```

Expected: FAIL because dwelling drawer logic does not exist.

**Step 3: Write minimal implementation**

Implement dwelling drawer with:

- facility cards
- build facility action
- upgrade facility action
- confirmation modal for stall risk
- recent settlement summary

**Step 4: Run test to verify it passes**

Run:

```bash
node tests/frontend/minigame_dwelling_drawer_view_model.test.mjs
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/game/view-models/dwelling-drawer.js src/game/screens/dwelling-drawer.js tests/frontend/minigame_dwelling_drawer_view_model.test.mjs
git commit -m "feat: migrate dwelling drawer"
```

### Task 8: 迁移炼丹抽屉

**Files:**
- Create: `E:/game/wechat-miniprogram-game-front/src/game/view-models/alchemy-drawer.js`
- Create: `E:/game/wechat-miniprogram-game-front/src/game/screens/alchemy-drawer.js`
- Test: `E:/game/wechat-miniprogram-game-front/tests/frontend/minigame_alchemy_drawer_view_model.test.mjs`

**Step 1: Write the failing test**

Create `tests/frontend/minigame_alchemy_drawer_view_model.test.mjs` covering:

- recipe cards
- active job summary
- inventory list
- start alchemy action metadata
- consume item action metadata

**Step 2: Run test to verify it fails**

Run:

```bash
node tests/frontend/minigame_alchemy_drawer_view_model.test.mjs
```

Expected: FAIL because alchemy drawer logic does not exist.

**Step 3: Write minimal implementation**

Implement alchemy drawer with:

- recipe list
- start alchemy
- start with spirit spring
- inventory rendering
- consume item actions

**Step 4: Run test to verify it passes**

Run:

```bash
node tests/frontend/minigame_alchemy_drawer_view_model.test.mjs
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/game/view-models/alchemy-drawer.js src/game/screens/alchemy-drawer.js tests/frontend/minigame_alchemy_drawer_view_model.test.mjs
git commit -m "feat: migrate alchemy drawer"
```

### Task 9: 迁移结算弹层与转生流程

**Files:**
- Create: `E:/game/wechat-miniprogram-game-front/src/game/view-models/summary-modal.js`
- Create: `E:/game/wechat-miniprogram-game-front/src/game/screens/summary-modal.js`
- Modify: `E:/game/wechat-miniprogram-game-front/src/game/core/runtime.js`
- Test: `E:/game/wechat-miniprogram-game-front/tests/frontend/minigame_summary_modal_view_model.test.mjs`

**Step 1: Write the failing test**

Create `tests/frontend/minigame_summary_modal_view_model.test.mjs` covering:

- dead run summary formatting
- rebirth action state
- alive run returns null

**Step 2: Run test to verify it fails**

Run:

```bash
node tests/frontend/minigame_summary_modal_view_model.test.mjs
```

Expected: FAIL because summary modal is missing.

**Step 3: Write minimal implementation**

Implement:

- summary modal rendering
- rebirth action
- state reset after rebirth

**Step 4: Run test to verify it passes**

Run:

```bash
node tests/frontend/minigame_summary_modal_view_model.test.mjs
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/game/view-models/summary-modal.js src/game/screens/summary-modal.js tests/frontend/minigame_summary_modal_view_model.test.mjs
git commit -m "feat: add summary modal rebirth flow"
```

### Task 10: 清理旧页面主路径并更新测试基线

**Files:**
- Modify: `E:/game/wechat-miniprogram-game-front/tests/frontend/core_loop_pages.test.mjs`
- Modify: `E:/game/wechat-miniprogram-game-front/tests/frontend/app_manifest.test.mjs`
- Modify: `E:/game/wechat-miniprogram-game-front/tests/frontend/dev_config.test.mjs`
- Modify: `E:/game/wechat-miniprogram-game-front/docs/2026-04-02-completed-features.md`
- Modify: `E:/game/wechat-miniprogram-game-front/README.md` (create if needed)

**Step 1: Write the failing test**

Adjust the existing test suite so it no longer asserts:

- `pages/**` as the primary UI path
- page-level wxml/wxss content as the main acceptance criteria

Add assertions for:

- `game.js` as唯一入口
- `src/game/**` screen and view model presence
- Canvas runtime wiring

**Step 2: Run test to verify it fails**

Run:

```bash
node tests/frontend/core_loop_pages.test.mjs
node tests/frontend/app_manifest.test.mjs
node tests/frontend/dev_config.test.mjs
```

Expected: FAIL until tests are updated to the new architecture.

**Step 3: Write minimal implementation**

Update docs and tests to reflect:

- 微信小游戏前端
- Canvas 单场景结构
- 页面体系退场

**Step 4: Run test to verify it passes**

Run:

```bash
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
```

Expected: PASS

**Step 5: Commit**

```bash
git add tests/frontend docs README.md
git commit -m "test: update frontend suite for minigame canvas architecture"
```

### Task 11: 收尾并验证开发者工具可视调试

**Files:**
- Modify: `E:/game/wechat-miniprogram-game-front/game.js`
- Modify: `E:/game/wechat-miniprogram-game-front/project.config.json`
- Test: manual verification in WeChat DevTools

**Step 1: Write the failing test**

No additional automated test. Use a verification checklist:

- 启动后非黑屏
- 可见主舞台
- 可打开事件弹层
- 可打开资源 / 修行 / 洞府 / 炼丹抽屉
- 可看到结算弹层

**Step 2: Run test to verify it fails**

Open WeChat DevTools in 小游戏模式.

Expected: any missing visual path blocks completion.

**Step 3: Write minimal implementation**

Polish:

- boot fallback
- safe redraw
- touch routing bugs
- drawer open state bugs

**Step 4: Run test to verify it passes**

Run manual verification in WeChat DevTools and record outcomes.

Expected: all checklist items pass.

**Step 5: Commit**

```bash
git add game.js project.config.json
git commit -m "fix: finalize minigame canvas debugging flow"
```
