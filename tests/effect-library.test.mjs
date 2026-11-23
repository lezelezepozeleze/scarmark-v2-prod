// stampEffectData is what Consume and the Add menu put on an actor: enabled, not transferred, countdown started, expiry stamped.
import { test } from "node:test";
import assert from "node:assert";
import { stampEffectData } from "../module/helpers/effect-library.mjs";

const source = { _id: "abc", name: "Tipsy (II)", disabled: true, transfer: true, duration: { value: 3, units: "hours" }, flags: { other: { x: 1 } } };

test("effect library: a stamped copy is enabled, local, started now and expires after its duration", () => {
  const data = stampEffectData(source, { now: 1000, origin: "Item.xyz" });
  assert.strictEqual(data._id, undefined);
  assert.strictEqual(data.disabled, false);
  assert.strictEqual(data.transfer, false);
  assert.strictEqual(data.origin, "Item.xyz");
  assert.strictEqual(data.start.time, 1000);
  assert.strictEqual(data.flags["scarmark"].expireWorldTime, 1000 + 3 * 3600);
  assert.deepStrictEqual(data.flags.other, { x: 1 });
  assert.strictEqual(source._id, "abc", "the source is not modified");
});

test("effect library: without a world time there is no start and no stamp; permanent effects get no stamp", () => {
  const noTime = stampEffectData(source, { now: null });
  assert.strictEqual(noTime.start, undefined);
  assert.strictEqual(noTime.flags["scarmark"], undefined);
  const permanent = stampEffectData({ name: "Permanent", duration: {} }, { now: 500 });
  assert.strictEqual(permanent.start.time, 500);
  assert.strictEqual(permanent.flags, undefined);
});
