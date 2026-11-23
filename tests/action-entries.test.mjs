// The compendium entries that actions name by uuid (helpers/actions/entries.mjs): the item remembers each entry's name, a uuid that no longer resolves is found again by name, and the Actions panel shows an entry that is gone as "(missing)" instead of a blank. Fake items, packs and dialogs only.
import { stubState, resetStubState } from "./support/foundry-stub.mjs";
import { test, beforeEach } from "node:test";
import assert from "node:assert";
import { SYSTEM_ID, FLAGS } from "../module/constants.mjs";
import { ACTION_TRIGGER_USED } from "../module/config/index.mjs";
import { resolveEntry, rememberEntryNames } from "../module/helpers/actions/entries.mjs";
import { runActions } from "../module/helpers/actions/run.mjs";
import { prepareActionsPanel } from "../module/sheets/actions/action-panel.mjs";

const warnings = [];
const created = [];
beforeEach(() => {
  resetStubState();
  warnings.length = 0;
  created.length = 0;
  globalThis.ui.notifications.warn = (text) => warnings.push(text);
});

/** An item that keeps its flags in memory, like a document would. */
const itemWith = (actions, names = {}) => {
  const flags = { [FLAGS.entryNames]: { ...names } };
  const writes = [];
  return {
    name: "Whetstone", uuid: "Item.w", effects: { get: () => undefined }, system: { actions }, writes,
    getFlag: (scope, key) => (scope === SYSTEM_ID ? flags[key] : undefined),
    setFlag: async (scope, key, value) => { writes.push(value); Object.assign(flags[key], value); }
  };
};
const doc = (name) => ({ name, uuid: `Compendium.world.x.ActiveEffect.${name}` });
const live = (...docs) => { globalThis.fromUuid = async (uuid) => docs.find(d => d.uuid === uuid) ?? null; };

test("resolveEntry: a uuid that resolves gives the entry and the item remembers its name once", async () => {
  const sharpen = doc("Sharpen");
  live(sharpen);
  const item = itemWith([]);
  const action = { id: "a1" };
  assert.strictEqual(await resolveEntry(item, action, sharpen.uuid, async () => assert.fail("not needed")), sharpen);
  assert.deepStrictEqual(item.writes, [{ a1: "Sharpen" }]);
  assert.strictEqual(item.getFlag(SYSTEM_ID, FLAGS.entryNames).a1, "Sharpen");
  await resolveEntry(item, action, sharpen.uuid, async () => []);
  assert.strictEqual(item.writes.length, 1, "the same name is not written again");
});

test("resolveEntry: a stale uuid is found again by the remembered name, whatever the case, spacing or dashes", async () => {
  const fresh = doc("Hand-to-Hand Sharpen");
  live(fresh);
  const item = itemWith([], { a1: "  hand–to–hand   SHARPEN " });
  const candidates = async () => [{ uuid: doc("Other").uuid, name: "Other" }, { uuid: fresh.uuid, name: fresh.name }];
  assert.strictEqual(await resolveEntry(item, { id: "a1" }, "Compendium.world.x.ActiveEffect.gone", candidates), fresh);
});

test("resolveEntry: a stale uuid with no remembered name, or a name nobody has, gives null", async () => {
  live();
  const noName = itemWith([]);
  assert.strictEqual(await resolveEntry(noName, { id: "a1" }, "Compendium.x.gone", async () => assert.fail("no name to look for")), null);
  const unknown = itemWith([], { a1: "Sharpen" });
  assert.strictEqual(await resolveEntry(unknown, { id: "a1" }, "Compendium.x.gone", async () => [{ uuid: "u", name: "Blunt" }]), null);
});

test("resolveEntry: a name that cannot be written (no permission) does not stop the action", async () => {
  const sharpen = doc("Sharpen");
  live(sharpen);
  const item = itemWith([]);
  item.setFlag = async () => { throw new Error("no permission"); };
  const saved = console.warn;
  console.warn = () => {};
  try {
    assert.strictEqual(await resolveEntry(item, { id: "a1" }, sharpen.uuid, async () => []), sharpen);
  } finally {
    console.warn = saved;
  }
});

test("rememberEntryNames: the alter and remove actions that name an entry get its name; the others and the unresolved do not", async () => {
  const sharpen = doc("Sharpen");
  const tipsy = doc("Tipsy");
  live(sharpen, tipsy);
  const item = itemWith([
    { id: "a1", kind: "alter", alteration: sharpen.uuid },
    { id: "a2", kind: "remove", effect: tipsy.uuid },
    { id: "a3", kind: "effect", effect: "someEffectId" },
    { id: "a4", kind: "alter", alteration: "Compendium.world.x.ActiveEffect.gone" },
    { id: "a5", kind: "message", message: "Compendium.world.x.ActiveEffect.Sharpen" }
  ]);
  assert.strictEqual(await rememberEntryNames(item), 2);
  assert.deepStrictEqual(item.writes, [{ a1: "Sharpen" }, { a2: "Tipsy" }]);
});

