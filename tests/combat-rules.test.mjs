// rangeBand and the outcome rules (moved from helpers/combat to rules/): the golden resolve-outcome fixture pins resolveOutcome; these pin the two small ones.
import { test } from "node:test";
import assert from "node:assert";
import { rangeBand, isBlockResult } from "../module/rules/index.mjs";

test("rangeBand: the first band whose threshold the distance is within, null beyond extreme", () => {
  const range = { short: 5, medium: 10, long: 20, extreme: 40 };
  assert.deepStrictEqual([0, 5, 6, 10, 11, 20, 21, 40, 41].map(d => rangeBand(range, d)), ["short", "short", "medium", "medium", "long", "long", "extreme", "extreme", null]);
});

test("isBlockResult: only a successful attack stopped by a successful block of the same level", () => {
  assert.strictEqual(isBlockResult("ms", "ms"), true);
  assert.strictEqual(isBlockResult("cs", "cs"), true);
  assert.strictEqual(isBlockResult("cs", "ms"), false, "a mere MS block of a CS blow is not a clash");
  assert.strictEqual(isBlockResult("mf", "mf"), false, "a failed attack never reached the defender");
  assert.strictEqual(isBlockResult("ms", "cf"), false);
});
