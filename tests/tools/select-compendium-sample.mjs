/**
 * Builds the committed real-data sample fixtures from the local full set.
 *
 *   node tests/tools/select-compendium-sample.mjs           select, anonymize, prove, write tests/golden/compendium-{items,actors}-sample.json
 *   node tests/tools/select-compendium-sample.mjs --dry-run select, anonymize and prove only, write nothing (no leak check)
 *
 * After writing, a leak check searches the samples and every git-tracked file for the private strings of the world.* data (see leakCheck).
 *
 * Input: tests/golden/local/compendium-items.json and compendium-actors.json (gitignored, see tests/golden/README.md). Fails when they are missing.
 *
 * Selection is by coverage, not random: every case gets a feature signature (document type, which derived fields are non-zero / non-default, applied effects by change type and source, load steps, burden, condition band, missing attributes, null / missing values, containers with contents, nested containers, quantity > 1, armor quality 0 / -1 / >= 1, armor locations, sunsign bonus hits, skill overrides, psionic, legacy-shaped data, rounding sites where round / floor / ceil / trunc would differ, and the min / max of every numeric expected field). A greedy set cover then picks cases until every feature present in the full set is covered (largest gain first, smaller input on ties), and a per-type pass adds cases until each document type has a few representatives (QUOTA) covering that type's own variety.
 *
 * Anonymization (world.* packs only; scarmark.* data ships publicly and is kept as is): actor name -> "<Type> <NN>"; embedded item names not found (case-insensitively) in any scarmark.* pack -> "<Type> item <NN>", consistently within the actor, including Active Effect change keys system.mods.skill.<name> (case-insensitive, as the code matches them); effect names -> "Effect <NN>"; free text (FREE_TEXT_FIELDS, and religion / magicType values not found in scarmark.* data) blanked; every _id (actor, items, effects, and references to them such as system.container) replaced by a deterministic fake id. Case ids are rebuilt from the fake id and the anonymized name.
 * Proof (fails loudly): for every anonymized case the adapter run on the anonymized input gives exactly the original expected values, after mapping the original ids to the fake ids and the renamed skill-mod keys (mods.skill) to the new names. Any string left in an anonymized case that is not public scarmark.* data, a generated name, a fake id, a number or a data path also fails the run.
 */

