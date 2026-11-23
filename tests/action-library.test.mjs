// The action compendium: entries are items of type "action" in the system pack "actions" and in a world compendium of the same name (helpers/packs.mjs merge); the + Add menu copies their actions into a document with new ids.
import "./support/foundry-stub.mjs";
import { test } from "node:test";
import assert from "node:assert";
import { PACKS } from "../module/constants.mjs";
import { actionsFromEntry } from "../module/rules/index.mjs";
import { listActionLibrary, copyLibraryActions } from "../module/helpers/action-library.mjs";
import { prepareActionsPanel } from "../module/sheets/actions/action-panel.mjs";

const fakePack = (collection, entries) => ({ collection, documentName: "Item", metadata: { label: collection, packageName: collection.split(".")[0] }, getIndex: async () => entries.map(([_id, name]) => ({ _id, name })) });

async function withPacks(list, fn) {
  const saved = globalThis.game.packs;
  globalThis.game.packs = { get: id => list.find(p => p.collection === id), filter: test => list.filter(test) };
  try { return await fn(); } finally { globalThis.game.packs = saved; }
}

test("actionsFromEntry: fresh ids, the entry's name for an unnamed action, nothing but actions", () => {
  let n = 0;
  const copies = actionsFromEntry([{ id: "old", name: "Sip", kind: "effect", effect: "x", when: "used" }, { id: "old2", kind: "message", message: "hi" }, null, "junk"], "Tonic", () => `new${++n}`);
  assert.deepStrictEqual(copies.map(a => [a.id, a.name, a.kind]), [["new1", "Sip", "effect"], ["new2", "Tonic", "message"]]);
  assert.deepStrictEqual(actionsFromEntry(undefined, "Tonic", () => "x"), []);
});

test("the library lists the system entries and the entries of a world compendium named actions, sorted, the world one winning a name clash", async () => {
  const system = fakePack(PACKS.actions, [["1", "Whet the blade"], ["2", "Sip"]]);
  const world = fakePack("world.actions", [["9", "sip"], ["8", "Bandage"]]);
  const names = await withPacks([system, world], async () => (await listActionLibrary()).map(e => e.name));
  assert.deepStrictEqual(names, ["Bandage", "sip", "Whet the blade"]);
  assert.deepStrictEqual(await withPacks([], () => listActionLibrary()), [], "no compendium: nothing to pick from");
});

test("copyLibraryActions: the actions of an entry with new ids; an entry that is gone, or is not an action entry, gives null", async () => {
  const saved = globalThis.fromUuid;
  const savedRandomID = globalThis.foundry.utils.randomID;
  let counter = 0;
  globalThis.foundry.utils.randomID = () => `id${++counter}`;
  const entry = { type: "action", name: "Tonic", _source: { system: { actions: [{ id: "a", kind: "effect", effect: "e", when: "consumed" }] } } };
  try {
    globalThis.fromUuid = async (uuid) => (uuid === "ok" ? entry : uuid === "gear" ? { type: "gear", name: "x", system: {} } : null);
    const copies = await copyLibraryActions("ok");
    assert.strictEqual(copies.length, 1);
    assert.strictEqual(copies[0].id, "id1");
    assert.strictEqual(copies[0].name, "Tonic");
    assert.strictEqual(entry._source.system.actions[0].id, "a", "the entry itself is not changed");
    assert.strictEqual(await copyLibraryActions("gone"), null);
    assert.strictEqual(await copyLibraryActions("gear"), null);
  } finally { globalThis.fromUuid = saved; globalThis.foundry.utils.randomID = savedRandomID; }
});

test("an entry of the action compendium is offered every trigger, whatever flags it has: it does not know yet which item it goes on", () => {
  const triggers = (type) => prepareActionsPanel({ documentName: "Item", type, _source: { system: { actions: [{ id: "a", kind: "effect", when: "" }] } } }).rows[0].when.options.map(o => o.value).filter(Boolean);
  assert.deepStrictEqual(triggers("action"), ["owned", "inspected", "used", "consumed", "hit", "region"]);
  assert.deepStrictEqual(triggers("gear"), ["owned", "inspected"], "a plain gear item is only offered what it can do");
});
