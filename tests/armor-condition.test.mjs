// Armor durability: one number for the whole piece. A hit wears the highest-layer covering piece; at 0 it stops protecting, Natural armor never wears.
import "./support/foundry-stub.mjs";
import { test } from "node:test";
import assert from "node:assert";
import { QUALITY_PERMANENT } from "../module/config/index.mjs";
import { SCARMARK } from "../module/config.mjs";
import { armorProtection, coveringArmor } from "../module/helpers/combat/armor.mjs";
import { adapters } from "./golden/adapters.mjs";

const entry = (type, side = "") => ({ type, side });

test("worn armor protects while its durability is not 0; Natural armor always protects what it covers", () => {
  const piece = (id, quality, coverage, blunt) => ({ id, type: "armor", system: { carried: true, quality, container: "", coverage, protection: { blunt } } });
  const actor = { items: [
    piece("plate", 5, [entry("head"), entry("arm", "right")], 6),
    piece("broken", 0, [entry("head")], 9),
    piece("hide", QUALITY_PERMANENT, [entry("arm", "left")], 2)
  ] };
  actor.items.get = (id) => actor.items.find(i => i.id === id);
  assert.deepStrictEqual(coveringArmor(actor, "head").map(a => a.id), ["plate"], "the destroyed piece gives nothing");
  assert.deepStrictEqual(coveringArmor(actor, "arm", "left").map(a => a.id), ["hide"]);
  assert.strictEqual(armorProtection(actor, "arm", "blunt", "left"), 2);
  assert.strictEqual(armorProtection(actor, "arm", "blunt", "right"), 6);
});

// A strike on one location: what the card says and which armor updates it makes (the 50/50 wear decision is the scripted wearRandom).
const loc = (type, name) => {
  const c = SCARMARK.armorLocations[type];
  return { name, system: { locationType: type, aim: { ...c.aim }, injury: { ...c.injury }, risk: { ...c.risk } } };
};
const strike = (armor, locations, wearRandom = 0.1) => adapters.strike({
  aspect: "blunt", impact: 8, strikeDice: 2, strikeRoll: 6, aim: "mid", skill: "close", armorPiercing: false, locationRandom: 0.5, wearRandom, locations, armor
});
const protection = { blunt: 4, edged: 5, piercing: 3, fire: 2 };
const piece = (name, layer, coverage, quality = 5) => ({ name, quality, layer, carried: true, quantity: 1, weight: 0, coverage, protection });

test("a hit wears the durability of the highest-layer covering piece", async () => {
  const result = await strike([piece("Coif", 4, [entry("head"), entry("neck")]), piece("Cap", 2, [entry("head")])], [loc("head", "Head")]);
  assert.strictEqual(result.wear, "armorWorn");
  assert.deepStrictEqual(result.armorUpdates, [{ name: "Coif", updates: [{ "system.quality": 4 }] }]);
});

test("a piece at durability 0 gives no protection and the next layer wears", async () => {
  const result = await strike([piece("Plate helm", 5, [entry("head")], 0), piece("Cap", 2, [entry("head")], 1)], [loc("head", "Head")]);
  assert.strictEqual(result.armorProt, 4, "only the cap protects");
  assert.strictEqual(result.wear, "armorDestroyed", "the cap goes from 1 to 0");
  assert.deepStrictEqual(result.armorUpdates, [{ name: "Cap", updates: [{ "system.quality": 0 }] }]);
});

test("the wear roll can spare the armor, and Natural armor protects but never wears", async () => {
  const spared = await strike([piece("Helm", 3, [entry("head")])], [loc("head", "Head")], 0.9);
  assert.strictEqual(spared.wear, "armorSpared");
  assert.deepStrictEqual(spared.armorUpdates, []);
  const natural = await strike([piece("Hide", 3, [entry("head")], QUALITY_PERMANENT)], [loc("head", "Head")]);
  assert.strictEqual(natural.armorProt, 4);
  assert.strictEqual(natural.wear, null);
  assert.deepStrictEqual(natural.armorUpdates, []);
});
