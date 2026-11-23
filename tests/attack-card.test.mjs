// The melee attack card: what it shows for each aim, that names are escaped, and what the buttons carry.
import { stubState, resetStubState } from "./support/foundry-stub.mjs";
import { test } from "node:test";
import assert from "node:assert";

const { declareMeleeAttack } = await import("../module/helpers/combat/attack.mjs");
const { aimOptions } = await import("../module/helpers/combat/dialogs.mjs");

const sword = { id: "w1", name: "Long <b>sword", type: "weapon", system: { associatedSkill: "close", attack: 5, defense: 0, specialization: 0, broken: false, impact: { blunt: -1, edged: 6, piercing: -1, fire: -1 } } };
const skill = { id: "k1", type: "skill", name: "SCARMARK.CombatSkill.close", system: { esl: 50 } };
const items = [sword, skill];
items.get = (id) => items.find(i => i.id === id);
const attacker = { uuid: "Actor.a", name: "Aldric's", items, system: { mods: {} } };
const victim = { uuid: "Actor.v", name: "Vic", items: [], system: { mods: { incomingMelee: 20 } } };

async function declare(aim) {
  resetStubState();
  globalThis.game.user = { targets: new Set([{ actor: victim }]) };
  globalThis.foundry.applications.api.DialogV2.prompt = async () => ({ weaponId: "w1", aspect: "edged", aim, modifier: 0 });
  await declareMeleeAttack(attacker, "w1");
  return stubState.chat.at(-1).content;
}

test("the attack card: names escaped, ASL with the target status, defenses offered", async () => {
  const card = await declare("mid");
  assert.ok(card.includes("Aldric&#x27;s &rarr; Vic"));
  assert.ok(card.includes("Long &lt;b&gt;sword"));
  assert.ok(card.includes("ASL <b>75</b>"), "50 skill + 5 attack + 20 vs prone = 75");
  assert.deepStrictEqual([...card.matchAll(/data-defense="(\w+)"/g)].map(m => m[1]), ["ignore", "block", "dodge", "riposte", "counterstrike"]);
});

test("the attack card: an aimed attack names the aim and shows its penalty once", async () => {
  const card = await declare("high");
  assert.strictEqual([...card.matchAll(/-10/g)].length, 1, "the penalty appears once on the card");
  assert.ok(card.includes("SCARMARK.CombatAuto.aim_high -10"), card);
  assert.ok(card.includes("ASL <b>65</b>"));
  assert.ok(!(await declare("mid")).includes("aim_mid"), "the default aim adds nothing to the card");
});

test("the aim options carry the penalty from config", () => {
  const options = aimOptions(true);
  assert.ok(options.includes('value="high">SCARMARK.CombatAuto.aimOption{"name":"SCARMARK.CombatAuto.aim_high","penalty":-10}'));
  assert.ok(options.includes('value="mid">SCARMARK.CombatAuto.aimOptionNone'));
  assert.ok(options.includes('"penalty":-20'));
  assert.ok(!aimOptions(false).includes("disarm"));
});

test("a called part: its own penalty replaces the zone penalty and the card names it", async () => {
  resetStubState();
  globalThis.game.user = { targets: new Set([{ actor: victim }]) };
  globalThis.foundry.applications.api.DialogV2.prompt = async () => ({ weaponId: "w1", aspect: "edged", aim: "high", part: "head", modifier: 0 });
  await declareMeleeAttack(attacker, "w1");
  const card = stubState.chat.at(-1).content;
  assert.ok(card.includes("aim_high: SCARMARK.CombatAuto.part_head -15"), card);
  assert.ok(card.includes("ASL <b>60</b>"), "50 + 5 + 20 vs prone - 15");
  assert.ok(card.includes('"part":"head"'), "the part travels with the card");
});

test("aim parts: options and filter follow config", async () => {
  const { aimPartOptions, aimFilter } = await import("../module/helpers/combat/dialogs.mjs");
  assert.deepStrictEqual([...aimPartOptions("mid").matchAll(/value="(\w+)"/g)].map(m => m[1]), ["general", "torso", "leftArm", "rightArm", "leftHand", "rightHand"]);
  assert.deepStrictEqual([...aimPartOptions("disarm").matchAll(/value="(\w+)"/g)].map(m => m[1]), ["rightHand", "leftHand"]);
  const loc = (locationType, side = "") => ({ name: "", system: { locationType, side } });
  assert.strictEqual(aimFilter("mid", "general"), null);
  const leftArm = aimFilter("mid", "leftArm");
  assert.ok(leftArm(loc("arm", "left")) && !leftArm(loc("arm", "right")) && !leftArm(loc("hand", "left")));
  assert.ok(aimFilter("mid", "torso")(loc("belly")) && aimFilter("mid", "torso")(loc("chest")));
  assert.ok(aimFilter("disarm", "rightHand")(loc("hand", "right")) && !aimFilter("disarm", "rightHand")(loc("hand", "left")), "Disarm names one hand");
  assert.ok(aimFilter("disarm")(loc("hand", "right")) && !aimFilter("disarm")(loc("hand", "left")), "an old Disarm card with no part takes the right hand");
  assert.ok(aimFilter("high", "neck")(loc("neck", "left")) && !aimFilter("high", "neck")(loc("head")), "a part with no side in config never needs a side");
});

test("aim parts: only what the target has is offered", async () => {
  const { aimPartOptions, aimOptions, targetLocations } = await import("../module/helpers/combat/dialogs.mjs");
  const target = { items: [
    { type: "armorLocation", name: "Head", system: { locationType: "head", side: "" } },
    { type: "armorLocation", name: "Chest", system: { locationType: "chest", side: "" } },
    { type: "armorLocation", name: "Right Arm", system: { locationType: "arm", side: "right" } },
    { type: "gear", name: "Rope", system: {} }
  ] };
  const locations = targetLocations(target);
  const keys = (html) => [...html.matchAll(/value="(\w+)"/g)].map(m => m[1]);
  assert.deepStrictEqual(keys(aimPartOptions("mid", null, locations)), ["general", "torso", "rightArm"]);
  assert.deepStrictEqual(keys(aimPartOptions("high", null, locations)), ["general", "head"]);
  assert.deepStrictEqual(keys(aimOptions(true, locations)), ["mid", "high", "low"], "no hand, so no Disarm");
  assert.deepStrictEqual(keys(aimOptions(true, [...locations, { type: "hand", side: "left" }])), ["mid", "high", "low", "disarm"]);
  assert.deepStrictEqual(keys(aimPartOptions("disarm", null, [{ type: "hand", side: "left" }])), ["leftHand"]);
});
