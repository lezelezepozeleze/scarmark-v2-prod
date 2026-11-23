// Pure helpers behind the actor sheet behaviors: number and durability format.
import { test } from "node:test";
import assert from "node:assert";
import { formatNumber, durabilityText } from "../module/view/format.mjs";

test("formatNumber: at most 3 decimals without trailing zeros, '-' when missing", () => {
  assert.deepStrictEqual([2.5, 4, "4", 0, 0.1254, "0.25"].map(formatNumber), ["2.5", "4", "4", "0", "0.125", "0.25"]);
  assert.deepStrictEqual([null, undefined, "", "  ", "x", NaN, Infinity].map(formatNumber), ["-", "-", "-", "-", "-", "-", "-"]);
});

test("durabilityText: current over original, a dash when the original is not set", () => {
  assert.deepStrictEqual([[5, 10], [5, 0], [5, undefined], [-1, 3], [0, 8], [null, 4]].map(([q, o]) => durabilityText(q, o)), ["5/10", "5/-", "5/-", "-1/3", "0/8", "-/4"]);
});
