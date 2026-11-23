// The readable stat names of the Changes column on the Effects tab (view/effects-view.mjs effectKeyLabel, effectChangesLabel). Pure.
import { test } from "node:test";
import assert from "node:assert";
import { effectKeyLabel, effectChangesLabel } from "../module/view/effects-view.mjs";

// The translator echoes the lang key, so the test checks which key a stat picks.
const t = (key) => `{${key}}`;

test("a static stat shows its short name, not its data path", () => {
  assert.strictEqual(effectKeyLabel("system.mods.meleeDefense", t), "{SCARMARK.EffectShort.meleeDefense}");
  assert.strictEqual(effectKeyLabel("system.resources.fatigue", t), "{SCARMARK.EffectShort.fatigue}");
});

test("an individual skill shows its name, an item stat its stat and aspect", () => {
  assert.strictEqual(effectKeyLabel("system.mods.skill.Swimming", t), "Swimming");
  assert.strictEqual(effectKeyLabel("system.itemMods.impact.edged", t), "{SCARMARK.EffectPicker.item.impact}: {SCARMARK.EffectPicker.part.edged}");
});

test("an unknown key stays as it is", () => {
  assert.strictEqual(effectKeyLabel("system.something.else", t), "system.something.else");
});

test("the Changes column joins the names of all changes of an effect", () => {
  const effect = { changes: [{ key: "system.mods.meleeAttack" }, { key: "system.mods.meleeDefense" }] };
  assert.strictEqual(effectChangesLabel(effect, t), "{SCARMARK.EffectShort.meleeAttack}, {SCARMARK.EffectShort.meleeDefense}");
  assert.strictEqual(effectChangesLabel({ changes: [] }, t), "");
});
