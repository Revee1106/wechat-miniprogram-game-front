import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const bannedPatterns = [
  { label: "broken closing tags", pattern: /\?\/view>|\?\/text>|\?\/block>/i },
  { label: "template logical or", pattern: /\|\|/ },
  { label: "template string concatenation", pattern: /\{\{[^}]*\+[^}]*\}\}/ },
];

for (const filePath of collectFiles(rootDir, ".wxml")) {
  const source = readFileSync(filePath, "utf8");

  for (const entry of bannedPatterns) {
    assert.doesNotMatch(
      source,
      entry.pattern,
      `${path.relative(rootDir, filePath)} should not contain ${entry.label}`,
    );
  }
}

function collectFiles(dirPath, extension) {
  const entries = readdirSync(dirPath).sort();
  const results = [];

  for (const entry of entries) {
    if (entry === ".git" || entry === "node_modules") {
      continue;
    }

    const fullPath = path.join(dirPath, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      results.push(...collectFiles(fullPath, extension));
      continue;
    }

    if (fullPath.endsWith(extension)) {
      results.push(fullPath);
    }
  }

  return results;
}
