# Minigame Button Contrast Refresh Design

**Date:** 2026-04-09

## Background

The minigame event modal and several drawer actions currently render primary actions as dark green pills with light text.

On the simulator, this treatment reduces readability:

- button titles lose contrast against the dark fill
- option cards look like decorative blocks instead of readable action surfaces
- the red time-cost caption is too small and too light to stand out

The user wants a stronger, utilitarian treatment:

- black border
- white background
- dark text
- keep event time-cost text red

They also want the same style applied across other matching controls, not only the event modal.

## Problem

The current minigame canvas theme favors low-contrast jade action fills:

- `themeTokens.color.jadeSoft`
- `themeTokens.color.creamText`

Those values are used by multiple screens and helpers:

- event modal option cards
- seal buttons
- drawer action buttons
- summary modal primary button
- some selected chips and recipe action buttons

This creates a shared readability problem rather than a single-screen issue.

## Goals

- Replace the dark jade action treatment with a high-contrast white-surface button treatment across matching controls.
- Keep button text dark and readable on both simulator and device.
- Preserve disabled styling clearly.
- Keep event time-cost text red, but make it easier to notice.

## Non-Goals

- No structural layout redesign.
- No rewrite of bottom tab visual language unless required by the same shared helper.
- No gameplay behavior changes.
- No event payload or API changes.

## Chosen Direction

Use a shared “ink outline button” visual treatment:

- warm white fill
- dark ink border
- dark ink label
- soft disabled gray variant

For the event modal:

- option cards become white cards with dark borders
- enabled option titles become dark ink
- disabled options remain muted but still legible
- time-cost caption stays red and becomes slightly larger and bolder

## Visual Specification

### Shared Action Buttons

- Fill: warm white / parchment white
- Border: dark ink
- Label: dark ink
- Radius: keep current rounded forms
- Disabled fill: pale gray-beige
- Disabled border: softened gray-brown
- Disabled label: muted gray-brown

### Event Time Cost

- Keep red hue family
- Increase emphasis through size and/or weight
- Preserve secondary placement under the option title

## Scope

Update the matching controls in the minigame canvas frontend:

- `src/game/screens/event-modal.js`
- `src/game/ui/seal-button.js`
- `src/game/screens/resources-drawer.js`
- `src/game/screens/cultivation-drawer.js`
- `src/game/screens/dwelling-drawer.js`
- `src/game/screens/summary-modal.js`
- `src/game/screens/alchemy-drawer.js`
- `src/game/screens/confirm-modal.js` if needed for consistency
- `src/game/theme/tokens.js`

## Implementation Approach

Prefer introducing shared color tokens for contrast-first buttons rather than hard-coding values repeatedly.

Use the existing drawing helpers where possible:

- extend tokens with explicit button fill/border/text colors
- update `drawSealButton` to become the canonical contrast button
- align direct-draw button surfaces in modal/drawer screens to the same look

## Testing Strategy

Add or update frontend tests that verify:

- the relevant screen sources use the new contrast button tokens
- event modal still shows time-cost text
- button helpers remain loadable

Because this canvas UI is largely source-verified in the current test suite, source-level assertions are acceptable for this change.
