/**
 * Mutation check of the golden fixtures (dev tool, not part of npm test).
 *
 *   node tests/tools/mutation-check.mjs
 *
 * Copies module/, tests/ and package.json to a temp dir, then for each mutation in MUTATIONS (one small change to module/ code) runs three fixture groups against the mutated copy and reports which group kills it (at least one case differs or throws):
 *  - full   = the local real-data fixtures, tests/golden/local/*.json (needs the local folder, see tests/golden/README.md)
 *  - sample = the committed real-data sample, tests/golden/*-sample.json
 *  - hand   = the hand-written committed fixtures, every other tests/golden/*.json
 * Exit 1 when a mutation is killed by full but not by sample (the sample is then not representative; add coverage in tests/tools/select-compendium-sample.mjs), or when the unmutated baseline fails. The temp dir is deleted at the end.
 */

import { cp, mkdtemp, readFile, writeFile, rm, access, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** [id, file under module/, exact snippet (must occur once), replacement]. */
const MUTATIONS = [
  ["skill-sb-floor", "data/item-skill.mjs", "this.sb = Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);", "this.sb = Math.floor(values.reduce((sum, v) => sum + v, 0) / values.length);"],
  ["psionic-sb-floor", "data/item-psionic.mjs", "this.sb = Math.round(values.reduce((s, v) => s + v, 0) / values.length);", "this.sb = Math.floor(values.reduce((s, v) => s + v, 0) / values.length);"],
  ["endurance-floor", "data/base-actor-schema.mjs", "Math.round((tired(\"str\") + tired(\"sta\") + tired(\"wil\")) / 3)", "Math.floor((tired(\"str\") + tired(\"sta\") + tired(\"wil\")) / 3)"],
  ["endurance-mod-dropped", "data/base-actor-schema.mjs", "/ 3) + (mods.endurance ?? 0));", "/ 3));"],
  ["load-kg-unrounded", "data/base-actor-schema.mjs", "const loadKg = Math.round(gear.total / unitsPerKg * 1000) / 1000;", "const loadKg = gear.total / unitsPerKg;"],
  ["load-steps-round", "data/base-actor-schema.mjs", "Math.ceil(over / SCARMARK.LOAD_STEP - 1e-9)", "Math.round(over / SCARMARK.LOAD_STEP)"],
  ["load-pct-floor", "data/base-actor-schema.mjs", "Math.round(loadShare * 100) : 999", "Math.floor(loadShare * 100) : 999"],
  ["load-capacity-wil", "data/base-actor-schema.mjs", "const capacityKg = Math.max(0, base(\"str\") + base(\"sta\"));", "const capacityKg = Math.max(0, base(\"str\") + base(\"wil\"));"],
  ["load-agl-penalty-dropped", "data/base-actor-schema.mjs", "if (k === \"agl\") penalty += loadSteps;", ""],
  ["condition-pct-floor", "data/base-actor-schema.mjs", "pct: Math.round(conditionShare * 100)", "pct: Math.floor(conditionShare * 100)"],
  ["condition-band-strict", "data/base-actor-schema.mjs", "SCARMARK.CONDITION_BANDS.find(b => conditionShare <= b.max)", "SCARMARK.CONDITION_BANDS.find(b => conditionShare < b.max)"],
  ["wound-penalty-dropped", "data/base-actor-schema.mjs", "if (SCARMARK.WOUND_ATTRIBUTES.includes(k)) penalty += woundPenalty;", ""],
  ["vital-ignored", "data/base-actor-schema.mjs", "const condition = vital ? 0 : Math.max(0, endurance - wl);", "const condition = Math.max(0, endurance - wl);"],
  ["heavy-bleed-count", "data/base-actor-schema.mjs", "system.heavyBleed = injuries.filter(i => i.system.heavyBleeding).length;", "system.heavyBleed = 0;"],
  ["sb-delta-trunc", "data/base-actor-schema.mjs", "return Math.round((delta / 3) * 5);", "return Math.trunc((delta / 3) * 5);"],
  ["sb-delta-floor", "data/base-actor-schema.mjs", "return Math.round((delta / 3) * 5);", "return Math.floor((delta / 3) * 5);"],
  ["fatigue-penalty-round", "data/base-actor-schema.mjs", "Math.floor(fatigue / SCARMARK.FATIGUE_STEP)", "Math.round(fatigue / SCARMARK.FATIGUE_STEP)"],
  ["move-from-base", "data/base-actor-schema.mjs", "const move = attributes.agl?.effective ?? 0;", "const move = attributes.agl?.base ?? 0;"],
  ["gear-quantity-dropped", "data/item-gear.mjs", "this.totalWeight = this.weight * this.quantity;", "this.totalWeight = this.weight;"],
  ["armor-quantity-dropped", "data/item-armor.mjs", "this.totalWeight = this.weight * this.quantity;", "this.totalWeight = this.weight;"],
  ["gear-value-quantity-dropped", "data/item-gear.mjs", "this.totalValue = this.value * this.quantity;", "this.totalValue = this.value;"],
  ["gear-value-rounded", "data/item-gear.mjs", "this.totalValue = this.value * this.quantity;", "this.totalValue = Math.round(this.value) * this.quantity;"],
  ["stored-container-counts", "data/base-actor-schema.mjs", "return container ? container.system.carried : true;", "return true;"],
  ["container-weight-dropped", "data/base-actor-schema.mjs", "const miscGear = sumOwn([\"gear\", \"container\"]);", "const miscGear = sumOwn([\"gear\"]);"],
  ["container-actor-capacity", "data/actor-container.mjs", "capacity: this.maxCapacity }", "capacity: 0 }"],
  ["armor-quality-sheet", "sheets/actor-sheet-base.mjs", "isWornArmor(this.document, i) && i.system.quality !== 0", "isWornArmor(this.document, i) && i.system.quality > 0"],
  ["armor-quality-helper", "helpers/combat/armor.mjs", "SCARMARK.locationKey(locType)) && a.system.quality !== 0)", "SCARMARK.locationKey(locType)) && a.system.quality > 0)"],
  ["armor-packed-protects", "helpers/combat/armor.mjs", "&& !(item.system.container && actor.items.get(item.system.container));", ";"],
  ["sunsign-bonus-dropped", "data/base-actor-schema.mjs", "override ?? ((item.system.level ?? 0) + bonus + catMod", "override ?? ((item.system.level ?? 0) + catMod"],
  ["category-mod-dropped", "data/base-actor-schema.mjs", "(mods.skills[item.system.category] ?? 0)", "0"],
  ["skill-mod-case-sensitive", "data/base-actor-schema.mjs", "const skillMod = skillModByLower[item.name.toLowerCase()] ?? 0;", "const skillMod = mods.skill[item.name] ?? 0;"],
  ["effect-override-ignored", "data/base-actor-schema.mjs", "item.system.esl = Math.max(0, override ?? (", "item.system.esl = Math.max(0, ("],
  ["effect-override-priority", "data/base-actor-schema.mjs", "found.sort((a, b) => a.priority - b.priority);", "found.sort((a, b) => b.priority - a.priority);"],
  ["outnumbered-3", "data/base-actor-schema.mjs", "if (n >= 3) return 30;", "if (n > 3) return 30;"],
  ["injury-severity-light", "config.mjs", "if (level <= 1) return \"light\";", "if (level < 1) return \"light\";"],
  ["injury-severity-dire", "config.mjs", "if (level === 4) return \"dire\";", "if (level >= 4) return \"dire\";"],
  ["mend-label-zero", "config.mjs", "Number(n) > 0 ? String(n) : \"MRN\"", "Number(n) >= 0 ? String(n) : \"MRN\""],
  ["legacy-attribute-average-floor", "data/base-actor-schema.mjs", "return vals.length ? Math.round(", "return vals.length ? Math.floor("],
  ["metric-units-ignored", "config.mjs", "SETTINGS.metricUnits) ? 1 : 2;", "SETTINGS.metricUnits) ? 2 : 2;"]
];

/** Runner executed inside the temp copy: checks the given fixture files, prints { file: mismatches }. */
const RUNNER = `
import { checkFixture } from "./tests/golden/run.mjs";
const out = {};
for (const file of JSON.parse(process.argv[2])) out[file] = (await checkFixture(file)).mismatches.length;
console.log(JSON.stringify(out));
`;

async function jsonFiles(dir) {
  const names = await readdir(dir).catch(() => []);
  return names.filter(n => n.endsWith(".json")).sort().map(n => join(dir, n));
}

async function groups(dir) {
  const committed = await jsonFiles(join(dir, "tests", "golden"));
  const local = await jsonFiles(join(dir, "tests", "golden", "local"));
  if (!local.length) throw new Error("tests/golden/local/ is missing or empty: the mutation check needs the local full set");
  return {
    full: local,
    sample: committed.filter(f => f.endsWith("-sample.json")),
    hand: committed.filter(f => !f.endsWith("-sample.json"))
  };
}

function runGroups(dir, files) {
  const all = [...files.full, ...files.sample, ...files.hand];
  const stdout = execFileSync(process.execPath, ["--import", "./tests/support/foundry-stub.mjs", "./mutation-runner.mjs", JSON.stringify(all)], { cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const counts = JSON.parse(stdout.trim().split("\n").at(-1));
  const kill = (list) => list.reduce((s, f) => s + counts[f], 0);
  return { full: kill(files.full), sample: kill(files.sample), hand: kill(files.hand) };
}

async function main() {
  const dir = await mkdtemp(join(tmpdir(), "scarmark-mutation-"));
  let failed = false;
  try {
    await cp(join(ROOT, "module"), join(dir, "module"), { recursive: true });
    await cp(join(ROOT, "tests"), join(dir, "tests"), { recursive: true });
    await cp(join(ROOT, "package.json"), join(dir, "package.json"));
    await writeFile(join(dir, "mutation-runner.mjs"), RUNNER);
    const files = await groups(dir);
    if (!files.sample.length) throw new Error("no tests/golden/*-sample.json fixtures found");

    const base = runGroups(dir, files);
    if (base.full || base.sample || base.hand) throw new Error(`baseline (no mutation) fails: ${JSON.stringify(base)}`);

    const rows = [];
    for (const [id, rel, from, to] of MUTATIONS) {
      const path = join(dir, "module", rel);
      const original = await readFile(path, "utf8");
      const count = original.split(from).length - 1;
      if (count !== 1) throw new Error(`mutation ${id}: snippet found ${count} times in module/${rel}`);
      await writeFile(path, original.replace(from, to));
      let r;
      try { r = runGroups(dir, files); } finally { await writeFile(path, original); }
      rows.push({ id, ...r });
    }

    const mark = (n) => (n ? `killed (${n})` : "survived");
    const w = Math.max(...rows.map(r => r.id.length));
    console.log(`${"mutation".padEnd(w)}  ${"full (local)".padEnd(14)}  ${"sample".padEnd(14)}  hand-written`);
    for (const r of rows) {
      const gap = r.full && !r.sample;
      if (gap) failed = true;
      console.log(`${r.id.padEnd(w)}  ${mark(r.full).padEnd(14)}  ${mark(r.sample).padEnd(14)}  ${mark(r.hand)}${gap ? "  <- killed by full, NOT by sample" : ""}`);
    }
    const n = (k) => rows.filter(r => r[k]).length;
    console.log(`\n${rows.length} mutations: full kills ${n("full")}, sample kills ${n("sample")}, hand-written kills ${n("hand")}, sample or hand-written kills ${rows.filter(r => r.sample || r.hand).length}`);
    console.log(failed ? "mutation check: FAIL (sample misses mutations the full set kills)" : "mutation check: ok (every mutation killed by the full set is killed by the sample)");
  } finally {
    await rm(dir, { recursive: true, force: true });
    const left = await access(dir).then(() => true, () => false);
    if (left) console.error(`could not delete ${dir}`);
  }
  return failed ? 1 : 0;
}

main().then(code => { process.exitCode = code; }, err => { console.error(err.message); process.exitCode = 1; });
