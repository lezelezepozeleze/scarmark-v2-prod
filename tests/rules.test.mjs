// Plain unit tests for the pure functions in module/rules/. The golden fixtures cover the same mechanics through the real code paths; these pin the edge cases of each rule directly.
import { test } from "node:test";
import assert from "node:assert";
import { skillBase, shockTarget, protectionSum, outnumberedPenaltyFor, strikeDice, itemTotals, containerLoad, durationSeconds } from "../module/rules/index.mjs";

test("itemTotals: multiplies per-unit weight and value by quantity", () => {
  assert.deepStrictEqual(itemTotals(2.5, 10, 3), { totalWeight: 7.5, totalValue: 30 });
  assert.deepStrictEqual(itemTotals(2.5, 10, 0), { totalWeight: 0, totalValue: 0 });
  assert.deepStrictEqual(itemTotals(0, 0, 5), { totalWeight: 0, totalValue: 0 });
});

test("skillBase: rounded average of the three attribute bases, 0 without an actor", () => {
  const attrs = { str: { base: 10 }, dex: { base: 11 }, wil: { base: 12 } };
  assert.strictEqual(skillBase(attrs, ["str", "dex", "wil"]), 11);
  assert.strictEqual(skillBase(attrs, ["str", "str", "dex"]), 10);
  assert.strictEqual(skillBase(attrs, ["str", "dex", "dex"]), 11);
  assert.strictEqual(skillBase(attrs, ["str", "missing", "missing"]), 3);
  assert.strictEqual(skillBase(undefined, ["str", "dex", "wil"]), 0);
});

test("shockTarget: 2 x condition percent, never below 0, capped", () => {
  assert.strictEqual(shockTarget(25, 95), 50);
  assert.strictEqual(shockTarget(0, 95), 0);
  assert.strictEqual(shockTarget(100, 95), 95);
  assert.strictEqual(shockTarget(-5, 95), 0);
});

test("protectionSum: adds one aspect, a missing value counts as 0", () => {
  const pieces = [{ system: { protection: { blunt: 2, edged: 3 } } }, { system: { protection: { blunt: 1 } } }, { system: {} }];
  assert.strictEqual(protectionSum(pieces, "blunt"), 3);
  assert.strictEqual(protectionSum(pieces, "edged"), 3);
  assert.strictEqual(protectionSum(pieces, "fire"), 0);
  assert.strictEqual(protectionSum([], "blunt"), 0);
});

test("outnumberedPenaltyFor: exactly 2 is 20, 3 or more is 30, otherwise 0", () => {
  assert.deepStrictEqual([0, 1, 2, 3, 4, 9].map(outnumberedPenaltyFor), [0, 0, 20, 30, 30, 30]);
  assert.strictEqual(outnumberedPenaltyFor(2.5), 0);
  assert.strictEqual(outnumberedPenaltyFor(1.5), 0);
});

test("strikeDice: a critical success rolls 3, any other level 2", () => {
  assert.deepStrictEqual(["cs", "ms", "mf", "cf"].map(strikeDice), [3, 2, 2, 2]);
});

test("containerLoad: sums stored totalWeight, over only when strictly above capacity", () => {
  const contents = [{ system: { totalWeight: 2 } }, { system: { totalWeight: 3.5 } }, { system: {} }];
  assert.deepStrictEqual(containerLoad(contents, 10), { contentWeight: 5.5, overCapacity: false });
  assert.deepStrictEqual(containerLoad(contents, 5.5), { contentWeight: 5.5, overCapacity: false });
  assert.deepStrictEqual(containerLoad(contents, 5), { contentWeight: 5.5, overCapacity: true });
  assert.deepStrictEqual(containerLoad([], 0), { contentWeight: 0, overCapacity: false });
});

test("durationSeconds: world-time units in seconds, null for rounds, turns and empty durations", () => {
  assert.strictEqual(durationSeconds({ value: 2, units: "minutes" }), 120);
  assert.strictEqual(durationSeconds({ value: 1, units: "weeks" }), 604800);
  assert.strictEqual(durationSeconds({ value: 3, units: "seconds" }), 3);
  assert.strictEqual(durationSeconds({ value: 1, units: "rounds" }), null);
  assert.strictEqual(durationSeconds({ value: 0, units: "hours" }), null);
  assert.strictEqual(durationSeconds({ value: -1, units: "hours" }), null);
  assert.strictEqual(durationSeconds(undefined), null);
});