import "../support/foundry-stub.mjs";
import { readFile, writeFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { isDeepStrictEqual } from "node:util";
import { adapters } from "../golden/adapters.mjs";
import { normalize } from "../golden/run.mjs";
import { SCARMARK } from "../../module/config.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const GOLDEN_DIR = join(ROOT, "tests", "golden");
const LOCAL_DIR = join(GOLDEN_DIR, "local");
const DATA_DIR = join(LOCAL_DIR, "data");
const SOURCE = "executed:sample";

/** Representatives per document type after the global cover (more only when the cover itself needs them). */
const QUOTA = { actor: 3, item: 2 };

/** Actor system fields that hold free text no formula reads. */
const FREE_TEXT_FIELDS = ["race", "birthplace", "species", "dob.day", "dob.year"];
/** Item system string fields kept only when the value also occurs in the public scarmark.* data. */
const PUBLIC_VALUE_FIELDS = ["religion", "magicType"];

const SKILL_MOD_KEY = "system.mods.skill.";
const ATTRIBUTE_KEYS = Object.keys(SCARMARK.attributes);
const LEGACY_ATTRIBUTE_KEYS = [...Object.keys(SCARMARK.legacyAttributeMap), "mor"];
const LEGACY_LOCATION_KEYS = Object.keys(SCARMARK.legacyLocationMap);

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const pad = (n, w = 2) => String(n).padStart(w, "0");
const clone = (v) => JSON.parse(JSON.stringify(v));

/* ------------------------------------------------------------------ */
/* Features                                                            */
/* ------------------------------------------------------------------ */

/** Rounding sites: which other rounding of the raw value would give a different result than Math.round. */
function roundingFeatures(site, raw, out) {
  if (!Number.isFinite(raw)) return;
  const r = Math.round(raw);
  if (Math.floor(raw) !== r) out.add(`round:${site}:floor`);
  if (Math.ceil(raw) !== r) out.add(`round:${site}:ceil`);
  if (Math.trunc(raw) !== r) out.add(`round:${site}:trunc`);
}

/** Numeric / boolean / null leaves of an expected object; array elements share one path ("skills[].esl"). */
function leaves(value, path, out) {
  if (Array.isArray(value)) { for (const v of value) leaves(v, `${path}[]`, out); return; }
  if (value && typeof value === "object") { for (const [k, v] of Object.entries(value)) leaves(v, path ? `${path}.${k}` : k, out); return; }
  out.push([path, value]);
}

/** Leaf paths that carry ids or names, not values. */
const IGNORED_LEAF = /(^|\.)(id|appliedEffects)(\[\])?$|^mods\.skill\./;

function leafFeatures(expected, out) {
  const list = [];
  leaves(expected, "", list);
  for (const [path, v] of list) {
    if (IGNORED_LEAF.test(path)) continue;
    if (v === null) out.add(`null:${path}`);
    else if (typeof v === "boolean") { if (v) out.add(`true:${path}`); }
    else if (typeof v === "number") { if (v !== 0) out.add(`nz:${path}`); if (!Number.isInteger(v)) out.add(`frac:${path}`); }
    else if (typeof v === "string") out.add(`value:${path}=${v}`);
  }
  return list;
}

function itemFeatures(c) {
  const doc = c.input.document;
  const f = new Set([`type:${doc.type}`, `pack:${c.input.pack}`]);
  const s = doc.system ?? {};
  leafFeatures(c.expected, f);
  for (const k of Object.keys(c.expected.derived ?? {})) f.add(`derivedKey:${doc.type}.${k}`);
  for (const [k, v] of Object.entries(s)) {
    if (v === null || v === undefined) f.add(`inputNull:${doc.type}.${k}`);
  }
  if ((s.quantity ?? 1) > 1) f.add(`qty>1:${doc.type}`);
  if (s.quantity === 0) f.add(`qty0:${doc.type}`);
  if (typeof s.weight === "number" && !Number.isInteger(s.weight)) f.add(`fracWeight:${doc.type}`);
  if (typeof s.value === "number" && !Number.isInteger(s.value)) f.add(`fracValue:${doc.type}`);
  if (s.carried === false) f.add(`notCarried:${doc.type}`);
  if (doc.type === "armor") {
    f.add(`armorQuality:${s.quality === 0 ? "0" : s.quality < 0 ? "-1" : ">=1"}`);
    for (const l of s.locations ?? []) f.add(`armorLocation:${l}`);
    if ((s.locations ?? []).some(l => LEGACY_LOCATION_KEYS.includes(l))) f.add("legacy:armorLocationKey");
    f.add(`armorLayer:${s.layer}`);
  }
  if (doc.type === "armorLocation") {
    if (LEGACY_LOCATION_KEYS.includes(s.locationType)) f.add("legacy:locationType");
    if (Object.values(s.injury ?? {}).some(v => typeof v === "string")) f.add("legacy:injuryCode");
  }
  if (doc.type === "skill" || doc.type === "psionic") {
    f.add(`skillCategory:${s.category ?? "psionic"}`);
    if ([s.attribute1, s.attribute2, s.attribute3].some(a => LEGACY_ATTRIBUTE_KEYS.includes(a))) f.add("legacy:skillAttribute");
    if ((s.sunsignBonuses ?? []).length) f.add("sunsignBonuses");
  }
  if (doc.type === "injury") { if (s.heavyBleeding) f.add("injury:heavyBleeding"); if (s.vital) f.add(`injury:vital:${s.vital}`); }
  if (doc.type === "weapon" || doc.type === "missile") f.add(`associatedSkill:${doc.type}.${s.associatedSkill}`);
  if (doc.type === "missile") { f.add(`velocity:${s.velocity}`); f.add(`aspect:${s.aspect}`); }
  if (doc.type === "weapon" && s.isShield) f.add("weapon:shield");
  for (const e of doc.effects ?? []) {
    f.add(`itemEffect:${doc.type}`);
    if (e.disabled) f.add("itemEffect:disabled");
    if (!e.transfer) f.add("itemEffect:noTransfer");
    for (const ch of e.system?.changes ?? []) {
      f.add(`itemEffectChange:${ch.type}:${keyClass(ch.key)}`);
      if (typeof ch.value !== "number") f.add("itemEffectChange:nonNumericValue");
    }
  }
  return f;
}

/** Effect change key with the per-skill name generalized. */
const keyClass = (key) => (key?.startsWith(SKILL_MOD_KEY) ? `${SKILL_MOD_KEY}<name>` : key);

function actorFeatures(c) {
  const doc = c.input.document;
  const e = c.expected;
  const s = doc.system ?? {};
  const f = new Set([`type:${doc.type}`, `pack:${c.input.pack}`, `pack-type:${c.input.pack}.${doc.type}`]);
  const list = leafFeatures(e, f);

  // Values per actor type (min / max are global, below).
  for (const [path, v] of list) if (!IGNORED_LEAF.test(path) && typeof v === "number" && v !== 0) f.add(`nz:${doc.type}.${path}`);

  const items = doc.items ?? [];
  const byId = new Map(items.map(i => [i._id, i]));
  for (const i of items) {
    f.add(`hasItem:${i.type}`);
    const is = i.system ?? {};
    for (const [k, v] of Object.entries(is)) if (v === null || v === undefined) f.add(`itemNull:${i.type}.${k}`);
    if ((is.quantity ?? 1) > 1) { f.add(`qty>1:${i.type}`); f.add("qty>1"); if (is.carried !== false) f.add(`qty>1:carried:${i.type}`); }
    if (is.quantity === 0) f.add(`qty0:${i.type}`);
    if (typeof is.weight === "number" && !Number.isInteger(is.weight) && (is.quantity ?? 1) > 1) f.add("fracWeight*qty");
    if (is.carried === false) f.add(`notCarried:${i.type}`);
    if (is.container) {
      const parent = byId.get(is.container);
      if (!parent) f.add("container:danglingRef");
      else {
        f.add(`inContainer:${i.type}`);
        f.add(parent.system?.carried === false ? "container:storedWithContents" : "container:carriedWithContents");
        if (i.type === "container") f.add("container:nested");
        if (parent.system?.container) f.add("container:nestedContents");
      }
    }
    if (i.type === "armor") {
      const q = is.quality === 0 ? "0" : is.quality < 0 ? "-1" : ">=1";
      const worn = is.carried && !(is.container && byId.get(is.container));
      f.add(`armorQuality:${q}${worn ? ":worn" : ":notWorn"}`);
      for (const l of is.locations ?? []) f.add(`armorLocation:${l}${worn && is.quality !== 0 ? ":protecting" : ""}`);
      if ((is.locations ?? []).some(l => LEGACY_LOCATION_KEYS.includes(l))) f.add("legacy:armorLocationKey");
    }
    if (i.type === "armorLocation") {
      f.add(`locationType:${is.locationType}`);
      if (LEGACY_LOCATION_KEYS.includes(is.locationType)) f.add("legacy:locationType");
    }
    if ((i.type === "skill" || i.type === "psionic") && [is.attribute1, is.attribute2, is.attribute3].some(a => LEGACY_ATTRIBUTE_KEYS.includes(a))) f.add("legacy:skillAttribute");
    if (i.type === "injury") { f.add("injury"); if (is.heavyBleeding) f.add("injury:heavyBleeding"); if (is.vital) f.add(`injury:vital:${is.vital}`); }
    if (i.type === "psionic") f.add("psionic");
  }

  // Attributes: missing ones (creatures without pre), legacy keys.
  const attrs = s.attributes;
  if (!attrs) f.add("noAttributes");
  else {
    for (const k of ATTRIBUTE_KEYS) if (!attrs[k]) f.add(`missingAttribute:${k}`);
    for (const k of Object.keys(attrs)) if (LEGACY_ATTRIBUTE_KEYS.includes(k)) f.add("legacy:actorAttribute");
  }
  if (attrs && !s.resources) f.add("noResources");

  // Effects: applied ones by change type, key class and source; inactive ones.
  const active = new Set(e.appliedEffects ?? []);
  const effects = [...(doc.effects ?? []).map(x => ({ x, src: "actor" })), ...items.flatMap(i => (i.effects ?? []).map(x => ({ x, src: i.type })))];
  let fatigue = s.resources?.fatigue ?? 0;
  for (const { x, src } of effects) {
    if (!active.has(x._id)) { f.add(x.disabled ? "effect:disabled" : "effect:notTransferred"); continue; }
    f.add(`effect:applied:${src}`);
    for (const ch of x.system?.changes ?? []) {
      f.add(`effectChange:${ch.type}`);
      f.add(`effectChange:${ch.type}:${keyClass(ch.key)}`);
      f.add(`effectChange:${ch.type}:${src}`);
      if (ch.key === "system.resources.fatigue" && ch.type === "add") fatigue += ch.value;
      if (ch.type === "override" && ch.key?.startsWith(SKILL_MOD_KEY)) f.add("skillOverride");
    }
  }
  if (Object.keys(e.mods?.skill ?? {}).length) f.add("skillMod");

  if (e.condition) {
    f.add(`band:${e.condition.band}`);
    if (e.condition.vital) f.add(`vital:${e.condition.vital}`);
    const share = e.endurance > 0 ? e.condition.value / e.endurance : 0;
    if (SCARMARK.CONDITION_BANDS.some(b => b.max === share)) f.add("band:boundary");
    roundingFeatures("conditionPct", share * 100, f);
  }
  if (e.load) {
    f.add(`loadSteps:${e.load.steps}`);
    if (e.load.overMax) f.add("load:overMax");
    if (e.load.capacity > 0) roundingFeatures("loadPct", e.load.kg / e.load.capacity * 100, f);
    if (e.load.capacity > 0) {
      const over = Math.round((e.load.kg / e.load.capacity - 1) * 1000) / 1000;
      if (over > 0) roundingFeatures("loadSteps", over / SCARMARK.LOAD_STEP, f);
      if (over > 0 && Number.isInteger(Math.round(over / SCARMARK.LOAD_STEP * 1e6) / 1e6)) f.add("load:stepBoundary");
    }
    if (e.load.kg !== e.gearSummary.total) f.add("load:unitConversion");
    if (!Number.isInteger(e.gearSummary.total * 1000)) f.add("load:floatNoise");
  }
  if (e.fatiguePenalty !== undefined) {
    if (fatigue % 2) f.add("fatigue:odd");
    if (fatigue < 0) f.add("fatigue:negative");
  }
  if (e.effective) {
    const ef = e.effective;
    if (["str", "sta", "wil"].every(k => ef[k] !== null && ef[k] !== undefined)) roundingFeatures("endurance", (ef.str + ef.sta + ef.wil) / 3, f);
    if (attrs?.agl && e.move !== attrs.agl.base) f.add("move:penalized");
    for (const k of ATTRIBUTE_KEYS) if (attrs?.[k] && ef[k] !== attrs[k].base) f.add(`effective!=base:${k}`);
  }
  if (e.sunsign) f.add("sunsign:set");

  // Skills: sunsign hits, SB and SB-delta rounding, category / skill mods, missing attributes.
  for (const sk of e.skills ?? []) {
    const item = byId.get(sk.id);
    const is = item.system;
    const kind = item.type === "psionic" ? "psionic" : "skill";
    const keys = [is.attribute1, is.attribute2, is.attribute3].map(k => SCARMARK.legacyAttributeMap[k] ?? (k === "mor" ? "wil" : k));
    if (sk.sunsignBonus) f.add(`sunsignBonus:hit:${kind}`);
    if (keys.some(k => !attrs?.[k])) f.add(`skillOnMissingAttribute:${kind}`);
    else {
      roundingFeatures(`sb:${kind}`, keys.reduce((sum, k) => sum + attrs[k].base, 0) / 3, f);
      if (keys.every(k => e.effective[k] !== null && e.effective[k] !== undefined)) {
        const delta = keys.reduce((sum, k) => sum + (e.effective[k] - attrs[k].base), 0);
        if (delta) f.add(`sbDelta:${delta > 0 ? "pos" : "neg"}:${kind}`);
        roundingFeatures(`sbDelta:${kind}`, delta / 3 * 5, f);
      }
    }
    if (sk.esl === 0) f.add(`esl0:${kind}`);
  }
  for (const row of e.combatArmorLocations ?? []) if (row.layers >= 2) f.add("armorRow:layers>=2");
  return f;
}

/** Global min / max of every numeric expected leaf: a case attaining it covers that feature. */
function extremeFeatures(cases, kind) {
  const values = cases.map(c => { const l = []; leaves(c.expected, "", l); return l.filter(([p, v]) => typeof v === "number" && !IGNORED_LEAF.test(p)); });
  const min = {}, max = {};
  for (const list of values) for (const [p, v] of list) { min[p] = Math.min(min[p] ?? Infinity, v); max[p] = Math.max(max[p] ?? -Infinity, v); }
  cases.forEach((c, n) => {
    for (const [p, v] of values[n]) {
      if (v === min[p]) c.features.add(`min:${kind}:${p}`);
      if (v === max[p]) c.features.add(`max:${kind}:${p}`);
    }
  });
}

/* ------------------------------------------------------------------ */
/* Selection                                                           */
/* ------------------------------------------------------------------ */

/** Greedy set cover over `scope(feature, case)`; picks into `chosen`. `limit(c)` false = case not allowed now. */
function greedy(cases, chosen, wanted, scope, limit = () => true) {
  const covered = new Set();
  for (const c of chosen) for (const f of c.features) covered.add(scope(f, c));
  for (;;) {
    let best = null, gain = 0;
    for (const c of cases) {
      if (chosen.has(c) || !limit(c)) continue;
      let g = 0;
      for (const f of c.features) { const k = scope(f, c); if (wanted.has(k) && !covered.has(k)) g++; }
      if (g > gain || (g === gain && g > 0 && c.size < best.size)) { best = c; gain = g; }
    }
    if (!best) return;
    chosen.add(best);
    for (const f of best.features) covered.add(scope(f, best));
  }
}

function select(cases, quota) {
  const all = new Set(cases.flatMap(c => [...c.features]));
  const chosen = new Set();
  greedy(cases, chosen, all, f => f);
  const coverSize = chosen.size;
  // Per type: cover the type's own features again until the quota is reached.
  for (const type of [...new Set(cases.map(c => c.input.document.type))].sort()) {
    const ofType = cases.filter(c => c.input.document.type === type);
    const wanted = new Set(ofType.flatMap(c => [...c.features]));
    while (ofType.filter(c => chosen.has(c)).length < Math.min(quota, ofType.length)) {
      // Each round: a fresh cover of the type's features among cases not yet chosen, one case at a time.
      const fresh = new Set();
      greedy(ofType.filter(c => !chosen.has(c)), fresh, wanted, f => f, () => fresh.size === 0);
      const [next] = fresh.size ? fresh : [ofType.filter(c => !chosen.has(c)).sort((a, b) => a.size - b.size)[0]];
      chosen.add(next);
    }
  }
  const missing = [...all].filter(f => ![...chosen].some(c => c.features.has(f)));
  if (missing.length) throw new Error(`selection does not cover: ${missing.join(", ")}`);
  return { chosen: cases.filter(c => chosen.has(c)), features: all, coverSize };
}

/* ------------------------------------------------------------------ */
/* Anonymization                                                       */
/* ------------------------------------------------------------------ */

/** Every string in the public scarmark.* data and in the SCARMARK config (names, keys, enum values), plus every document / embedded item name. */
async function publicData() {
  const strings = new Set(), names = new Set(), lowerNames = new Set(), values = Object.fromEntries(PUBLIC_VALUE_FIELDS.map(k => [k, new Set()]));
  const walk = (v) => {
    if (typeof v === "string") strings.add(v);
    else if (v && typeof v === "object") for (const x of Object.values(v)) walk(x);
  };
  // Config keys and values (months, personalities, sunsigns, location types, ...): enum values the schemas accept.
  const seen = new Set();
  const walkConfig = (v) => {
    if (typeof v === "string") strings.add(v);
    else if (v && typeof v === "object" && !seen.has(v)) { seen.add(v); for (const [k, x] of Object.entries(v)) { strings.add(k); walkConfig(x); } }
  };
  walkConfig(SCARMARK);
  for (const file of (await readdir(DATA_DIR)).filter(n => n.startsWith("scarmark.") && n.endsWith(".json")).sort()) {
    for (const doc of JSON.parse(await readFile(join(DATA_DIR, file), "utf8"))) {
      walk(doc);
      for (const d of [doc, ...(doc.items ?? [])]) {
        names.add(d.name);
        lowerNames.add(String(d.name).toLowerCase());
        for (const k of PUBLIC_VALUE_FIELDS) if (typeof d.system?.[k] === "string") values[k].add(d.system[k]);
      }
    }
  }
  const isPublicName = (name) => lowerNames.has(String(name).toLowerCase());
  return { strings, names, values, isPublicName };
}

const getPath = (o, path) => path.split(".").reduce((x, k) => x?.[k], o);
function setPath(o, path, v) {
  const keys = path.split(".");
  const last = keys.pop();
  const t = keys.reduce((x, k) => x?.[k], o);
  if (t && last in t) t[last] = v;
}

/** Replace every string equal to a key of idMap, anywhere in value. */
function mapIds(value, idMap) {
  if (typeof value === "string") return idMap.get(value) ?? value;
  if (Array.isArray(value)) return value.map(v => mapIds(v, idMap));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, mapIds(v, idMap)]));
  return value;
}

