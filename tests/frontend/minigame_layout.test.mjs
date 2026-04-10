import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createViewportLayout } = require("../../src/game/core/layout.js");
const { themeTokens } = require("../../src/game/theme/tokens.js");

const singleRowLayout = createViewportLayout(375, 812, {
  safeArea: {
    left: 0,
    right: 375,
    top: 44,
    bottom: 778,
  },
  footerTagRows: 1,
});

const doubleRowLayout = createViewportLayout(375, 812, {
  safeArea: {
    left: 0,
    right: 375,
    top: 44,
    bottom: 778,
  },
  footerTagRows: 2,
});

assert.equal(singleRowLayout.safeTop, 44);
assert.equal(singleRowLayout.safeBottom, 34);
assert.equal(singleRowLayout.contentLeft, 24);
assert.ok(singleRowLayout.footerHeight > 0);
assert.equal(singleRowLayout.footerTagRows, 1);
assert.equal(doubleRowLayout.footerTagRows, 2);
assert.ok(singleRowLayout.footerHeight < doubleRowLayout.footerHeight);
assert.ok(singleRowLayout.scrollHeight > doubleRowLayout.scrollHeight);

assert.equal(themeTokens.color.paperSoft, "#f6eddc");
assert.equal(themeTokens.radius.pill, 999);
assert.ok(themeTokens.shadow.cardBlur > 0);