import { vitalWoundFor, severityKey, injuryFor, mendLabel, stunProtectionBonus, spellLevelPenalty, invocationPenalty, rangedBlockShields, locationKey, covers } from "../module/rules/index.mjs";

test("vitalWoundFor: only Dire and Mortal wounds to head, neck, chest, belly are vital; legacy keys count", () => {
  assert.strictEqual(vitalWoundFor("head", 3), "");
  assert.strictEqual(vitalWoundFor("head", 4), "out");
  assert.strictEqual(vitalWoundFor("belly", 5), "dying");
  assert.strictEqual(vitalWoundFor("belly", 9), "dying");
  assert.strictEqual(vitalWoundFor("skull", 4), "out");
  assert.strictEqual(vitalWoundFor("arm", 5), "");
});

test("severityKey, injuryFor, mendLabel", () => {
  assert.deepStrictEqual([0, 1, 2, 3, 4, 5, 6].map(severityKey), ["light", "light", "heavy", "severe", "dire", "mortal", "mortal"]);
  assert.strictEqual(injuryFor("edged", 4).name, "Dire Cut");
  assert.strictEqual(injuryFor("edged", 99).name, "Mortal Cut");
  assert.strictEqual(injuryFor("blunt", 0).name, "Bruise");
  assert.strictEqual(injuryFor("nope", 2), null);
  assert.deepStrictEqual([0, 1, 6, "x"].map(mendLabel), ["MRN", "1", "6", "MRN"]);
});

test("stunProtectionBonus: layer 5 and up +20, 2 to 4 +10, otherwise 0", () => {
  assert.deepStrictEqual([undefined, 0, 1, 2, 4, 5, 6].map(stunProtectionBonus), [0, 0, 0, 10, 10, 20, 20]);
});

test("spellLevelPenalty and invocationPenalty: 5 per step", () => {
  assert.deepStrictEqual([1, 2, 6, undefined].map(spellLevelPenalty), [0, 5, 25, 0]);
  assert.deepStrictEqual([1, 5].map(invocationPenalty), [5, 25]);
});

test("rangedBlockShields: the Buckler only blocks low-velocity missiles, and the result is a fresh array", () => {
  assert.ok(rangedBlockShields("low").includes("Buckler"));
  assert.ok(!rangedBlockShields("high").includes("Buckler"));
  assert.notStrictEqual(rangedBlockShields("high"), rangedBlockShields("high"));
});

test("locationKey and covers: legacy location keys are read as the type they became", () => {
  assert.strictEqual(locationKey("skull"), "head");
  assert.strictEqual(locationKey("head"), "head");
  assert.strictEqual(covers(new Set(["face"]), "head"), true);
  assert.strictEqual(covers(new Set(["arm"]), "head"), false);
  assert.strictEqual(covers(null, "head"), false);
});

import { capTarget, outcomeLevel, spellTarget, invocationTarget, invocationFpCost, spellFatigue, mendWoundLevelDelta, injuryLevelFor, armorAfterPiercing, armorWears, pickWeighted, dodgeVsMissile } from "../module/rules/index.mjs";

test("capTarget and outcomeLevel: cap at 95, a multiple of 5 is critical", () => {
  assert.deepStrictEqual([50, 95, 96, 140].map(capTarget), [50, 95, 95, 95]);
  assert.deepStrictEqual([[5, 50], [7, 50], [55, 50], [57, 50], [100, 95], [96, 95]].map(([r, t]) => outcomeLevel(r, t)), ["cs", "ms", "cf", "mf", "cf", "mf"]);
});

test("spellTarget and invocationTarget: skill ESL minus the step, never below 0, uncapped", () => {
  assert.deepStrictEqual([[110, 1], [110, 3], [4, 6]].map(([e, l]) => spellTarget(e, l)), [110, 100, 0]);
  assert.deepStrictEqual([[110, 2], [20, 5]].map(([e, c]) => invocationTarget(e, c)), [100, 0]);
});

