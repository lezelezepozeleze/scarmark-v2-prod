// Unit tests for the rules that were once inline in helpers/combat and helpers/dice: hit location weights, forced test kind, Impact bonus, Mend and Psionic targets.
import { test } from "node:test";
import assert from "node:assert";
import { locationWeights, strikeLocationIndex, fumbleStumbleKind, impactBonusFor, mendTarget, psionicTarget } from "../module/rules/index.mjs";

const loc = (type, aim) => ({ type, aim });

test("locationWeights: a sided pair splits the weight, a missing zone falls back to medium", () => {
  const list = [loc("shoulder", { high: 10, medium: 6 }), loc("shoulder", { high: 10, medium: 6 }), loc("head", { high: 8, medium: 2 }), loc("belly", {}), loc("arm", undefined)];
  assert.deepStrictEqual(locationWeights(list, "high"), [5, 5, 8, 0, 0]);
  assert.deepStrictEqual(locationWeights(list, "medium"), [3, 3, 2, 0, 0]);
  assert.deepStrictEqual(locationWeights(list, "low"), [3, 3, 2, 0, 0]);
  assert.deepStrictEqual(locationWeights(list), [3, 3, 2, 0, 0]);
});

test("strikeLocationIndex: weighted pick with the injected random, first when all weights are 0, random untouched then", () => {
  const list = [loc("a", { medium: 1 }), loc("b", { medium: 3 })];
  assert.strictEqual(strikeLocationIndex(list, "medium", () => 0), 0);
  assert.strictEqual(strikeLocationIndex(list, "medium", () => 0.24), 0);
  assert.strictEqual(strikeLocationIndex(list, "medium", () => 0.25), 1);
  let calls = 0;
  assert.strictEqual(strikeLocationIndex([loc("a", {}), loc("b", {})], "medium", () => { calls++; return 0.9; }), 0);
  assert.strictEqual(calls, 0);
});

test("fumbleStumbleKind: hand from WL 1, arm from WL 3, thigh and shin stumble, old keys mapped", () => {
  assert.strictEqual(fumbleStumbleKind("hand", 1), "fumble");
  assert.strictEqual(fumbleStumbleKind("arm", 2), null);
  assert.strictEqual(fumbleStumbleKind("arm", 3), "fumble");
  assert.strictEqual(fumbleStumbleKind("thigh", 1), "stumble");
  assert.strictEqual(fumbleStumbleKind("shin", 4), "stumble");
  assert.strictEqual(fumbleStumbleKind("chest", 5), null);
  assert.strictEqual(fumbleStumbleKind("hand", 0), null);
});

test("impactBonusFor: only Close and Unarmed strikes take the modifier", () => {
  assert.strictEqual(impactBonusFor("close", 2), 2);
  assert.strictEqual(impactBonusFor("unarmed", -1), -1);
  assert.strictEqual(impactBonusFor("ranged", 2), 0);
  assert.strictEqual(impactBonusFor("arcane", 2), 0);
  assert.strictEqual(impactBonusFor(null, 2), 0);
});

test("mendTarget: Endurance times the Mend Rate", () => {
  assert.strictEqual(mendTarget(12, 3), 36);
  assert.strictEqual(mendTarget(0, 5), 0);
});

test("psionicTarget: ESL plus modifier, never below 0, a missing modifier counts as 0", () => {
  assert.strictEqual(psionicTarget(40, 10), 50);
  assert.strictEqual(psionicTarget(40, -60), 0);
  assert.strictEqual(psionicTarget(40, undefined), 40);
  assert.strictEqual(psionicTarget(0, 0), 0);
});
