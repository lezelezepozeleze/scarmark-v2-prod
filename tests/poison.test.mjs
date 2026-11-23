// Effects that fire when a weapon wounds (rules/poison.mjs): which effects count and how the charges run down. Pure.
import "./support/foundry-stub.mjs";
import { test } from "node:test";
import assert from "node:assert";
import { SYSTEM_ID } from "../module/constants.mjs";
import { chargesOf, chargesAfterHit, onHitEffects, isFailure } from "../module/rules/index.mjs";
import { ON_HIT_DEFAULT_TEST } from "../module/config/index.mjs";

const effect = (name, scope = {}, extra = {}) => ({ id: name.toLowerCase(), name, flags: { [SYSTEM_ID]: scope }, ...extra });

test("chargesOf: empty means no limit, else a whole number of 0 or more", () => {
  for (const value of [undefined, null, ""]) assert.strictEqual(chargesOf(value), null);
  assert.strictEqual(chargesOf(3), 3);
  assert.strictEqual(chargesOf("2"), 2);
  assert.strictEqual(chargesOf(2.9), 2);
  assert.strictEqual(chargesOf(-4), 0);
  assert.strictEqual(chargesOf("abc"), null);
});

test("chargesAfterHit: one fewer per wounding hit, none for no limit, never below 0", () => {
  assert.strictEqual(chargesAfterHit(3), 2);
  assert.strictEqual(chargesAfterHit(1), 0);
  assert.strictEqual(chargesAfterHit(0), 0);
  assert.strictEqual(chargesAfterHit(undefined), null);
  assert.strictEqual(chargesAfterHit(""), null);
});

test("onHitEffects: only effects marked onHit that are on and have a charge left", () => {
  const result = onHitEffects([
    effect("Spider venom", { onHit: true, onHitTest: "skill:Vitality", onHitEffect: "Compendium.x.poisons.1", charges: 2 }),
    effect("Sharpened", { unique: true }),
    effect("Spent", { onHit: true, charges: 0 }),
    effect("Off", { onHit: true }, { disabled: true }),
    effect("Endless", { onHit: true, charges: "" })
  ]);
  assert.deepStrictEqual(result.map(r => r.name), ["Spider venom", "Endless"]);
  assert.deepStrictEqual(result[0], { id: "spider venom", name: "Spider venom", test: "skill:Vitality", failEffect: "Compendium.x.poisons.1", charges: 2 });
});

test("onHitEffects: a poison that names no test asks for the default one; no effects, none", () => {
  const [poison] = onHitEffects([effect("Venom", { onHit: true })]);
  assert.strictEqual(poison.test, ON_HIT_DEFAULT_TEST);
  assert.strictEqual(poison.failEffect, "");
  assert.strictEqual(poison.charges, null);
  assert.deepStrictEqual(onHitEffects(undefined), []);
  assert.deepStrictEqual(onHitEffects([]), []);
});

test("isFailure: a miss or a critical failure fails, a success does not", () => {
  assert.deepStrictEqual(["cs", "ms", "mf", "cf"].map(isFailure), [false, false, true, true]);
});
