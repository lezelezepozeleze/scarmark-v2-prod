// The combat helper's item grouping and the maneuver and tactic data.
import { test } from "node:test";
import assert from "node:assert";
import { HELPER_GROUPS, HELPER_GROUP, isCarried, attackable, damageLetters, combatBuckets } from "../module/rules/index.mjs";
import { MANEUVERS, TACTICS } from "../module/config/index.mjs";

const compare = (a, b) => a.localeCompare(b);
const weapon = (name, impact, extra = {}) => ({ id: name, name, type: "weapon", system: { associatedSkill: "close", impact, ...extra } });
const missile = (name, aspect, impact, skill = "ranged", extra = {}) => ({ id: name, name, type: "missile", system: { associatedSkill: skill, aspect, impact, ...extra } });

test("damageLetters: a weapon lists its aspects strongest first (ties in B E F P order), a missile its own aspect", () => {
  assert.strictEqual(damageLetters(weapon("w", { blunt: 3, edged: 6, piercing: -1, fire: 3 })), "E B F");
  assert.strictEqual(damageLetters(weapon("w", { blunt: 5, edged: 5, piercing: 4, fire: 4 })), "B E P F", "ties go in the order B E P F");
  assert.strictEqual(damageLetters(weapon("w", { blunt: -1, edged: -1, piercing: -1, fire: -1 })), "");
  assert.strictEqual(damageLetters(weapon("w", { blunt: 0 })), "B");
  assert.strictEqual(damageLetters(missile("m", "Piercing", { short: 1 })), "P");
  assert.strictEqual(damageLetters(missile("m", "none", { short: 1 })), "");
});

test("attackable: broken weapons and missiles without an aspect or a range cannot attack", () => {
  assert.strictEqual(attackable(weapon("w", { edged: 4 })), true);
  assert.strictEqual(attackable(weapon("w", { edged: 4 }, { broken: true })), false);
  assert.strictEqual(attackable(missile("m", "piercing", { medium: 3 })), true);
  assert.strictEqual(attackable(missile("m", "piercing", { medium: -1 })), false);
  assert.strictEqual(attackable(missile("m", "", { medium: 3 })), false);
});

test("combatBuckets: unarmed, close, throwable, missiles, artifacts and runes, each sorted by name", () => {
  const items = [
    weapon("Sword", { edged: 6 }), weapon("Axe", { edged: 7 }), weapon("Fist", { blunt: 1 }, { associatedSkill: "unarmed" }),
    missile("Knife", "piercing", { short: 2 }, "close"), missile("Bow", "piercing", { short: 2, long: 4 }),
    weapon("Staff", { blunt: 3 }, { artifact: { active: true } }), weapon("Rune blade", { edged: 2 }, { rune: true }),
    weapon("Broken", { edged: 5 }, { broken: true }), { id: "r", name: "Rope", type: "gear", system: {} }
  ];
  const buckets = combatBuckets(items, compare);
  assert.deepStrictEqual(HELPER_GROUPS, ["unarmed", "close", "throwable", "missiles", "artifacts", "runes"]);
  assert.deepStrictEqual(buckets.map(list => list.map(i => i.name)), [
    ["Fist"], ["Axe", "Rune blade", "Staff", "Sword"], ["Knife"], ["Bow"], ["Staff"], ["Rune blade"]
  ]);
  assert.strictEqual(HELPER_GROUP.RUNES, 5);
});

test("isCarried: the item and its container must not be set down", () => {
  const bag = { system: { carried: false } };
  const get = (id) => (id === "bag" ? bag : undefined);
  assert.strictEqual(isCarried({ system: { carried: true } }, get), true);
  assert.strictEqual(isCarried({ system: { carried: false } }, get), false);
  assert.strictEqual(isCarried({ system: { container: "bag" } }, get), false);
  assert.strictEqual(isCarried({ system: { container: "gone" } }, get), true);
});

test("maneuvers: unique ids, a name, a description, button actions that are known descriptors", () => {
  assert.deepStrictEqual(MANEUVERS.map(m => m.id), ["grapple", "pin", "push", "ram", "trip", "entangle"]);
  assert.strictEqual(new Set(MANEUVERS.map(m => m.id)).size, MANEUVERS.length);
  const known = ["test", "defense", "status", "stumble", "melee"];
  for (const m of MANEUVERS) {
    assert.strictEqual(m.name, `SCARMARK.Maneuvers.${m.id}.name`);
    assert.strictEqual(m.description, `SCARMARK.Maneuvers.${m.id}.description`);
    for (const action of [m.use, ...m.buttons.map(b => b.action)].filter(Boolean)) {
      assert.ok(known.some(k => k in action), `${m.id}: ${JSON.stringify(action)}`);
    }
  }
  assert.ok(TACTICS.length >= 9 && TACTICS.every(t => t.name === `SCARMARK.Tactics.${t.id}.name` && t.description === `SCARMARK.Tactics.${t.id}.description`));
});
