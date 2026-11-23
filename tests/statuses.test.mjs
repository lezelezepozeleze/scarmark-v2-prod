// The status effects write -20 / -30 style penalties into system.mods.*; the numbers live in module/config/statuses.mjs.
import { test } from "node:test";
import assert from "node:assert";
import { SCARMARK_STATUSES } from "../module/helpers/statuses.mjs";

const SKILL_KEYS = ["combat", "esoterics", "psionic"].map(c => `system.mods.skills.${c}`);
const summarize = (id) => Object.fromEntries(SCARMARK_STATUSES.find(s => s.id === id).changes.map(c => [c.key, Number(c.value)]));
const skills = (n) => Object.fromEntries(SKILL_KEYS.map(k => [k, n]));

test("statuses: the penalties are the ones the rules book gives", () => {
  assert.deepStrictEqual(SCARMARK_STATUSES.map(s => s.id), ["prone", "grappled", "pinnedDown", "entangled", "stun"]);
  assert.deepStrictEqual(summarize("prone"), { ...skills(-20), "system.mods.incomingMelee": 20, "system.mods.incomingMissile": -20 });
  assert.deepStrictEqual(summarize("grappled"), skills(-20));
  assert.deepStrictEqual(summarize("pinnedDown"), { ...skills(-30), "system.mods.incomingMelee": 30, "system.mods.incomingMissile": -30 });
  assert.deepStrictEqual(summarize("entangled"), skills(-30));
  assert.deepStrictEqual(summarize("stun"), { "system.mods.defense": -30 });
});
