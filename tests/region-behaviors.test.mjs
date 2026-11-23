// The region behavior (a token crosses or stops in a Region): who sets it off, its one type and the events it listens to, what it does when an event arrives, what the chat says, and its sheet. Fake behaviors, events and users only.
import { stubState, resetStubState } from "./support/foundry-stub.mjs";
import { test, beforeEach } from "node:test";
import assert from "node:assert";
import { SYSTEM_ID, QUERIES } from "../module/constants.mjs";
import { REGION_WHEN, REGION_WHO, REGION_FREQUENCY, REGION_EVENTS, ACTION_TRIGGER_REGION } from "../module/config/index.mjs";
import { whoMatches, isSpent } from "../module/rules/index.mjs";
import { buildRegionBehaviorSheet } from "../module/view/region-behavior-view.mjs";
import { registerRegionBehaviors } from "../module/foundry/region-behaviors.mjs";
import { blankAction, ACTIONS_PANEL_TEMPLATES } from "../module/sheets/actions/action-panel.mjs";
import ScarmarkRegionBehaviorSheet from "../module/sheets/region-behavior-sheet.mjs";

const warnings = [];
const created = [];
const logged = [];
const registered = {};
beforeEach(() => {
  resetStubState();
  warnings.length = 0;
  created.length = 0;
  logged.length = 0;
  globalThis.ui.notifications.warn = (text) => warnings.push(text);
  globalThis.foundry.utils.deepClone = structuredClone;
  globalThis.game.users = { activeGM: null };
  globalThis.game.user = { isGM: false };
  console.warn = (...args) => logged.push(args);
  globalThis.CONFIG = { RegionBehavior: { dataModels: {}, typeIcons: {} } };
  globalThis.foundry.documents = { RegionBehavior: { name: "RegionBehavior" } };
  globalThis.foundry.applications.apps = { DocumentSheetConfig: { registerSheet: (...args) => { registered.args = args; } } };
  registerRegionBehaviors();
});

const pc = { type: "character", hasPlayerOwner: true };
const npc = { type: "npc", hasPlayerOwner: false };
const orc = { type: "creature", hasPlayerOwner: false };
const wolf = { type: "animal", hasPlayerOwner: false };

test("who: every choice picks the right tokens", () => {
  const who = (key) => [pc, npc, orc, wolf].filter(actor => whoMatches(key, actor));
  assert.deepStrictEqual(who("everyone"), [pc, npc, orc, wolf]);
  assert.deepStrictEqual(who("players"), [pc]);
  assert.deepStrictEqual(who("npcs"), [npc, orc, wolf], "not owned by a player");
  assert.deepStrictEqual(who("humanoids"), [pc, npc]);
  assert.deepStrictEqual(who("creatures"), [orc]);
  assert.deepStrictEqual(who("animals"), [wolf]);
  assert.deepStrictEqual(who("beasts"), [orc, wolf]);
  assert.strictEqual(whoMatches("mystery", pc), false);
});

test("a creature owned by a player is a player's, not an npc's", () => {
  const pet = { type: "animal", hasPlayerOwner: true };
  assert.strictEqual(whoMatches("players", pet), true);
  assert.strictEqual(whoMatches("npcs", pet), false);
});

test("a behavior is used up only when it is for once and has been set off", () => {
  assert.deepStrictEqual([isSpent("once", true), isSpent("once", false), isSpent("always", true)], [true, false, false]);
});

test("one behavior type: it listens to both events and keeps when, who, how often, spent and the actions", () => {
  assert.deepStrictEqual(Object.keys(globalThis.CONFIG.RegionBehavior.dataModels), ["step"]);
  assert.deepStrictEqual(REGION_EVENTS, ["tokenMoveIn", "tokenEnter"]);
  assert.deepStrictEqual(Object.values(REGION_WHEN).map(entry => entry.event), REGION_EVENTS);
  const schema = globalThis.CONFIG.RegionBehavior.dataModels.step.defineSchema();
  assert.deepStrictEqual(schema.events.options, { events: REGION_EVENTS, initial: REGION_EVENTS });
  assert.deepStrictEqual(schema.when.options.choices, Object.keys(REGION_WHEN));
  assert.deepStrictEqual(schema.who.options.choices, Object.keys(REGION_WHO));
  assert.deepStrictEqual(schema.frequency.options.choices, Object.keys(REGION_FREQUENCY));
  assert.ok("spent" in schema && "actions" in schema);
});

test("the behavior opens in the system's own sheet", () => {
  const [document, system, sheet, options] = registered.args;
  assert.strictEqual(document.name, "RegionBehavior");
  assert.strictEqual(system, SYSTEM_ID);
  assert.strictEqual(sheet, ScarmarkRegionBehaviorSheet);
  assert.deepStrictEqual(options.types, ["step"]);
  assert.deepStrictEqual(ScarmarkRegionBehaviorSheet.PARTS.body.templates, ACTIONS_PANEL_TEMPLATES);
});

