// The "remove effect" action (helpers/actions/removal.mjs): which effects it takes off which targets, and what it says when it cannot. Fake items and actors only.
import { stubState, resetStubState } from "./support/foundry-stub.mjs";
import { test, beforeEach } from "node:test";
import assert from "node:assert";
import { ACTION_TRIGGER_USED, ACTION_TRIGGER_HIT } from "../module/config/index.mjs";
import { runActions } from "../module/helpers/actions/run.mjs";

const warnings = [];
const deleted = [];
beforeEach(() => {
  resetStubState();
  warnings.length = 0;
  deleted.length = 0;
  globalThis.ui.notifications.warn = (text) => warnings.push(text);
  globalThis.canvas = { tokens: { controlled: [] } };
  globalThis.fromUuid = async (uuid) => (uuid === TIPSY.uuid ? TIPSY : null);
});

const TIPSY = { uuid: "Compendium.x.lib.ActiveEffect.t", name: "Tipsy" };
const actorWith = (name, effects, isOwner = true) => ({
  documentName: "Actor", id: name, uuid: `Actor.${name}`, name, isOwner,
  effects: { contents: effects },
  deleteEmbeddedDocuments: async (type, ids) => { deleted.push([name, ...ids]); }
});
const antidote = (owner, action, type = "gear") => ({
  name: "Antidote", type, uuid: "Item.a", parent: owner,
  system: { actions: [{ id: "a1", kind: "remove", effect: TIPSY.uuid, on: "self", when: ACTION_TRIGGER_USED, ...action }] },
  getFlag: () => undefined,
  setFlag: async () => {}
});
const cards = () => stubState.chat.map(message => message.content).join(" ");

test("remove: the effects of that name come off the target, whatever the case, and a card says so", async () => {
  const mara = actorWith("Mara", [{ id: "e1", name: "tipsy" }, { id: "e2", name: "Blessed" }, { id: "e3", name: "Other", origin: TIPSY.uuid }]);
  assert.strictEqual(await runActions(antidote(mara, {}), ACTION_TRIGGER_USED), 1);
  assert.deepStrictEqual(deleted, [["Mara", "e1", "e3"]], "by name, and by the library entry they came from");
  assert.match(cards(), /resultRemoved/);
  assert.deepStrictEqual(warnings, []);
});

test("remove: a target without the effect is told so", async () => {
  const mara = actorWith("Mara", [{ id: "e2", name: "Blessed" }]);
  assert.strictEqual(await runActions(antidote(mara, {}), ACTION_TRIGGER_USED), 0);
  assert.deepStrictEqual(deleted, []);
  assert.match(warnings.join(" "), /noSuchEffect/);
});

test("remove: a target the user does not own is refused with a warning", async () => {
  const mara = actorWith("Mara", [{ id: "e1", name: "Tipsy" }], false);
  assert.strictEqual(await runActions(antidote(mara, {}), ACTION_TRIGGER_USED), 0);
  assert.deepStrictEqual(deleted, []);
  assert.match(warnings.join(" "), /noPermissionRemove/);
});

test("remove: selected tokens with nobody selected is reported", async () => {
  const mara = actorWith("Mara", [{ id: "e1", name: "Tipsy" }]);
  assert.strictEqual(await runActions(antidote(mara, { on: "selectedToken" }), ACTION_TRIGGER_USED), 0);
  assert.match(warnings.join(" "), /noTarget/);
});

test("remove: an effect that is gone from the library is reported", async () => {
  const mara = actorWith("Mara", [{ id: "e1", name: "Tipsy" }]);
  globalThis.fromUuid = async () => null;
  assert.strictEqual(await runActions(antidote(mara, {}), ACTION_TRIGGER_USED), 0);
  assert.match(warnings.join(" "), /effectMissing/);
});

test("remove: a weapon that wounds takes the effect off the one it hit, and says nothing when the one hit does not have it", async () => {
  const mara = actorWith("Mara", []);
  const orc = actorWith("Orc", [{ id: "e1", name: "Tipsy" }]);
  const sword = antidote(mara, { when: ACTION_TRIGGER_HIT, on: "" }, "weapon");
  assert.strictEqual(await runActions(sword, ACTION_TRIGGER_HIT, { hit: orc }), 1);
  assert.deepStrictEqual(deleted, [["Orc", "e1"]]);
  const clean = actorWith("Goblin", [{ id: "e9", name: "Blessed" }]);
  deleted.length = 0;
  assert.strictEqual(await runActions(sword, ACTION_TRIGGER_HIT, { hit: clean }), 0);
  assert.deepStrictEqual(deleted, []);
  assert.deepStrictEqual(warnings, [], "no warning for the one hit");
});

test("remove: an inspected removal takes the effect off the one who inspects, whatever target it once had", async () => {
  const mara = actorWith("Mara", [{ id: "e1", name: "Tipsy" }]);
  const amulet = antidote(mara, { when: "inspected", on: "selectedToken" });
  assert.strictEqual(await runActions(amulet, "inspected"), 1);
  assert.deepStrictEqual(deleted, [["Mara", "e1"]]);
});
