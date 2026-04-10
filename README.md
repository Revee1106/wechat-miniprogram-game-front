# wechat-miniprogram-game-front

## Current Frontend Mode

This repository now targets WeChat Mini Game as the primary runtime.

- Runtime entry: `game.js`
- Render layer: `src/game/**`
- Business integration: `utils/api.js` and `utils/run-store.js`

The old mini program pages under `pages/**` and `components/**` still exist in the repository, but they are no longer the primary UI path.

## Architecture

- `src/game/core`
  - runtime bootstrap
  - input registration
  - viewport layout

- `src/game/screens`
  - main stage
  - event modal
  - resources drawer
  - cultivation drawer
  - dwelling drawer
  - alchemy drawer
  - summary modal

- `src/game/view-models`
  - converts run snapshots into render-ready structures

- `src/game/adapters`
  - bridges Canvas UI actions to `utils/run-store.js`

## Local Development

1. Start the backend at `http://127.0.0.1:8000`
2. Open this directory in WeChat DevTools
3. Use Mini Game mode
4. Ensure local URL checks are disabled in the dev environment when needed

## Main Stage Redesign

The current main stage is no longer a flat placeholder layout.

- Header: safe-area-aware title plaque
- Center: scroll-style summary card
- Primary action: seal-style CTA for `启程 / 推进时间`
- Bottom navigation: tag-style entries for `行囊 / 修行 / 洞府 / 炼丹`

## Notes

- Store and API layers are intentionally reused to reduce migration risk.
- Future work should continue removing dependence on the legacy mini program page structure.
