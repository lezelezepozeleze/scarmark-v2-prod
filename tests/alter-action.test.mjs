// The alter action from "use" to the weapon: the picker answer, the alteration put on the item, and every way it can end without that, which is either the user closing the dialog (quiet) or a warning (never nothing at all). Fake items and dialogs only.
import { stubState, resetStubState } from "./support/foundry-stub.mjs";
import { test, beforeEach } from "node:test";
import assert from "node:assert";
import { SYSTEM_ID } from "../module/constants.mjs";
import { ACTION_TRIGGER_USED } from "../module/config/index.mjs";
import { runActions } from "../module/helpers/actions/run.mjs";
import { forEachAction, newRun, DONE, SKIPPED, REFUSED, refuse } from "../module/helpers/actions/shared.mjs";

const warnings = [];
const created = [];
let dialog;
beforeEach(() => {
  resetStubState();
  warnings.length = 0;
  created.length = 0;
  globalThis.ui.notifications.warn = (text) => warnings.push(text);
  dialog = { closed: false, pick: "k1" };
  // The dialog: closed (nothing), or the OK button, which reads the field "pick" of a form the way the browser hands it over.
  globalThis.foundry.applications.api.DialogV2.prompt = async (config) => {
    if (dialog.closed) return null;
    const form = { elements: { namedItem: (name) => (name === "pick" ? { value: dialog.pick } : null) } };
    return config.ok.callback({}, { form });
  };
});

const ENTRY_UUID = "Compendium.world.weapon-alterations.ActiveEffect.s1";
const entryOf = ({ immediate = false } = {}) => {
  const data = { name: "Sharpen", flags: { [SYSTEM_ID]: { immediate } }, duration: {}, transfer: false, system: { changes: [] } };
  return { name: "Sharpen", uuid: ENTRY_UUID, flags: data.flags, getFlag: (scope, key) => data.flags[scope]?.[key], toObject: () => structuredClone(data) };
};
const knifeWith = (effects = []) => ({
  id: "k1", name: "Knife", type: "weapon", documentName: "Item", effects, _source: { system: {} },
  createEmbeddedDocuments: async (type, data) => { created.push(...data); return data; },
  update: async () => ({})
});
const setup = (entry, knife = knifeWith()) => {
  globalThis.fromUuid = async (uuid) => (uuid === ENTRY_UUID ? entry : null);
  const owner = { documentName: "Actor", id: "a1", name: "Maximilian", items: Object.assign([knife], { get: (id) => (id === knife.id ? knife : undefined) }) };
  const whetstone = { name: "Whetstone", uuid: "Item.w", parent: owner, effects: { get: () => undefined }, system: { actions: [{ kind: "alter", when: ACTION_TRIGGER_USED, targetItem: "weapon", alteration: ENTRY_UUID }] } };
  return { whetstone, knife };
};
const cards = () => stubState.chat.map(message => message.content);

test("alter: the weapon picked gets the alteration, and the card says so", async () => {
  const { whetstone } = setup(entryOf());
  assert.strictEqual(await runActions(whetstone, ACTION_TRIGGER_USED), 1);
  assert.strictEqual(created.length, 1);
  assert.strictEqual(created[0].flags[SYSTEM_ID].improvedBy, ENTRY_UUID);
  assert.strictEqual(created[0].transfer, false);
  assert.match(cards().join(" "), /resultAltered/);
  assert.deepStrictEqual(warnings, []);
});

test("alter: closing the dialog changes nothing and warns nothing (the use is still said)", async () => {
  const { whetstone } = setup(entryOf());
  dialog.closed = true;
  assert.strictEqual(await runActions(whetstone, ACTION_TRIGGER_USED), 0);
  assert.deepStrictEqual(created, []);
  assert.deepStrictEqual(warnings, []);
  assert.match(cards().join(" "), /verbUsed/);
});

test("alter: an answer that names no item of the character is reported, not dropped", async () => {
  const { whetstone } = setup(entryOf());
  dialog.pick = undefined;
  assert.strictEqual(await runActions(whetstone, ACTION_TRIGGER_USED), 0);
  assert.deepStrictEqual(created, []);
  assert.match(warnings.join(" "), /alterPickMissing/);
});

test("alter: an alteration that is gone is reported", async () => {
  const { whetstone } = setup(entryOf());
  globalThis.fromUuid = async () => null;
  assert.strictEqual(await runActions(whetstone, ACTION_TRIGGER_USED), 0);
  assert.match(warnings.join(" "), /alterationMissing/);
});

test("alter: a weapon that has the alteration already is refused with a warning", async () => {
  const has = { getFlag: (scope, key) => (scope === SYSTEM_ID && key === "improvedBy" ? ENTRY_UUID : undefined) };
  const { whetstone } = setup(entryOf(), knifeWith([has]));
  assert.strictEqual(await runActions(whetstone, ACTION_TRIGGER_USED), 0);
  assert.deepStrictEqual(created, []);
  assert.match(warnings.join(" "), /alreadyHasEffect/);
});

test("alter: an immediate alteration that changes nothing is refused with a warning", async () => {
  const { whetstone } = setup(entryOf({ immediate: true }));
  assert.strictEqual(await runActions(whetstone, ACTION_TRIGGER_USED), 0);
  assert.match(warnings.join(" "), /alterNothingChanged/);
});

test("alter: Repair on a weapon clears the broken flag; a natural weapon and a weapon that is not broken are refused with a warning", async () => {
  const entry = { ...entryOf(), flags: { [SYSTEM_ID]: { alteration: "repair" } }, getFlag: (scope, key) => (scope === SYSTEM_ID && key === "alteration" ? "repair" : undefined) };
  const updates = [];
  const attempt = async (system) => {
    updates.length = 0;
    warnings.length = 0;
    const weapon = { ...knifeWith(), _source: { system }, update: async (data) => { updates.push(data); } };
    return runActions(setup(entry, weapon).whetstone, ACTION_TRIGGER_USED);
  };
  assert.strictEqual(await attempt({ quality: 5, broken: true }), 1);
  assert.deepStrictEqual(updates, [{ "system.broken": false }]);
  assert.match(cards().join(" "), /resultRepaired/);
  assert.strictEqual(await attempt({ quality: 0, broken: true }), 0);
  assert.match(warnings.join(" "), /noWeaponWear/);
  assert.strictEqual(await attempt({ quality: 5, broken: false }), 0);
  assert.match(warnings.join(" "), /nothingToRepair/);
  assert.deepStrictEqual(updates, []);
});

test("forEachAction counts only what was done, and a handler that reports nothing is logged", async () => {
  const actor = { documentName: "Actor", id: "a1", name: "Mara" };
  const item = { parent: actor, system: { actions: [1, 2, 3, 4, 5].map(n => ({ kind: "message", when: ACTION_TRIGGER_USED, message: `m${n}` })) } };
  const outcomes = [DONE, SKIPPED, REFUSED, undefined, DONE];
  const logged = [];
  const saved = console.error;
  console.error = (...args) => logged.push(args);
  try {
    const count = await forEachAction({ item, trigger: ACTION_TRIGGER_USED, run: newRun(actor) }, () => true, async () => outcomes.shift());
    assert.strictEqual(count, 2);
  } finally {
    console.error = saved;
  }
  assert.strictEqual(logged.length, 1, "only the handler that returned nothing is logged");
});

test("refuse: warns with the key and reports a refusal", () => {
  assert.strictEqual(refuse("SCARMARK.Action.noOwner"), REFUSED);
  assert.deepStrictEqual(warnings, ["SCARMARK.Action.noOwner"]);
});
