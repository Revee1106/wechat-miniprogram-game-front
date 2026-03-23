import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const homeWxml = readFileSync("pages/home/home.wxml", "utf8");
const eventWxml = readFileSync("pages/event/event.wxml", "utf8");
const summaryWxml = readFileSync("pages/summary/summary.wxml", "utf8");
const resourceBarWxml = readFileSync("components/resource-bar/index.wxml", "utf8");
const playerStatusCardJs = readFileSync("components/player-status-card/index.js", "utf8");
const storeSource = readFileSync("utils/run-store.js", "utf8");
const apiSource = readFileSync("utils/api.js", "utf8");
const componentDir = "components";
const forbiddenSelectorPattern = /(^|\n)\s*view\s*\{/;

assert.match(homeWxml, /开始一局/);
assert.match(homeWxml, /推进时间/);
assert.match(homeWxml, /修炼/);
assert.match(homeWxml, /炼制/);
assert.match(homeWxml, /洞府/);
assert.match(homeWxml, /本局总结/);
assert.match(homeWxml, /已过月数：/);
assert.match(homeWxml, /player-status-card/);
assert.match(homeWxml, /resource-bar/);
assert.match(eventWxml, /event-card/);
assert.match(eventWxml, /choice-button-list/);
assert.match(summaryWxml, /转生/);
assert.match(resourceBarWxml, /资源/);
assert.match(resourceBarWxml, /灵石：/);
assert.match(resourceBarWxml, /药草：/);
assert.match(resourceBarWxml, /玄铁精华：/);
assert.match(playerStatusCardJs, /formatLifespan/);
assert.match(storeSource, /createRun/);
assert.match(storeSource, /resolveEvent/);
assert.match(apiSource, /\/api\/run\/create/);
assert.match(apiSource, /\/api\/run\/advance/);

for (const entry of readdirSync(componentDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) {
    continue;
  }

  const wxssPath = path.join(componentDir, entry.name, "index.wxss");
  const wxssSource = readFileSync(wxssPath, "utf8");
  assert.doesNotMatch(
    wxssSource,
    forbiddenSelectorPattern,
    `${wxssPath} should not use tag-name selectors in component WXSS`
  );
}
