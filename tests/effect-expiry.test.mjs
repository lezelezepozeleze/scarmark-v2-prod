// scarmarkEffectExpired decides which timed effects the sweep deletes: a Consume stamp, or the raw start plus duration.
import { test } from "node:test";
import assert from "node:assert";
import { scarmarkEffectExpired } from "../module/foundry/effect-expiry.mjs";

const effect = (source, stamp) => ({ flags: stamp === undefined ? {} : { "scarmark": { expireWorldTime: stamp } }, _source: source });

test("effect expiry: a Consume stamp expires at or after that world time", () => {
  assert.deepStrictEqual([99, 100, 101].map(t => scarmarkEffectExpired(effect({}, 100), t)), [false, true, true]);
});

test("effect expiry: without a stamp it is start + duration", () => {
  const e = effect({ start: { time: 1000 }, duration: { value: 2, units: "hours" } });
  assert.deepStrictEqual([1000 + 7199, 1000 + 7200].map(t => scarmarkEffectExpired(e, t)), [false, true]);
});

test("effect expiry: permanent effects and combat (rounds) durations are left to Foundry", () => {
  assert.strictEqual(scarmarkEffectExpired(effect({ start: { time: 0 }, duration: {} }), 1e9), false);
  assert.strictEqual(scarmarkEffectExpired(effect({ start: { time: 0 }, duration: { value: 3, units: "rounds" } }), 1e9), false);
  assert.strictEqual(scarmarkEffectExpired(effect({ duration: { value: 1, units: "hours" } }), 1e9), false, "no start, no expiry");
});