// ---- what a behavior does when an event arrives
const mara = Object.assign({ documentName: "Actor", id: "mara", uuid: "Actor.mara", name: "Mara", isOwner: true, createEmbeddedDocuments: async (type, data) => { created.push(...data); return data; } }, pc);
const message = (text) => ({ id: "a1", kind: "message", when: ACTION_TRIGGER_REGION, message: text });

/** A behavior as the model sees it: the document is `behavior`, its data `system`. */
function behaviorOf(system = {}, extra = {}) {
  const behavior = {
    documentName: "RegionBehavior", name: "Pressure plate", uuid: "RegionBehavior.b1", isOwner: true, parent: { name: "Plate region" }, type: "step",
    system: { when: "crossed", who: "everyone", frequency: "always", pause: false, spent: false, actions: [message("Click.")], ...system },
    update: async (data) => { if ("system.spent" in data) behavior.system.spent = data["system.spent"]; },
    getFlag: () => undefined,
    setFlag: async () => {},
    ...extra
  };
  return { behavior, data: Object.assign(Object.create(globalThis.CONFIG.RegionBehavior.dataModels.step.prototype), { behavior }) };
}
const event = (name, actor = mara, user = { isSelf: true }) => ({ name, user, data: { token: { actor } } });
const cards = () => stubState.chat.map(entry => entry.content).join(" ");

test("crossed: a token's move into the region sets the actions off as the token's actor, and the other event does not", async () => {
  const { data } = behaviorOf({ when: "crossed" });
  await data._handleRegionEvent(event("tokenEnter"));
  assert.deepStrictEqual(stubState.chat, [], "that is the event of stopped");
  await data._handleRegionEvent(event("tokenMoveIn"));
  assert.match(cards(), /Click\./);
  assert.strictEqual(stubState.chat[0].speaker.actor, "mara");
});

test("stopped: a token that ends up in the region sets the actions off, and the other event does not", async () => {
  const { data } = behaviorOf({ when: "stopped" });
  await data._handleRegionEvent(event("tokenMoveIn"));
  assert.deepStrictEqual(stubState.chat, []);
  await data._handleRegionEvent(event("tokenEnter"));
  assert.match(cards(), /Click\./);
});

test("an event caused by another user is left to that user's client", async () => {
  const { data } = behaviorOf();
  await data._handleRegionEvent(event("tokenMoveIn", mara, { isSelf: false }));
  assert.deepStrictEqual(stubState.chat, []);
  assert.deepStrictEqual(logged, []);
});

test("a token the behavior is not for sets nothing off", async () => {
  const { data } = behaviorOf({ who: "players" });
  await data._handleRegionEvent(event("tokenMoveIn", Object.assign({ name: "Orc", id: "orc", isOwner: true }, orc)));
  assert.deepStrictEqual(stubState.chat, []);
});

test("an event without a user or a token is logged, not dropped quietly", async () => {
  const { data } = behaviorOf();
  await data._handleRegionEvent({ name: "tokenMoveIn", data: { token: { actor: mara } } });
  await data._handleRegionEvent({ name: "tokenMoveIn", user: { isSelf: true }, data: {} });
  assert.strictEqual(logged.length, 2);
  assert.deepStrictEqual(stubState.chat, []);
});

test("every time: it sets off again and again", async () => {
  const { data } = behaviorOf();
  await data._handleRegionEvent(event("tokenMoveIn"));
  await data._handleRegionEvent(event("tokenMoveIn"));
  assert.strictEqual(stubState.chat.length, 2);
});

test("once: the GM's client marks it spent and runs it, and it does not run again", async () => {
  const { behavior, data } = behaviorOf({ frequency: "once" });
  await data._handleRegionEvent(event("tokenMoveIn"));
  assert.strictEqual(behavior.system.spent, true);
  assert.strictEqual(stubState.chat.length, 1);
  await data._handleRegionEvent(event("tokenMoveIn"));
  assert.strictEqual(stubState.chat.length, 1);
});

test("once: a player asks the GM to mark it spent, and runs it when that went through", async () => {
  const asked = [];
  globalThis.game.users.activeGM = { query: async (query, payload) => { asked.push([query, payload]); } };
  const { data } = behaviorOf({ frequency: "once" }, { isOwner: false });
  await data._handleRegionEvent(event("tokenMoveIn"));
  assert.deepStrictEqual(asked, [[QUERIES.spendRegionBehavior, { uuid: "RegionBehavior.b1" }]]);
  assert.strictEqual(stubState.chat.length, 1);
});

