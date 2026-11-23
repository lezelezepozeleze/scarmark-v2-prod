// What a client may change of a combat item that is not its own (rules/combat-update.mjs): the GM-side handler applies only this, cleaned.
import { test } from "node:test";
import assert from "node:assert";
import { allowedCombatChanges } from "../module/rules/index.mjs";

test("broken is a boolean and quality a whole number; anything else is dropped", () => {
  assert.deepStrictEqual(allowedCombatChanges({ "system.broken": 1, "system.quality": "7.9", "system.name": "Hacked", "name": "Hacked" }), { "system.broken": true, "system.quality": 7 });
  assert.deepStrictEqual(allowedCombatChanges({ "system.quality": "not a number" }), {}, "an unreadable quality is dropped");
  assert.deepStrictEqual(allowedCombatChanges(undefined), {});
});