test("outcome tables: invocation FP cost, spell fatigue, mend delta", () => {
  assert.deepStrictEqual(["cs", "ms", "mf", "cf"].map(l => invocationFpCost(l, 3)), [0, 3, 0, 3]);
  assert.deepStrictEqual(["cs", "ms", "mf", "cf"].map(spellFatigue), [0, 0, 1, 2]);
  assert.deepStrictEqual(["cs", "ms", "mf", "cf"].map(mendWoundLevelDelta), [-2, -1, 0, 1]);
});

test("injuryLevelFor: the highest threshold the impact reaches, 0 below 1, a missing threshold is 0", () => {
  const inj = { t1: 1, t5: 2, t9: 3, t13: 4, t17: 5 };
  assert.deepStrictEqual([0, 1, 4, 5, 8, 9, 12, 13, 16, 17, 40].map(i => injuryLevelFor(inj, i)), [0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
  assert.strictEqual(injuryLevelFor({ t1: 1 }, 20), 0);
});

test("armorAfterPiercing, armorWears, dodgeVsMissile, pickWeighted", () => {
  assert.deepStrictEqual([0, 1, 5, 7].map(armorAfterPiercing), [0, 0, 2, 3]);
  assert.deepStrictEqual([0, 0.49, 0.5, 0.99].map(armorWears), [true, true, false, false]);
  assert.deepStrictEqual([["high", 9], ["low", 9], [undefined, 9]].map(([v, d]) => dodgeVsMissile(d, v)), [4, 9, 9]);
  assert.deepStrictEqual([0, 0.1, 0.49, 0.5, 0.99].map(r => pickWeighted([1, 1], r)), [0, 0, 0, 1, 1]);
  assert.strictEqual(pickWeighted([0, 3, 0], 0.5), 1);
  assert.strictEqual(pickWeighted([0, 3, 0], 0), 1, "a zero-weight leading bucket is never picked");
  assert.strictEqual(pickWeighted([0, 3, 0], 1), 1, "random 1 does not land on a zero-weight trailing bucket");
});

import { enduranceOf, loadState, conditionState } from "../module/rules/index.mjs";

test("enduranceOf: rounded average plus the mod, never below 0", () => {
  assert.strictEqual(enduranceOf([10, 11, 12]), 11);
  assert.strictEqual(enduranceOf([10, 10, 11], 2), 12);
  assert.strictEqual(enduranceOf([1, 1, 1], -5), 0);
});

test("loadState: AGL steps per started 20 percent over capacity, at most 5, 999 percent when capacity is 0", () => {
  assert.deepStrictEqual(loadState(30, 30), { share: 1, steps: 0, pct: 100, max: 60, overMax: false });
  assert.strictEqual(loadState(36, 30).steps, 1);
  assert.strictEqual(loadState(36.1, 30).steps, 2);
  assert.strictEqual(loadState(59, 30).steps, 5);
  assert.strictEqual(loadState(61, 30).overMax, true);
  assert.deepStrictEqual(loadState(5, 0), { share: Infinity, steps: 5, pct: 999, max: 0, overMax: true });
  assert.deepStrictEqual(loadState(0, 0), { share: 0, steps: 0, pct: 0, max: 0, overMax: false });
});

test("conditionState: bands at 50 and 25 percent of Endurance, out or dying at 0", () => {
  assert.deepStrictEqual(conditionState(20, 20, ""), { share: 1, band: "ok", penalty: 0 });
  assert.deepStrictEqual(conditionState(10, 20, ""), { share: 0.5, band: "wounded", penalty: 1 });
  assert.deepStrictEqual(conditionState(5, 20, ""), { share: 0.25, band: "critical", penalty: 2 });
  assert.deepStrictEqual(conditionState(0, 20, ""), { share: 0, band: "out", penalty: 2 });
  assert.deepStrictEqual(conditionState(0, 20, "dying"), { share: 0, band: "dying", penalty: 2 });
  assert.deepStrictEqual(conditionState(0, 0, ""), { share: 0, band: "out", penalty: 2 });
});

// The Skill Base delta was replaced by the fixed skill penalty in 1.0.53 (tests/derived-rules.test.mjs: skillPenaltyOf).
