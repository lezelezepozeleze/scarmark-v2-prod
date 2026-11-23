// Actions on an actor (the container actor: a chest, a stash): its sheet has an Actions tab (the GM's), only "when inspected" is offered, and a player who opens the sheet sets the actions off as their own character. Fake actors and users only.
import { stubState, resetStubState } from "./support/foundry-stub.mjs";
import { test, beforeEach } from "node:test";
import assert from "node:assert";
import { ACTION_TRIGGER_INSPECTED } from "../module/config/index.mjs";
import { inspect } from "../module/helpers/actions/run.mjs";
import { prepareActionsPanel, ACTIONS_PANEL_TEMPLATES } from "../module/sheets/actions/action-panel.mjs";
import ScarmarkContainerActorSheet from "../module/sheets/actor-container-sheet.mjs";
import ScarmarkContainerActorData from "../module/data/actor-container.mjs";

const warnings = [];
const created = [];
beforeEach(() => {
  resetStubState();
  warnings.length = 0;
  created.length = 0;
  globalThis.ui.notifications.warn = (text) => warnings.push(text);
  globalThis.game.user = { isGM: false, character: null };
  globalThis.foundry.utils.deepClone = structuredClone;   // applyPlan copies the effect data with it; the stub has no utils
});

const mara = { documentName: "Actor", id: "mara", uuid: "Actor.mara", name: "Mara", isOwner: true, createEmbeddedDocuments: async (type, data) => { created.push(...data); return data; } };
const message = (text) => ({ id: "a1", kind: "message", when: ACTION_TRIGGER_INSPECTED, message: text });
const cursed = { name: "Cursed", toObject: () => ({ name: "Cursed", flags: {}, duration: {} }) };
const chestWith = (actions) => ({ documentName: "Actor", type: "container", id: "chest", uuid: "Actor.chest", name: "Old chest", isOwner: false, parent: null, system: { actions }, effects: { get: (id) => (id === "e1" ? cursed : undefined) } });
const cards = () => stubState.chat.map(entry => entry.content).join(" ");

test("the container actor sheet has the Contents and Actions tabs, and the actions part loads the panel templates", () => {
  assert.deepStrictEqual(ScarmarkContainerActorSheet.TABS.primary.tabs.map(tab => tab.id), ["gear", "actions"]);
  assert.deepStrictEqual(Object.keys(ScarmarkContainerActorSheet.PARTS), ["header", "tabs", "gear", "actions"]);
  assert.deepStrictEqual(ScarmarkContainerActorSheet.PARTS.actions.templates, ACTIONS_PANEL_TEMPLATES);
});

test("the container actor stores a list of actions", () => {
  assert.ok("actions" in ScarmarkContainerActorData.defineSchema());
});

test("the Actions panel of an actor offers only the trigger that makes sense there: inspected", () => {
  const panel = prepareActionsPanel({ documentName: "Actor", type: "container", _source: { system: { actions: [message("x")] } } });
  assert.deepStrictEqual(panel.rows[0].when.options.map(option => option.value), ["", "inspected"]);
  const stored = prepareActionsPanel({ documentName: "Actor", type: "container", _source: { system: { actions: [{ ...message("x"), when: "owned" }] } } });
  assert.ok(stored.rows[0].when.options.some(option => option.value === "owned" && option.selected), "a trigger the action already has stays");
});

test("a player who opens the chest gets its message as their character", async () => {
  globalThis.game.user.character = mara;
  await inspect(chestWith([message("It smells of lavender.")]));
  assert.match(cards(), /It smells of lavender\./);
  assert.strictEqual(stubState.chat[0].speaker.actor, "mara");
  assert.match(cards(), /verbInspected/);
});

test("an effect of the chest goes on the character that opened it", async () => {
  globalThis.game.user.character = mara;
  const chest = chestWith([{ id: "a1", kind: "effect", when: ACTION_TRIGGER_INSPECTED, effect: "e1", on: "self" }]);
  await inspect(chest);
  assert.strictEqual(created.length, 1);
  assert.strictEqual(created[0].name, "Cursed");
  assert.strictEqual(created[0].origin, "Actor.chest");
});

test("a library effect of the chest is used as it is: the chest keeps no copy of it", async () => {
  globalThis.game.user.character = mara;
  globalThis.fromUuid = async (uuid) => (uuid === "Compendium.x.lib.ActiveEffect.c" ? cursed : null);
  await inspect(chestWith([{ id: "a1", kind: "effect", when: ACTION_TRIGGER_INSPECTED, effect: "Compendium.x.lib.ActiveEffect.c", on: "self" }]));
  assert.strictEqual(created.length, 1);
  assert.strictEqual(created[0].name, "Cursed");
});

test("the GM opening the chest sets nothing off", async () => {
  globalThis.game.user = { isGM: true, character: mara };
  await inspect(chestWith([message("It smells of lavender.")]));
  assert.deepStrictEqual(stubState.chat, []);
  assert.deepStrictEqual(warnings, []);
});

test("a player with no character is told so, and only when the chest has actions for it", async () => {
  await inspect(chestWith([message("It smells of lavender.")]));
  assert.deepStrictEqual(stubState.chat, []);
  assert.match(warnings.join(" "), /noCharacter/);
  warnings.length = 0;
  await inspect(chestWith([]));
  assert.deepStrictEqual(warnings, []);
});

test("an item that is carried still acts on the one that carries it, and only when its owner opens it", async () => {
  const sword = { documentName: "Item", name: "Sword", uuid: "Item.s", isOwner: true, parent: mara, system: { actions: [message("It hums.")] }, effects: { get: () => undefined } };
  await inspect(sword);
  assert.match(cards(), /It hums\./);
  stubState.chat.length = 0;
  await inspect({ ...sword, isOwner: false });
  assert.deepStrictEqual(stubState.chat, []);
});
