# Miniprogram API Env Switch Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Automatically switch the miniprogram API base URL between local development and CloudBase production domains.

**Architecture:** Keep all environment detection and URL mapping in `utils/config.js`, and preserve the rest of the app's request flow unchanged.

**Tech Stack:** WeChat Mini Program, CommonJS, Node test runner

---

### Task 1: Add environment-aware API config

**Files:**
- Modify: `E:/game/wechat-miniprogram-game-front/utils/config.js`

**Step 1: Add environment mapping**

- Add constants for local and cloud API base URLs
- Add a function to detect `envVersion`
- Add a function to resolve the API base URL from the current environment
- Export the resolved `apiBaseUrl`

**Step 2: Keep request layer unchanged**

- Leave `utils/api.js` and `app.js` consuming `config.apiBaseUrl`

### Task 2: Add runtime verification

**Files:**
- Modify: `E:/game/wechat-miniprogram-game-front/tests/frontend/dev_config.test.mjs`

**Step 1: Replace string-only assertions with runtime checks**

- Verify `develop` resolves to local URL
- Verify `trial` resolves to cloud URL
- Verify unknown or missing env falls back to local URL

**Step 2: Run focused tests**

Run:
`node --test tests/frontend/dev_config.test.mjs tests/frontend/core_loop_pages.test.mjs`

Expected:
- both test files pass

