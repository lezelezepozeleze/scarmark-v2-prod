// A run of the actions of an item (helpers/actions/run.mjs): one runner per kind of action in a fixed order, and what a run says in the chat and in warnings. Fake items and actors only.
import { stubState, resetStubState } from "./support/foundry-stub.mjs";
import { test, beforeEach } from "node:test";
import assert from "node:assert";
import { ACTION_KINDS, ACTION_KIND_EFFECT, ACTION_KIND_MACRO, ACTION_TRIGGER_USED } from "../module/config/index.mjs";
import { ACTION_RUNNERS, runActions } from "../module/helpers/actions/run.mjs";

const warnings = [];
beforeEach(() => {
  resetStubState();
  warnings.length = 0;
  globalThis.ui.notifications.warn = (text) => warnings.push(text);
});

const actor = { documentName: "Actor", id: "a1", name: "Mara" };
const itemWith = (actions, parent = actor) => ({ name: "Whetstone", uuid: "Item.w", parent, system: { actions }, effects: { get: () => undefined } });
const message = (text, extra = {}) => ({ kind: "message", when: ACTION_TRIGGER_USED, message: text, ...extra });

test("every kind of action has a runner and every runner a kind, the effects first and the macros last", () => {
  assert.deepStrictEqual(Object.keys(ACTION_RUNNERS).sort(), Object.keys(ACTION_KINDS).sort());
  const order = Object.keys(ACTION_RUNNERS);
  assert.strictEqual(order[0], ACTION_KIND_EFFECT);
  assert.strictEqual(order.at(-1), ACTION_KIND_MACRO);
});

test("a run says what its actions did in one card each, the verb first", async () => {
  const done = await runActions(itemWith([message("It hums."), message("It glows.")]), ACTION_TRIGGER_USED);
  assert.strictEqual(done, 2);
  assert.strictEqual(stubState.chat.length, 2);
  assert.match(stubState.chat[0].content, /It hums\./);
  assert.match(stubState.chat[1].content, /It glows\./);
  assert.deepStrictEqual(warnings, []);
});

test("a use whose actions did nothing still says the item was used", async () => {
  const done = await runActions(itemWith([]), ACTION_TRIGGER_USED);
  assert.strictEqual(done, 0);
  assert.strictEqual(stubState.chat.length, 1);
  assert.match(stubState.chat[0].content, /SCARMARK\.Action\.verbUsed/);
});

test("an action that names nothing yet is reported, not skipped quietly", async () => {
  await runActions(itemWith([message("   ")]), ACTION_TRIGGER_USED);
  assert.strictEqual(warnings.length, 1);
  assert.match(warnings[0], /SCARMARK\.Action\.unfinished/);
});

test("an item that is on no character cannot act, and says so", async () => {
  const done = await runActions(itemWith([message("It hums.")], null), ACTION_TRIGGER_USED);
  assert.strictEqual(done, 0);
  assert.deepStrictEqual(stubState.chat, []);
  assert.match(warnings.join(" "), /SCARMARK\.Action\.noOwner/);
});

test("a message says {character} as the name of the character that carries the item", async () => {
  await runActions(itemWith([message("Hello, {character}!")]), ACTION_TRIGGER_USED);
  assert.match(stubState.chat.map(card => card.content).join(" "), /Hello, Mara!/);
});
