import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("components/breakthrough-panel/index.wxml", "utf8");

assert.doesNotMatch(source, /[^<]\/view>/i);
assert.doesNotMatch(source, /\|\|/);
assert.doesNotMatch(source, /\{\{[^}]*\+[^}]*\}\}/);