/**
 * Anonymize one world.* actor case. `n` = 1-based number of this actor within its type in the sample.
 * Returns { input, idMap, renameSkillKey, generated } (generated = the new names and fake ids, for the leftover-string check).
 */
function anonymizeActor(c, n, pub) {
  const doc = clone(c.input.document);
  const actorNo = c.anonIndex;
  const idMap = new Map();
  const generated = new Set();
  const fake = (kind, k) => { const id = `anon${pad(actorNo, 3)}${kind}${pad(k, 5)}`; generated.add(id); return id; };
  idMap.set(doc._id, `anonActor${pad(actorNo, 3)}0000`);
  generated.add(idMap.get(doc._id));
  let itemNo = 0, effectNo = 0;
  for (const i of doc.items) idMap.set(i._id, fake("Item", ++itemNo));
  for (const x of [...doc.effects, ...doc.items.flatMap(i => i.effects)]) idMap.set(x._id, fake("Efct", ++effectNo));

  // Names: lower-cased original -> new name, shared by items and skill-mod keys.
  const nameMap = new Map();
  const counters = {};
  const rename = (original, type) => {
    if (pub.isPublicName(original)) return original;
    const lower = original.toLowerCase();
    if (!nameMap.has(lower)) {
      counters[type] = (counters[type] ?? 0) + 1;
      nameMap.set(lower, `${cap(type)} item ${pad(counters[type])}`);
      generated.add(nameMap.get(lower));
    }
    return nameMap.get(lower);
  };
  for (const i of doc.items) i.name = rename(i.name, i.type);
  const renameSkillKey = (key) => {
    if (!key?.startsWith(SKILL_MOD_KEY)) return key;
    const name = key.slice(SKILL_MOD_KEY.length);
    if (pub.isPublicName(name)) return key;
    return SKILL_MOD_KEY + rename(name, "skill");
  };
  effectNo = 0;
  for (const x of [...doc.effects, ...doc.items.flatMap(i => i.effects)]) {
    x.name = `Effect ${pad(++effectNo)}`;
    generated.add(x.name);
    for (const ch of x.system?.changes ?? []) ch.key = renameSkillKey(ch.key);
  }

  doc.name = `${cap(doc.type)} ${pad(n)}`;
  generated.add(doc.name);
  for (const path of FREE_TEXT_FIELDS) if (typeof getPath(doc.system, path) === "string") setPath(doc.system, path, "");
  for (const i of doc.items) {
    for (const k of PUBLIC_VALUE_FIELDS) if (typeof i.system?.[k] === "string" && i.system[k] && !pub.values[k].has(i.system[k])) i.system[k] = "";
  }
  const anonymized = mapIds(doc, idMap);
  return { input: { pack: c.input.pack, document: anonymized }, idMap, nameMap, renameSkillKey, generated };
}