test("once: with no GM connected it cannot be marked, so it does not run, and the player is told", async () => {
  const { data } = behaviorOf({ frequency: "once" }, { isOwner: false });
  await data._handleRegionEvent(event("tokenMoveIn"));
  assert.deepStrictEqual(stubState.chat, []);
  assert.match(warnings.join(" "), /needGM/);
});

// ---- what the chat says: the step says nothing by itself
test("the step says nothing by itself: without actions the chat stays quiet", async () => {
  const { data } = behaviorOf({ actions: [] });
  await data._handleRegionEvent(event("tokenMoveIn"));
  assert.deepStrictEqual(stubState.chat, []);
});

test("a message action says its text, with the character's name where {character} stands, and nothing else", async () => {
  const { data } = behaviorOf({ actions: [message("Watch your step, {character}!")] });
  await data._handleRegionEvent(event("tokenMoveIn"));
  assert.match(cards(), /Watch your step, Mara!/);
  assert.doesNotMatch(cards(), /\{character\}|Pressure plate|verb/);
});

test("the cards of a region behavior have no verb, only what happened", async () => {
  const cursed = { name: "Cursed", toObject: () => ({ name: "Cursed", flags: {}, duration: {} }) };
  globalThis.fromUuid = async (uuid) => (uuid === "Compendium.x.lib.ActiveEffect.c" ? cursed : null);
  const effect = { id: "a2", kind: "effect", when: ACTION_TRIGGER_REGION, effect: "Compendium.x.lib.ActiveEffect.c", on: "self" };
  const { data } = behaviorOf({ actions: [effect] });
  await data._handleRegionEvent(event("tokenMoveIn"));
  assert.match(cards(), /resultAdded/);
  assert.doesNotMatch(cards(), /verb|cardLine/);
  assert.strictEqual(created.length, 1, "a behavior holds no effects, so the library effect is used as it is");
  assert.strictEqual(created[0].name, "Cursed");
});

// ---- pause the game
test("pause: the GM's client pauses the game for everybody, then the actions run", async () => {
  const paused = [];
  globalThis.game.user = { isGM: true };
  globalThis.game.togglePause = (...args) => { paused.push(args); };
  const { data } = behaviorOf({ pause: true });
  await data._handleRegionEvent(event("tokenMoveIn"));
  assert.deepStrictEqual(paused, [[true, { broadcast: true }]]);
  assert.strictEqual(stubState.chat.length, 1);
});

test("pause: a player asks the GM to pause it", async () => {
  const asked = [];
  globalThis.game.users.activeGM = { query: async (query, payload) => { asked.push([query, payload]); } };
  const { data } = behaviorOf({ pause: true });
  await data._handleRegionEvent(event("tokenMoveIn"));
  assert.deepStrictEqual(asked, [[QUERIES.pauseGame, {}]]);
});

test("pause: with no GM connected the player is told, and the actions still run", async () => {
  const { data } = behaviorOf({ pause: true });
  await data._handleRegionEvent(event("tokenMoveIn"));
  assert.match(warnings.join(" "), /needGM/);
  assert.strictEqual(stubState.chat.length, 1);
});

test("pause: a behavior without the box does not pause", async () => {
  const paused = [];
  globalThis.game.user = { isGM: true };
  globalThis.game.togglePause = (...args) => { paused.push(args); };
  const { data } = behaviorOf();
  await data._handleRegionEvent(event("tokenMoveIn"));
  assert.deepStrictEqual(paused, []);
});

test("the sheet: when, who and how often with the current choice selected, and the spent box only for once", () => {
  const t = (key) => key;
  const view = buildRegionBehaviorSheet({ name: "Plate", system: { when: "stopped", who: "beasts", frequency: "once", pause: true, spent: true } }, { localize: t });
  assert.deepStrictEqual(view.whenOptions.filter(option => option.selected).map(option => option.value), ["stopped"]);
  assert.strictEqual(view.whenHint, "SCARMARK.Region.stoppedHint");
  assert.deepStrictEqual(view.whoOptions.filter(option => option.selected).map(option => option.value), ["beasts"]);
  assert.deepStrictEqual(view.frequencyOptions.filter(option => option.selected).map(option => option.value), ["once"]);
  assert.deepStrictEqual([view.showSpent, view.spent, view.pause], [true, true, true]);
  const always = buildRegionBehaviorSheet({ system: { when: "crossed", who: "everyone", frequency: "always", spent: false } }, { localize: t });
  assert.deepStrictEqual([always.showSpent, always.name], [false, ""]);
});

test("a new action starts with the one trigger the document is offered", () => {
  assert.strictEqual(blankAction({ documentName: "RegionBehavior", type: "step" }, "x").when, ACTION_TRIGGER_REGION);
  assert.strictEqual(blankAction({ documentName: "Actor", type: "container" }, "x").when, "inspected");
  assert.strictEqual(blankAction({ documentName: "Item", type: "gear" }, "x").when, "", "an item has several, so the user picks");
});
