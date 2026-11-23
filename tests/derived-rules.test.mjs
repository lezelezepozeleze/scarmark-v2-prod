// The pure pieces of the derived actor stats (rules/derived.mjs) that applyDerivedCombat calls; the whole chain stays pinned by the golden actor-derived fixture.
import { test } from "node:test";
import assert from "node:assert";
import { fatiguePenaltyOf, loadKgOf, woundLevelOf, worstVital, conditionOf, effectiveAttribute, skillEslOf, skillPenaltyOf } from "../module/rules/index.mjs";

test("fatigue penalty: 1 per FATIGUE_STEP (2), a negative or missing fatigue is 0", () => {
  assert.deepStrictEqual([undefined, -3, 0, 1, 2, 3, 4, 9].map(fatiguePenaltyOf), [0, 0, 0, 0, 1, 1, 2, 4]);
});

test("load kg: stored units to kg, rounded to a gram", () => {
  assert.strictEqual(loadKgOf(10, 2), 5);
  assert.strictEqual(loadKgOf(1, 3), 0.333);
});

test("wound level: sum of the injuries plus the Injury mod, never below 0", () => {
  assert.strictEqual(woundLevelOf([1, 2, undefined], 0), 3);
  assert.strictEqual(woundLevelOf([1], 2), 3);
  assert.strictEqual(woundLevelOf([1], -5), 0);
  assert.strictEqual(woundLevelOf([]), 0);
});

test("worst vital: dying beats out beats none; unknown values count as none", () => {
  assert.strictEqual(worstVital([]), "");
  assert.strictEqual(worstVital(["", "out"]), "out");
  assert.strictEqual(worstVital(["out", "dying", "out"]), "dying");
  assert.strictEqual(worstVital([undefined, "bogus"]), "");
});

test("condition: 0 with a vital wound, else endurance minus WL, never below 0", () => {
  assert.deepStrictEqual([conditionOf(10, 3, ""), conditionOf(10, 30, ""), conditionOf(10, 0, "out")], [7, 0, 0]);
});

test("effective attribute: fatigue hits all, load steps AGL, the wound penalty DEX and AGL", () => {
  const p = { fatiguePenalty: 1, loadSteps: 2, woundPenalty: 3 };
  assert.deepStrictEqual(["str", "dex", "agl"].map(k => effectiveAttribute(k, 10, p)), [9, 6, 4]);
  assert.strictEqual(effectiveAttribute("agl", 2, p), 0, "never below 0");
});

test("skill ESL: the sum, never below 0, and an Override replaces it", () => {
  const base = { level: 10, sunsignBonus: 5, categoryMod: -2, skillMod: 1, penalty: 3 };
  assert.strictEqual(skillEslOf(base), 11, "the fixed skill penalty is subtracted");
  assert.strictEqual(skillEslOf({ ...base, level: -50 }), 0);
  assert.strictEqual(skillEslOf({ ...base, override: 40 }), 40);
  assert.strictEqual(skillEslOf({ ...base, override: 0 }), 0, "an Override of 0 still replaces the sum");
});

test("skill penalty: 5 ESL per point of fatigue steps + load steps + wound band points, the same for every skill", () => {
  assert.strictEqual(skillPenaltyOf({ fatiguePenalty: 0, loadSteps: 0, woundPenalty: 0 }), 0);
  assert.strictEqual(skillPenaltyOf({ fatiguePenalty: 2, loadSteps: 0, woundPenalty: 1 }), 15, "Fatigue 4 and Condition at 46 % = -10 -5");
  assert.strictEqual(skillPenaltyOf({ fatiguePenalty: 1, loadSteps: 5, woundPenalty: 2 }), 40);
});
