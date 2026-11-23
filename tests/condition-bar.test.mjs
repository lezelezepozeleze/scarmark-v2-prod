// The Condition bar width in the sheet header is the Condition percentage held to 0-100.
import { test } from "node:test";
import assert from "node:assert";
import { conditionBarPct } from "../module/view/actor-view.mjs";

test("conditionBarPct: keeps 0-100, clamps outside values, 0 for a missing or broken value", () => {
  assert.deepStrictEqual([58, 0, 100, 140, -20, "40", undefined, null, NaN].map(conditionBarPct), [58, 0, 100, 100, 0, 40, 0, 0, 0]);
});
