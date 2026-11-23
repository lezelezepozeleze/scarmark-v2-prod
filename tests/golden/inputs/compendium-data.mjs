// Shared reader for the frozen compendium data (tests/golden/local/data/<pack-id>.json, local only, gitignored); used by compendium-items.mjs and compendium-actors.mjs.
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "local", "data");

/** One case per document, in pack order then _id order (the data files are already sorted by _id). Input = { pack, document }. */
export async function compendiumCases(packs) {
  const cases = [];
  for (const pack of packs) {
    const docs = JSON.parse(await readFile(join(DATA_DIR, `${pack}.json`), "utf8"));
    for (const document of docs) cases.push({ id: `${pack}/${document._id}/${document.name}`, input: { pack, document } });
  }
  return cases;
}
