// The chat cards of actions: every card is a verb plus a result, and the sentences read the way the players expect. Built from the real lang/en.json.
import "./support/foundry-stub.mjs";
import { test } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { actionCardText } from "../module/view/action-card.mjs";
import { ACTION_TRIGGERS, ACTION_RESULTS } from "../module/config/index.mjs";

const lang = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "lang", "en.json"), "utf8"));
const format = (key, data) => key.split(".").reduce((node, part) => node?.[part], lang).replace(/\{(\w+)\}/g, (hole, name) => data[name] ?? hole);
const card = (trigger, who, result, data, on) => actionCardText(format, { verb: ACTION_TRIGGERS[trigger].verb, actor: "Mara", item: who, on }, result, data);

test("an item used on an item says so and what it is now: the whetstone and the knife", () => {
  assert.strictEqual(card("used", "Whetstone", ACTION_RESULTS.altered, { target: "Knife", effect: "Sharpened" }, "Knife"), "Mara used Whetstone on Knife. Knife is now Sharpened.");
  assert.strictEqual(card("used", "Anvil", ACTION_RESULTS.repaired, { target: "Plate", effect: "Repair" }, "Plate"), "Mara used Anvil on Plate. Plate is repaired.");
  assert.strictEqual(card("used", "Tonic", ACTION_RESULTS.immediate, { target: "Knife", effect: "Honing" }, "Knife"), "Mara used Tonic on Knife. Honing changes Knife.");
});

test("adding, removing and messages: the verb of the trigger, then the result", () => {
  assert.strictEqual(card("used", "Elixir", ACTION_RESULTS.added, { target: "Mara", effect: "Strong" }), "Mara used Elixir. Mara is now Strong.");
  assert.strictEqual(card("consumed", "Beer", ACTION_RESULTS.addedMany, { target: "Mara, Jan", effect: "Tipsy" }), "Mara consumed Beer. Mara, Jan are now Tipsy.");
  assert.strictEqual(card("inspected", "Amulet", ACTION_RESULTS.removed, { target: "Mara", effect: "Curse" }), "Mara inspected Amulet. Curse is removed from Mara.");
  assert.strictEqual(card("consumed", "Antidote", ACTION_RESULTS.removed, { target: "Jan", effect: "Venom" }), "Mara consumed Antidote. Venom is removed from Jan.");
  assert.strictEqual(card("used", "Candle", ACTION_RESULTS.message, { message: "It smells of lavender." }), "Mara used Candle. It smells of lavender.");
});

test("a weapon that wounds names the one it wounded in the verb", () => {
  assert.strictEqual(card("hit", "Dagger", ACTION_RESULTS.removed, { target: "Orc", effect: "Curse" }), "Dagger wounded Orc. Curse is removed from Orc.");
});

test("without a result the card is only the verb: the line an item that does nothing visible still says", () => {
  assert.strictEqual(card("used", "Whetstone"), "Mara used Whetstone.");
  assert.strictEqual(card("consumed", "Bread"), "Mara consumed Bread.");
});

test("every trigger that has a card says its verb, and used and consumed always announce themselves", () => {
  for (const [name, trigger] of Object.entries(ACTION_TRIGGERS)) {
    if (name === "owned" || trigger.plain) assert.strictEqual(trigger.verb, null);
    else assert.ok(format(trigger.verb, { actor: "A", item: "I", target: "T" }).length > 0, name);
  }
  assert.deepStrictEqual(Object.entries(ACTION_TRIGGERS).filter(([, trigger]) => trigger.announces).map(([name]) => name), ["used", "consumed"]);
  for (const key of Object.values(ACTION_RESULTS)) assert.ok(format(key, {}).length > 0, key);
});

test("a region behavior has no verb: its card is only what happened, and nothing when nothing did", () => {
  assert.strictEqual(card("region", "Plate", ACTION_RESULTS.message, { message: "Watch your step, Mara!" }), "Watch your step, Mara!");
  assert.strictEqual(card("region", "Plate", ACTION_RESULTS.added, { target: "Mara", effect: "Poisoned" }), "Mara is now Poisoned.");
  assert.strictEqual(card("region", "Plate"), "");
});
