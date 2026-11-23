// Unique effects (rules/effect-unique.mjs) and the type step of the effect picker (view/effects-view.mjs). All pure.
import "./support/foundry-stub.mjs";
import { test } from "node:test";
import assert from "node:assert";
import { SYSTEM_ID } from "../module/constants.mjs";
import { isUniqueEffect, effectIdentity, uniqueConflict } from "../module/rules/index.mjs";
import { buildEffectTypes } from "../module/view/effects-view.mjs";

const effect = (name, scope = {}, extra = {}) => ({ name, flags: { [SYSTEM_ID]: scope }, ...extra });

test("effectIdentity: the alteration entry, else the library source, else the compendium source, else the name", () => {
  assert.strictEqual(effectIdentity(effect("A", { improvedBy: "Compendium.x.alt.1", librarySource: "Compendium.x.lib.2" })), "Compendium.x.alt.1");
  assert.strictEqual(effectIdentity(effect("A", { librarySource: "Compendium.x.lib.2" })), "Compendium.x.lib.2");
  assert.strictEqual(effectIdentity(effect("A", {}, { _stats: { compendiumSource: "Compendium.x.y.3" } })), "Compendium.x.y.3");
  assert.strictEqual(effectIdentity(effect("  Sharpened ")), "name:sharpened");
  assert.strictEqual(effectIdentity(undefined), "name:");
});

test("uniqueConflict: only when one of the two has the unique box ticked, and they are the same effect", () => {
  const sharpened = effect("Sharpened", { unique: true });
  assert.strictEqual(isUniqueEffect(sharpened), true);
  assert.strictEqual(isUniqueEffect(effect("Sharpened")), false);
  assert.strictEqual(uniqueConflict([sharpened], effect("sharpened")), sharpened);
  assert.strictEqual(uniqueConflict([effect("Sharpened")], effect("Sharpened", { unique: true })).name, "Sharpened");
  assert.strictEqual(uniqueConflict([effect("Sharpened")], effect("Sharpened")), null);
  assert.strictEqual(uniqueConflict([sharpened], effect("Blessed")), null);
  assert.strictEqual(uniqueConflict(undefined, sharpened), null);
});

test("uniqueConflict: two copies of one alteration entry are the same effect whatever their names", () => {
  const first = effect("Edge honed", { unique: true, improvedBy: "Compendium.x.alt.1" });
  assert.strictEqual(uniqueConflict([first], effect("Renamed", { unique: true, improvedBy: "Compendium.x.alt.1" })), first);
  assert.strictEqual(uniqueConflict([first], effect("Edge honed", { unique: true, improvedBy: "Compendium.x.alt.9" })), null);
});

test("buildEffectTypes: character, weapon and armor; the start is the kind of item the effect sits on", () => {
  const context = { localize: key => key, skillNames: ["Vitality"] };
  const onActor = buildEffectTypes({ parent: { documentName: "Actor", items: [] } }, context);
  assert.deepStrictEqual(onActor.types.map(entry => entry.type), ["character", "weapon", "armor"]);
  assert.strictEqual(onActor.start, "character");
  const keys = (type) => onActor.types.find(entry => entry.type === type).groups.flatMap(group => group.options.map(([key]) => key));
  assert.ok(keys("character").includes("system.mods.skill.Vitality"));
  assert.ok(keys("character").every(key => !key.startsWith("system.itemMods.")));
  assert.strictEqual(buildEffectTypes({ parent: { documentName: "Item", type: "armor", parent: { documentName: "Actor", items: [] } } }, context).start, "armor");
  assert.strictEqual(buildEffectTypes({ parent: { documentName: "Item", type: "gear" } }, context).start, "character");
  assert.strictEqual(buildEffectTypes({ transfer: true, parent: { documentName: "Item", type: "weapon" } }, context).start, "character", "an effect that transfers to the owner is about the character");
});
