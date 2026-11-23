// withToxicity puts the Vitality penalty of a consumable's toxicity into the effects that are applied on consume.
import { test } from "node:test";
import assert from "node:assert";
import { withToxicity } from "../module/helpers/consume.mjs";

const item = { toxicity: 5, name: "Beer (5)", img: "beer.svg", uuid: "Item.beer" };
const vitality = (n) => ({ key: "system.mods.skill.Vitality", type: "add", value: n, priority: 20, phase: "initial" });

test("toxicity: none or 0 leaves the effects alone", () => {
  const effects = [{ name: "Tipsy", duration: { value: 1, units: "hours" } }];
  assert.strictEqual(withToxicity(effects, { ...item, toxicity: 0 }), effects);
  assert.deepStrictEqual(effects[0].system, undefined);
});

test("toxicity: an item with no effect gets a permanent Vitality effect of its own", () => {
  const [effect] = withToxicity([], item);
  assert.deepStrictEqual(effect, { name: "Beer (5)", img: "beer.svg", disabled: false, transfer: false, origin: "Item.beer", system: { changes: [vitality(-5)] } });
});

test("toxicity: the penalty joins the longest-lasting effect and keeps its other changes", () => {
  const short = { name: "Short", duration: { value: 1, units: "hours" }, system: { changes: [] } };
  const long = { name: "Long", duration: { value: 3, units: "hours" }, system: { changes: [{ key: "system.mods.endurance", type: "add", value: 1 }] } };
  withToxicity([short, long], item);
  assert.deepStrictEqual(short.system.changes, []);
  assert.deepStrictEqual(long.system.changes.map(c => c.key), ["system.mods.endurance", "system.mods.skill.Vitality"]);
  assert.strictEqual(long.system.changes.at(-1).value, -5);
});

test("toxicity: effects without a duration count as 0 seconds, so a timed one wins", () => {
  const permanent = { name: "Permanent", duration: {} };
  const timed = { name: "Timed", duration: { value: 10, units: "minutes" } };
  withToxicity([permanent, timed], item);
  assert.strictEqual(permanent.system, undefined);
  assert.strictEqual(timed.system.changes.length, 1);
});

test("toxicity: an immediate effect never carries the penalty, an ongoing one does, and with none the penalty gets an effect of its own", () => {
  const immediate = { name: "Tonic", flags: { "scarmark": { immediate: true } }, duration: { value: 5, units: "hours" } };
  const ongoing = { name: "Buzz", duration: { value: 1, units: "hours" } };
  const both = withToxicity([immediate, ongoing], item);
  assert.strictEqual(immediate.system, undefined);
  assert.strictEqual(ongoing.system.changes.length, 1);
  assert.strictEqual(both.length, 2);
  const only = withToxicity([immediate], item);
  assert.strictEqual(only.length, 2);
  assert.strictEqual(immediate.system, undefined);
  assert.strictEqual(only[1].name, "Beer (5)");
});
