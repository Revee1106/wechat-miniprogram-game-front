import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const bannedPatterns = [
  { label: "css variable definitions", pattern: /--[a-z0-9-]+\s*:/i },
  { label: "css variable usage", pattern: /var\(/i },
  { label: "css grid layout", pattern: /display\s*:\s*grid/i },
  { label: "css grid templates", pattern: /grid-template/i },
  { label: "css repeat()", pattern: /repeat\(/i },
  { label: "css minmax()", pattern: /minmax\(/i },
  { label: "css calc()", pattern: /calc\(/i },
  { label: "css env()", pattern: /env\(/i },
  { label: "double-colon pseudo elements", pattern: /::before|::after/i },
];

for (const filePath of collectFiles(rootDir, ".wxss")) {
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