test("a stale alteration is found again by name when the item is used, and the weapon gets it", async () => {
  const sharpen = { ...doc("Sharpen"), flags: { [SYSTEM_ID]: {} }, getFlag: () => undefined, toObject: () => ({ name: "Sharpen", flags: { [SYSTEM_ID]: {} }, duration: {}, transfer: false }) };
  live(sharpen);
  // The world pack was made again: its entry has a new uuid and a different case.
  globalThis.game.packs = { get: (id) => (id === "world.weapon-alterations" ? { collection: id, documentName: "ActiveEffect", getIndex: async () => [{ _id: "n1", name: "SHARPEN", uuid: sharpen.uuid }] } : undefined) };
  const knife = { id: "k1", name: "Knife", type: "weapon", effects: [], createEmbeddedDocuments: async (type, data) => { created.push(...data); return data; } };
  const owner = { documentName: "Actor", id: "a1", name: "Maximilian", items: Object.assign([knife], { get: (id) => (id === "k1" ? knife : undefined) }) };
  const whetstone = itemWith([{ id: "a1", kind: "alter", when: ACTION_TRIGGER_USED, targetItem: "weapon", alteration: "Compendium.world.weapon-alterations.ActiveEffect.OLD" }], { a1: "Sharpen" });
  whetstone.parent = owner;
  globalThis.foundry.applications.api.DialogV2.prompt = async (config) => config.ok.callback({}, { form: { elements: { namedItem: () => ({ value: "k1" }) } } });
  try {
    assert.strictEqual(await runActions(whetstone, ACTION_TRIGGER_USED), 1);
  } finally {
    globalThis.game.packs = [];
  }
  assert.strictEqual(created.length, 1);
  assert.strictEqual(created[0].flags[SYSTEM_ID].improvedBy, sharpen.uuid);
  assert.deepStrictEqual(warnings, []);
  assert.match(stubState.chat.map(m => m.content).join(" "), /resultAltered/);
});

const action = (fields) => ({ id: "a", effect: "", on: "", targetItem: "", when: "used", ...fields });
const panelWith = (fields, names, lists) => prepareActionsPanel({ documentName: "Item", _source: { flags: { [SYSTEM_ID]: { entryNames: names } }, system: { usable: true, actions: [action(fields)] } } }, "system.actions", lists).rows[0];

test("panel: an alteration that is gone stays in its roll-down as missing, with the name the item remembers", () => {
  const alterations = { weapon: [{ uuid: "Compendium.x.weapon.ActiveEffect.s", name: "Sharpened" }] };
  const row = panelWith({ kind: "alter", targetItem: "weapon", alteration: "Compendium.x.weapon.ActiveEffect.OLD" }, { a: "Sharpen" }, { alterations });
  assert.deepStrictEqual(row.alteration.options.map(o => [o.value, o.selected]), [["", false], ["Compendium.x.weapon.ActiveEffect.s", false], ["Compendium.x.weapon.ActiveEffect.OLD", true]]);
  assert.match(row.alteration.options.at(-1).label, /entryMissing.*Sharpen/);
  const fine = panelWith({ kind: "alter", targetItem: "weapon", alteration: "Compendium.x.weapon.ActiveEffect.s" }, {}, { alterations });
  assert.strictEqual(fine.alteration.options.length, 2, "an alteration that is there adds nothing");
});

test("panel: a library effect to remove that is gone gets a group of its own; a present one does not", () => {
  const library = [{ label: "Alcohol", entries: [{ uuid: "Compendium.x.lib.ActiveEffect.t", name: "Tipsy" }] }];
  const gone = panelWith({ kind: "remove", effect: "Compendium.x.lib.ActiveEffect.OLD" }, { a: "Tipsy" }, { library });
  assert.deepStrictEqual(gone.removal.groups.map(g => g.label), ["Alcohol", "SCARMARK.Action.entryMissingGroup"]);
  assert.deepStrictEqual(gone.removal.groups.at(-1).options.map(o => [o.value, o.selected]), [["Compendium.x.lib.ActiveEffect.OLD", true]]);
  const there = panelWith({ kind: "remove", effect: "Compendium.x.lib.ActiveEffect.t" }, {}, { library });
  assert.deepStrictEqual(there.removal.groups.map(g => g.label), ["Alcohol"]);
});
