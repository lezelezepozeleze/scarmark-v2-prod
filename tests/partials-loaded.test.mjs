// A sheet part can only call a partial that Foundry has loaded for it: the `templates` key of the part must list every partial its template uses, directly or through another partial.
import "./support/foundry-stub.mjs";
import { test } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadItemSheets } from "./render/items.mjs";
import { SHEETS } from "./render/snapshots.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PREFIX = "systems/scarmark/";
const read = (path) => readFileSync(join(ROOT, path.slice(PREFIX.length)), "utf8");

/** Every partial a template calls, following the calls inside the partials too. */
function partialsUsed(path, seen = new Set()) {
  for (const match of read(path).matchAll(/\{\{#?>\s*"(systems\/scarmark\/[^"]+)"/g)) {
    if (!seen.has(match[1])) {
      seen.add(match[1]);
      partialsUsed(match[1], seen);
    }
  }
  return seen;
}

const sheets = [...Object.entries(SHEETS), ...Object.entries(await loadItemSheets()).map(([type, { Sheet }]) => [`item ${type}`, Sheet])];

for (const [name, Sheet] of sheets) {
  test(`partials: every partial the ${name} sheet's templates use is listed on its parts`, () => {
    for (const [partId, part] of Object.entries(Sheet.PARTS)) {
      if (!part.template.startsWith(PREFIX)) continue;
      assert.deepStrictEqual([...(part.templates ?? [])].sort(), [...partialsUsed(part.template)].sort(), `${name}.${partId}`);
    }
  });
}
