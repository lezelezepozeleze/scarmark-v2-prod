// The CONFIG.SCARMARK contract (docs/AGENTS.md "Persisted contract"): every key, value and function result must stay the same.
// The snapshot was captured from module/config.mjs before the values moved to module/config/ and the calculations to module/rules/.
// Never regenerate it to make a failing comparison pass; only a deliberate, approved addition may change it.
import { test } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { SCARMARK } from "../module/config.mjs";

const snapshot = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "config", "scarmark.snapshot.json"), "utf8"));

const probe = (S) => {
  const out = {};
  for (const [k, v] of Object.entries(S)) {
    if (typeof v === "function") continue;
    out[k] = v instanceof RegExp ? { regex: v.source, flags: v.flags } : v;
  }
  const locs = ["head", "neck", "chest", "belly", "arm", "skull", "thorax", "creatureThorax", "nope"];
  out.__fn = {
    keys: Object.keys(S).sort(),
    vitalWoundFor: locs.flatMap(l => [0, 3, 4, 5, 6].map(n => [l, n, S.vitalWoundFor(l, n)])),
    severityKey: [-1, 0, 1, 2, 3, 4, 5, 9].map(n => S.severityKey(n)),
    injuryFor: ["blunt", "edged", "piercing", "fire", "x"].flatMap(a => [0, 1, 3, 5, 7].map(n => [a, n, S.injuryFor(a, n)])),
    mendLabel: [0, 1, 6, "3", "x", undefined].map(n => S.mendLabel(n)),
    locationKey: locs.map(l => S.locationKey(l)),
    covers: locs.flatMap(a => ["head", "arm", "chest", "belly", "shin"].map(t => [a, t, S.covers(new Set([a]), t)])).concat([[null, "head", S.covers(null, "head")]]),
    stun: [undefined, 0, 1, 2, 3, 4, 5, 6].map(n => S.stunProtectionBonus(n)),
    spell: [undefined, 0, 1, 2, 6, "3", 7].map(n => S.spellLevelPenalty(n)),
    shields: ["low", "high", undefined].map(v => S.rangedBlockShields(v)),
    weightUnitsPerKg: S.weightUnitsPerKg()
  };
  return out;
};

test("SCARMARK: every key, value and function result matches the captured contract", () => {
  assert.deepStrictEqual(JSON.parse(JSON.stringify(probe(SCARMARK))), snapshot);
});

test("SCARMARK: missileSkills is the same object as combatSkills", () => {
  assert.strictEqual(SCARMARK.missileSkills, SCARMARK.combatSkills);
});

import { EFFECT_PICKER_GROUPS, EFFECT_KEYS, SKILL_CATEGORIES } from "../module/config/index.mjs";

test("effect picker: offers exactly the keys of SCARMARK.effectKeys, once each", () => {
  const keys = EFFECT_PICKER_GROUPS.flatMap(g => g.options.map(o => o[0]));
  assert.strictEqual(new Set(keys).size, keys.length);
  assert.deepStrictEqual([...keys].sort(), Object.keys(EFFECT_KEYS).sort());
});

test("effect keys: one skill bucket per skill category plus psionic", () => {
  const buckets = Object.keys(EFFECT_KEYS).filter(k => k.startsWith("system.mods.skills.")).map(k => k.split(".").pop());
  assert.deepStrictEqual(buckets.sort(), [...SKILL_CATEGORIES, "psionic"].sort());
});
