/**
 * Golden-master runner.
 *
 *   npm run golden                                 compare every tests/golden/<mechanic>.json with the current code, then every tests/golden/local/<mechanic>.json when that folder exists; exit 1 on any mismatch
 *   npm run golden -- --capture <mechanic>         write tests/golden/<mechanic>.json from tests/golden/inputs/<mechanic>.mjs and the current code
 *   npm run golden -- --capture <mechanic> --local write tests/golden/local/<mechanic>.json instead (required for the LOCAL_MECHANICS, whose inputs are the local real data)
 *   npm run golden -- --capture <mechanic> --force overwrite an existing fixture (only when the inputs change on purpose, never to make a comparison pass)
 *
 * tests/golden/local/ (gitignored) holds the full real-data fixtures and their data (world.* packs are private world content and are never committed). It is optional: when it is missing the local fixtures are skipped, not failed. The committed *-sample.json fixtures are built from it by tests/tools/select-compendium-sample.mjs.
 *
 * Needs the Foundry stub loaded first (the npm script does it with --import).
 */

import { readdir, readFile, writeFile, access } from "node:fs/promises";
import { dirname, join, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { adapters } from "./adapters.mjs";

const GOLDEN_DIR = dirname(fileURLToPath(import.meta.url));
export const LOCAL_DIR = join(GOLDEN_DIR, "local");

/** Mechanics whose inputs read tests/golden/local/data: their full fixtures may only be captured into tests/golden/local/. */
const LOCAL_MECHANICS = new Set(["compendium-items", "compendium-actors"]);

/** JSON-safe form of an output: NaN / Infinity kept visible as strings, undefined properties dropped (as in the fixture file). */
export function normalize(value) {
  return JSON.parse(JSON.stringify(value, (k, v) => {
    if (typeof v === "number" && !Number.isFinite(v)) return String(v);
    return v;
  }));
}

/** Paths where two normalized values differ, with both sides. */
function differences(expected, actual, path = "$") {
  if (isDeepStrictEqual(expected, actual)) return [];
  const bothObjects = expected && actual && typeof expected === "object" && typeof actual === "object" && Array.isArray(expected) === Array.isArray(actual);
  if (!bothObjects) return [{ path, expected, actual }];
  const keys = new Set([...Object.keys(expected), ...Object.keys(actual)]);
  return [...keys].flatMap(k => differences(expected[k], actual[k], Array.isArray(expected) ? `${path}[${k}]` : `${path}.${k}`));
}

async function jsonFiles(dir) {
  const names = await readdir(dir);
  return names.filter(n => n.endsWith(".json")).sort().map(n => join(dir, n));
}

/** Committed fixtures: tests/golden/*.json. */
export async function fixtureFiles() {
  return jsonFiles(GOLDEN_DIR);
}

/** Local real-data fixtures: tests/golden/local/*.json, or null when the folder does not exist (skipped, not failed). */
export async function localFixtureFiles() {
  const present = await access(LOCAL_DIR).then(() => true, () => false);
  return present ? jsonFiles(LOCAL_DIR) : null;
}

/** Compare one fixture file. Returns { mechanic, total, mismatches: [{ id, diffs | error }] }. */
export async function checkFixture(file) {
  const mechanic = basename(file, ".json");
  const adapter = adapters[mechanic];
  if (!adapter) return { mechanic, total: 0, mismatches: [{ id: "(file)", error: `no adapter named "${mechanic}"` }] };
  const cases = JSON.parse(await readFile(file, "utf8"));
  const mismatches = [];
  for (const c of cases) {
    let actual;
    try {
      actual = normalize(await adapter(c.input));
    } catch (err) {
      mismatches.push({ id: c.id, error: err.stack ?? String(err) });
      continue;
    }
    const diffs = differences(c.expected, actual);
    if (diffs.length) mismatches.push({ id: c.id, diffs });
  }
  return { mechanic, total: cases.length, mismatches };
}

/** Human-readable report of one fixture result. */
export function formatResult({ mechanic, total, mismatches }) {
  const lines = [`${mismatches.length ? "FAIL" : "ok  "} ${mechanic}: ${total - mismatches.length}/${total} cases match`];
  for (const m of mismatches) {
    lines.push(`  - ${m.id}`);
    if (m.error) lines.push(`      error: ${m.error}`);
    for (const d of m.diffs ?? []) lines.push(`      ${d.path}: expected ${JSON.stringify(d.expected)}, got ${JSON.stringify(d.actual)}`);
  }
  return lines.join("\n");
}

async function capture(mechanic, { force, local }) {
  const adapter = adapters[mechanic];
  if (!adapter) throw new Error(`no adapter named "${mechanic}"`);
  if (LOCAL_MECHANICS.has(mechanic) && !local) throw new Error(`${mechanic} reads the local real data: capture it with --local (into ${LOCAL_DIR}), never into the committed tree`);
  if (local && !LOCAL_MECHANICS.has(mechanic)) throw new Error(`--local is only for ${[...LOCAL_MECHANICS].join(", ")}`);
  const target = join(local ? LOCAL_DIR : GOLDEN_DIR, `${mechanic}.json`);
  const exists = await access(target).then(() => true, () => false);
  if (exists && !force) throw new Error(`${target} exists; refusing to overwrite without --force`);
  const { cases } = await import(pathToFileURL(join(GOLDEN_DIR, "inputs", `${mechanic}.mjs`)).href);
  const ids = new Set();
  const out = [];
  for (const { id, input } of cases) {
    if (ids.has(id)) throw new Error(`duplicate case id ${id}`);
    ids.add(id);
    out.push({ id, source: "executed", input: normalize(input), expected: normalize(await adapter(normalize(input))) });
  }
  await writeFile(target, `${JSON.stringify(out, null, 2)}\n`);
  console.log(`captured ${out.length} cases -> ${target}`);
}

async function main(argv) {
  const i = argv.indexOf("--capture");
  if (i >= 0) {
    const mechanic = argv[i + 1];
    if (!mechanic || mechanic.startsWith("--")) throw new Error("usage: --capture <mechanic> [--local] [--force]");
    await capture(mechanic, { force: argv.includes("--force"), local: argv.includes("--local") });
    return 0;
  }
  let failed = 0, total = 0;
  const run = async (files) => {
    let cases = 0;
    for (const file of files) {
      const result = await checkFixture(file);
      cases += result.total;
      failed += result.mismatches.length;
      console.log(formatResult(result));
    }
    total += cases;
    return cases;
  };
  await run(await fixtureFiles());
  const localFiles = await localFixtureFiles();
  if (localFiles) {
    console.log("\nlocal (tests/golden/local/):");
    console.log(`local real-data fixtures: ${await run(localFiles)} cases`);
  } else {
    console.log("\nlocal real-data fixtures: not present (skipped)");
  }
  console.log(failed ? `\ngolden: ${failed} of ${total} cases differ` : `\ngolden: all ${total} cases match`);
  return failed ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).then(code => { process.exitCode = code; }, err => { console.error(err.message); process.exitCode = 1; });
}
