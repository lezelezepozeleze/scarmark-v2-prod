// npm run render:capture - write tests/render/snapshots/*.html from the current templates. See tests/render.test.mjs before using it.
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderAll } from "../render/snapshots.mjs";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "render", "snapshots");
mkdirSync(dir, { recursive: true });
for (const [file, html] of await renderAll()) {
  writeFileSync(join(dir, file), html);
  console.log(`wrote ${file} (${html.split("\n").length} lines)`);
}
