// The shared "Modifier" field of the roll dialogs: its markup, how a form is read, and the one-field prompt.
import { resetStubState } from "./support/foundry-stub.mjs";
import { test } from "node:test";
import assert from "node:assert";

const { modifierField, readModifier, promptModifier } = await import("../module/helpers/modifier-prompt.mjs");

test("modifierField: the number input named modifier, step and autofocus as asked", () => {
  assert.strictEqual(modifierField({ label: "Mod" }), '<div class="form-group"><label>Mod</label><input type="number" name="modifier" value="0" step="1" /></div>');
  assert.strictEqual(modifierField({ label: "Mod", step: 5, autofocus: true }), '<div class="form-group"><label>Mod</label><input type="number" name="modifier" value="0" step="5" autofocus /></div>');
});

test("readModifier: a number, 0 for empty or text", () => {
  const form = (value) => ({ elements: { modifier: { value } } });
  assert.strictEqual(readModifier(form("-10")), -10);
  assert.strictEqual(readModifier(form("")), 0);
  assert.strictEqual(readModifier(form("abc")), 0);
});

test("promptModifier: returns the modifier, null when the dialog is closed", async () => {
  resetStubState();
  let seen;
  globalThis.foundry.applications.api.DialogV2.prompt = async (config) => { seen = config; return config.ok.callback({}, { form: { elements: { modifier: { value: "15" } } } }); };
  assert.strictEqual(await promptModifier({ title: "T", okLabel: "Go", before: "<p>x</p>", label: "L", step: 5 }), 15);
  assert.strictEqual(seen.window.title, "T");
  assert.strictEqual(seen.ok.label, "Go");
  assert.ok(seen.content.startsWith("<p>x</p><div class=\"form-group\"><label>L</label>"));
  assert.ok(seen.content.includes("step=\"5\" autofocus"));
  globalThis.foundry.applications.api.DialogV2.prompt = async () => null;
  assert.strictEqual(await promptModifier({ title: "T", okLabel: "Go" }), null);
});