/** Original expected -> what the anonymized input must give: ids mapped, renamed skill-mod keys (mods.skill) mapped. */
function mapExpected(expected, idMap, nameMap) {
  const out = mapIds(clone(expected), idMap);
  if (out.mods?.skill) {
    const renamed = {};
    for (const [k, v] of Object.entries(out.mods.skill)) {
      const key = nameMap.get(k.toLowerCase()) ?? k;
      if (key in renamed) throw new Error(`anonymization: mods.skill keys collide on ${key}`);
      renamed[key] = v;
    }
    out.mods.skill = renamed;
  }
  return out;
}

/** Every string left in an anonymized case must be public data, generated, a number or a plain data path. */
function leftoverStrings(value, pub, generated, path = "$", out = []) {
  if (typeof value === "string") {
    const ok = (s) => s === "" || pub.strings.has(s) || pub.isPublicName(s) || generated.has(s) || /^[+-]?\d+(\.\d+)?$/.test(s)
      || (s.startsWith(SKILL_MOD_KEY) && ok(s.slice(SKILL_MOD_KEY.length)))
      || /^system(\.[a-z][A-Za-z0-9]*)+$/.test(s);
    if (!ok(value)) out.push(`${path} = ${JSON.stringify(value)}`);
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      if (!Array.isArray(value) && !pub.strings.has(k) && !generated.has(k) && !/^_?[a-z][A-Za-z0-9]*$/.test(k)) out.push(`${path} key ${JSON.stringify(k)}`);
      leftoverStrings(v, pub, generated, `${path}.${k}`, out);
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

async function loadLocal(mechanic) {
  try {
    return JSON.parse(await readFile(join(LOCAL_DIR, `${mechanic}.json`), "utf8"));
  } catch (err) {
    throw new Error(`cannot read the local full set tests/golden/local/${mechanic}.json (${err.code ?? err.message}); import and capture it first, see tests/golden/README.md`);
  }
}

async function buildSample(mechanic, kind, featuresOf, pub) {
  const adapter = adapters[mechanic];
  const cases = await loadLocal(mechanic);
  // The local full set must match the current code, or the sample would freeze something else.
  for (const c of cases) {
    if (!isDeepStrictEqual(normalize(await adapter(clone(c.input))), c.expected)) throw new Error(`${mechanic}: local case ${c.id} no longer matches the current code; run npm run golden first`);
    c.features = featuresOf(c);
    c.size = JSON.stringify(c.input).length;
  }
  extremeFeatures(cases, kind);
  const { chosen, features, coverSize } = select(cases, QUOTA[kind]);

  const perType = {};
  const out = [];
  let anonIndex = 0;
  for (const c of chosen) {
    const type = c.input.document.type;
    perType[type] = (perType[type] ?? 0) + 1;
    if (!c.input.pack.startsWith("world.")) {
      out.push({ id: c.id, source: SOURCE, input: c.input, expected: c.expected });
      continue;
    }
    if (kind !== "actor") throw new Error(`${mechanic}: anonymization of world.* items is not implemented (${c.id})`);
    c.anonIndex = ++anonIndex;
    const n = out.filter(o => o.input.pack.startsWith("world.") && o.input.document.type === type).length + 1;
    const anon = anonymizeActor(c, n, pub);
    const actual = normalize(await adapter(clone(anon.input)));
    const want = mapExpected(c.expected, anon.idMap, anon.nameMap);
    if (!isDeepStrictEqual(actual, want)) throw new Error(`${mechanic}: anonymization changed the result of ${anon.input.document.name} (case ${out.length + 1}); refusing to write the sample`);
    const id = `${c.input.pack}/${anon.input.document._id}/${anon.input.document.name}`;
    const leftovers = leftoverStrings(anon.input.document, pub, anon.generated);
    if (leftovers.length) throw new Error(`${mechanic}: non-public text left in ${anon.input.document.name}: ${leftovers.slice(0, 5).join("; ")}`);
    out.push({ id, source: SOURCE, input: anon.input, expected: actual, anonymized: true });
  }
  const proven = out.filter(o => o.anonymized).length;
  for (const o of out) delete o.anonymized;
  return { out, perType, features, coverSize, full: cases.length, proven };
}

/**
 * Leak check: the private strings of the local world.* data (actor, item and effect names and ids not in the public data, free text; plain numbers skipped) must not occur in the committed samples: no string value or key of a sample that is not itself public may equal or contain one as a whole word (fails). Every other git-tracked file is searched for them as whole words, hits listed for review (world names that are common words, e.g. "GM", also occur in code).
 */
async function leakCheck(pub) {
  const priv = new Set();
  const add = (v) => { if (typeof v === "string" && v && !/^\d+$/.test(v) && !pub.strings.has(v) && !pub.isPublicName(v)) priv.add(v); };
  for (const file of (await readdir(DATA_DIR)).filter(n => n.startsWith("world.") && n.endsWith(".json"))) {
    for (const a of JSON.parse(await readFile(join(DATA_DIR, file), "utf8"))) {
      add(a.name);
      add(a._id);
      for (const path of FREE_TEXT_FIELDS) add(getPath(a.system, path));
      for (const i of a.items ?? []) {
        add(i.name);
        add(i._id);
        for (const k of PUBLIC_VALUE_FIELDS) add(i.system?.[k]);
      }
      for (const x of [...(a.effects ?? []), ...(a.items ?? []).flatMap(i => i.effects ?? [])]) { add(x.name); add(x._id); }
    }
  }
  const samples = ["compendium-items-sample.json", "compendium-actors-sample.json"].map(n => join("tests", "golden", n));
  const tracked = execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8" }).split("\n").filter(Boolean);
  const files = [...new Set([...tracked, ...samples])].sort();
  const escape = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [...priv].map(p => [p, new RegExp(`(^|[^A-Za-z0-9])${escape(p)}($|[^A-Za-z0-9])`)]);
  const sampleHits = [], review = {};
  for (const file of samples) {
    const strings = new Set();
    const walk = (v) => {
      if (typeof v === "string") strings.add(v);
      else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) { strings.add(k); walk(x); }
    };
    walk(JSON.parse(await readFile(join(ROOT, file), "utf8")));
    for (const str of strings) {
      if (pub.strings.has(str) || pub.isPublicName(str)) continue;
      for (const [p, re] of patterns) if (str.includes(p) && re.test(str)) sampleHits.push(`${file}: ${JSON.stringify(p)} in ${JSON.stringify(str)}`);
    }
  }
  for (const file of files.filter(f => !samples.includes(f))) {
    const text = await readFile(join(ROOT, file), "utf8").catch(() => null);
    if (text === null) continue;
    for (const [p, re] of patterns) if (text.includes(p) && re.test(text)) (review[p] ??= []).push(file);
  }
  console.log(`leak check: ${priv.size} private strings of the world.* data searched in ${files.length} files (git ls-files + samples)`);
  console.log(`  in the samples: ${sampleHits.length ? sampleHits.join("; ") : "none"}`);
  const list = Object.entries(review);
  console.log(`  whole-word hits elsewhere (review): ${list.length ? list.map(([p, f]) => `${JSON.stringify(p)} in ${f.join(", ")}`).join("; ") : "none"}`);
  if (sampleHits.length) throw new Error("leak check: private strings in the committed sample");
}

async function main(argv) {
  const dryRun = argv.includes("--dry-run");
  const pub = await publicData();
  const results = {
    "compendium-items": await buildSample("compendium-items", "item", itemFeatures, pub),
    "compendium-actors": await buildSample("compendium-actors", "actor", actorFeatures, pub)
  };
  for (const [mechanic, r] of Object.entries(results)) {
    const target = join(GOLDEN_DIR, `${mechanic}-sample.json`);
    const groups = {};
    for (const f of r.features) { const g = f.split(":")[0]; groups[g] = (groups[g] ?? 0) + 1; }
    console.log(`${mechanic}: ${r.out.length} of ${r.full} cases (${r.coverSize} from the feature cover, ${r.out.length - r.coverSize} from the per-type quota), all ${r.features.size} features covered, ${r.proven} anonymized cases proven equal to the original expected values`);
    console.log(`  by type ${JSON.stringify(r.perType)}`);
    console.log(`  features by kind ${JSON.stringify(groups)}`);
    if (!dryRun) {
      await writeFile(target, `${JSON.stringify(r.out, null, 2)}\n`);
      console.log(`  -> ${target}`);
    }
  }
  if (!dryRun) await leakCheck(pub);
}

main(process.argv.slice(2)).catch(err => { console.error(err.message); process.exitCode = 1; });
