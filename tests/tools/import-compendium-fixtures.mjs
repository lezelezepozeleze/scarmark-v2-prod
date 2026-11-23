/**
 * One-off (re)import of real compendium data into frozen golden inputs.
 *
 *   node tests/tools/import-compendium-fixtures.mjs <export>/compendiums
 *
 * Reads <dir>/<pack-id>/documents.json (Foundry document API exports of SOURCE data) as plain JSON only - nothing from the export is executed or imported - and writes one compact file per pack to tests/golden/local/data/<pack-id>.json (gitignored, local only).
 * The golden inputs (tests/golden/inputs/compendium-items.mjs, compendium-actors.mjs) read only those files; the export dir is not needed afterwards. Then capture the local fixtures (npm run golden -- --capture compendium-items --local, same for compendium-actors) and rebuild the committed sample (node tests/tools/select-compendium-sample.mjs).
 *
 * Kept per document: _id, name, type, system, effects; actors also keep their embedded items the same way (plus each item's sort, which orders the actor sheet lists).
 * Stripped (free text no formula reads): system.description, system.notes, system.misfire, system.journal, system.specialAbilities (STRIPPED_SYSTEM_FIELDS).
 * Effects keep _id, name, type, disabled, transfer, statuses, duration, system (the v14 changes live in effects[].system.changes); everything else on an effect (description, img, tint, origin, flags, _stats, ...) is dropped.
 * Everything else on a document (img, folder, flags, ownership, prototypeToken, _stats, sort of top-level documents) is dropped.
 *
 * Deterministic: documents sorted by _id, object keys sorted recursively; embedded items keep their stored order (Foundry's collection order, the tie-break of the sheet sort).
 */

import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Output: the gitignored local folder (world.* packs are the GM's private world content and must never be committed). */
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "golden", "local", "data");

/** Packs to import. Skipped on purpose: macros, tables, scenes, journal, merchants, effect-only packs (type "base"), world.item-piles-item-backup-do-not-delete (module backup, not game content). */
const ITEM_PACKS = [
  "scarmark.alchemy", "scarmark.arcane", "scarmark.armor", "scarmark.armor-locations", "scarmark.currencies", "scarmark.diseases",
  "scarmark.gear", "scarmark.gear-funny", "scarmark.invocations", "scarmark.poisonings", "scarmark.psionic-talents",
  "scarmark.racial-traits", "scarmark.services", "scarmark.skills", "scarmark.valuables", "scarmark.weapons"
];
const ACTOR_PACKS = ["scarmark.actors", "world.actors"];

const STRIPPED_SYSTEM_FIELDS = ["description", "notes", "misfire", "journal", "specialAbilities"];
const EFFECT_FIELDS = ["_id", "name", "type", "disabled", "transfer", "statuses", "duration", "system"];

/** Recursively sorted object keys (arrays keep their order). */
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])]));
  return value;
}

function compactSystem(system) {
  const out = { ...(system ?? {}) };
  for (const k of STRIPPED_SYSTEM_FIELDS) delete out[k];
  return out;
}

function compactEffect(effect) {
  return Object.fromEntries(EFFECT_FIELDS.filter(k => k in effect).map(k => [k, effect[k]]));
}

function compactItem(doc, { keepSort = false } = {}) {
  const out = { _id: doc._id, name: doc.name, type: doc.type };
  if (keepSort) out.sort = doc.sort ?? 0;
  out.system = compactSystem(doc.system);
  out.effects = (doc.effects ?? []).map(compactEffect);
  return out;
}

function compactActor(doc) {
  return {
    _id: doc._id, name: doc.name, type: doc.type,
    system: compactSystem(doc.system),
    effects: (doc.effects ?? []).map(compactEffect),
    items: (doc.items ?? []).map(i => compactItem(i, { keepSort: true }))
  };
}

async function importPack(dir, pack, compact) {
  const docs = JSON.parse(await readFile(join(dir, pack, "documents.json"), "utf8"));
  if (!Array.isArray(docs)) throw new Error(`${pack}: documents.json is not an array`);
  const out = docs.map(compact).sort((a, b) => (a._id < b._id ? -1 : a._id > b._id ? 1 : 0));
  const file = join(OUT_DIR, `${pack}.json`);
  await writeFile(file, `${JSON.stringify(out.map(canonical), null, 1)}\n`);
  const types = {};
  for (const d of out) types[d.type] = (types[d.type] ?? 0) + 1;
  console.log(`${pack}: ${out.length} documents ${JSON.stringify(types)} -> ${file}`);
}

async function main(argv) {
  const dir = argv[0] && resolve(argv[0]);
  if (!dir) throw new Error("usage: node tests/tools/import-compendium-fixtures.mjs <export compendiums dir>");
  await access(dir);
  await mkdir(OUT_DIR, { recursive: true });
  for (const pack of ITEM_PACKS) await importPack(dir, pack, d => compactItem(d));
  for (const pack of ACTOR_PACKS) await importPack(dir, pack, compactActor);
}

main(process.argv.slice(2)).catch(err => { console.error(err.message); process.exitCode = 1; });
