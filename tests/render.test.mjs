// The actor sheet templates must render the same HTML as the captured snapshots (tests/render/snapshots/).
// Never regenerate the snapshots (npm run render:capture) to make a failing comparison pass; only a deliberate, approved markup change may.
import { test } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderAll } from "./render/snapshots.mjs";

const dir = join(dirname(fileURLToPath(import.meta.url)), "render", "snapshots");

for (const [file, html] of await renderAll()) {
  test(`render: ${file} matches its snapshot`, () => {
    assert.strictEqual(html, readFileSync(join(dir, file), "utf8"));
  });
}
