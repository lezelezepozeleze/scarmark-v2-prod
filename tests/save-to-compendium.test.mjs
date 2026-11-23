// The compendium an effect is offered first when it is saved: by the item it sits on.
import "./support/foundry-stub.mjs";
import { test } from "node:test";
import assert from "node:assert";
import { defaultEffectPack } from "../module/helpers/save-to-compendium.mjs";

const effectOn = (parent) => ({ parent });

test("save to compendium: an effect of a weapon goes to the weapon alterations", () => {
  assert.strictEqual(defaultEffectPack(effectOn({ documentName: "Item", type: "weapon" })), "weapon-alterations");
});

test("save to compendium: an effect of an armor goes to the armor alterations", () => {
  assert.strictEqual(defaultEffectPack(effectOn({ documentName: "Item", type: "armor" })), "armor-alterations");
});

test("save to compendium: any other effect goes to the effects", () => {
  assert.strictEqual(defaultEffectPack(effectOn({ documentName: "Item", type: "gear" })), "effects");
  assert.strictEqual(defaultEffectPack(effectOn({ documentName: "Actor", type: "character" })), "effects");
  assert.strictEqual(defaultEffectPack(effectOn(null)), "effects");
});
