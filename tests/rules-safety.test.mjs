// Edge cases of the pure rules: bad input (NaN, undefined, unknown keys) gives a number and never NaN or undefined, and the constants derived from each other stay equal to the values the rules book gives.
import { test } from "node:test";
import assert from "node:assert";
import {
  invocationPenalty, invocationFpCost, invocationTarget, spellFatigue, mendWoundLevelDelta, severityKey, injuryFor, shockTarget, capTarget,
  gearIsCarried, gearSummary, skillOverridesOf, sunsignBonusOf, skillCategoryMod, conditionPctOf, conditionResourceOf, moveResourceOf, standaloneEslOf,
  HELPER_GROUPS, HELPER_GROUP
} from "../module/rules/index.mjs";
import {
  LOAD_STEP, LOAD_MAX_FACTOR, LOAD_MAX_STEPS, SHOCK_THRESHOLD, CONDITION_BANDS, BODY_PART_STRIKE, STRIKE_DICE, WOUND_LEVELS, MAX_WOUND_LEVEL, AMPUTATION_WOUND_LEVEL,
  VITAL_MAX_LEVEL, MEND_RATE_MAX, MEND_RATES, ESL_CAP, CHARACTER_ATTRIBUTE_KEYS, CREATURE_ATTRIBUTE_KEYS
} from "../module/config/index.mjs";

test("invocationPenalty: a Circle that is not a number counts as 0", () => {
  assert.strictEqual(invocationPenalty(3), 15);
  assert.deepStrictEqual([undefined, null, NaN, "x"].map(invocationPenalty), [0, 0, 0, 0]);
  assert.strictEqual(invocationTarget(60, undefined), 60);
});

test("invocationFpCost, spellFatigue, mendWoundLevelDelta: an unknown outcome level costs nothing", () => {
  assert.strictEqual(invocationFpCost("ms", 3), 3);
  assert.strictEqual(invocationFpCost("cs", 3), 0);
  assert.strictEqual(invocationFpCost("zz", 3), 0);
  assert.strictEqual(invocationFpCost(undefined, 3), 0);
  assert.strictEqual(invocationFpCost("ms", NaN), 0);
  assert.strictEqual(spellFatigue("cf"), 2);
  assert.strictEqual(spellFatigue("zz"), 0);
  assert.strictEqual(mendWoundLevelDelta("cs"), -2);
  assert.strictEqual(mendWoundLevelDelta(undefined), 0);
});

test("severityKey: a Wound Level that is not a number is Light, not Mortal", () => {
  assert.deepStrictEqual([1, 2, 3, 4, 5, 9].map(severityKey), ["light", "heavy", "severe", "dire", "mortal", "mortal"]);
  assert.deepStrictEqual([NaN, undefined, null, "x"].map(severityKey), ["light", "light", "light", "light"]);
  assert.strictEqual(severityKey("3"), "severe");
});

test("injuryFor: the level is clamped to 1..MAX_WOUND_LEVEL, an unknown aspect is null", () => {
  assert.strictEqual(injuryFor("blunt", 0).name, "Bruise");
  assert.strictEqual(injuryFor("blunt", 99).name, "Mortal Crush");
  assert.strictEqual(injuryFor("nope", 3), null);
});

test("shockTarget: a percent that is not a number counts as 0; the cap is capTarget's and a second argument is ignored", () => {
  assert.deepStrictEqual([NaN, undefined, null, "x"].map(p => shockTarget(p)), [0, 0, 0, 0]);
  assert.strictEqual(shockTarget(25), 50);
  assert.strictEqual(shockTarget(100), capTarget(200));
  assert.strictEqual(shockTarget(100, 10), ESL_CAP);
  assert.strictEqual(shockTarget(-5), 0);
});

test("gearSummary: only carried items count, a stored container drops its contents, a missing container counts as carried", () => {
  const items = [
    { id: "bag", type: "container", system: { carried: true, container: "", totalWeight: 1 } },
    { id: "chest", type: "container", system: { carried: false, container: "", totalWeight: 20 } },
    { id: "a", type: "weapon", system: { carried: true, container: "", totalWeight: 3 } },
    { id: "b", type: "missile", system: { carried: true, container: "bag", totalWeight: 2 } },
    { id: "c", type: "armor", system: { carried: true, container: "chest", totalWeight: 7 } },
    { id: "d", type: "gear", system: { carried: true, container: "gone", totalWeight: 0.5 } },
    { id: "e", type: "gear", system: { carried: false, container: "", totalWeight: 9 } },
    { id: "f", type: "gear", system: { carried: true, container: "" } }
  ];
  const byId = new Map(items.map(i => [i.id, i]));
  const summary = gearSummary(items, gearIsCarried(id => byId.get(id)));
  assert.deepStrictEqual(summary, { weapon: 3, missile: 2, armor: 0, miscGear: 1.5, total: 6.5 });
  const missingCarried = { id: "x", type: "gear", system: { container: "" } };
  assert.strictEqual(gearIsCarried(() => undefined)(missingCarried), false);
});

test("skillOverridesOf: the highest priority wins, only override changes on skill keys with a number count", () => {
  const change = (type, key, value, priority) => ({ type, key, value, priority });
  const effects = [
    { system: { changes: [change("override", "system.mods.skill.Vitality", "50", 10), change("add", "system.mods.skill.Vitality", "5", 1)] } },
    { system: { changes: [change("override", "system.mods.skill.VITALITY", "70", 90), change("override", "system.mods.skill.Stealth", "x", 1), change("override", "system.mods.other", "1", 1)] } },
    { system: {} }, {}
  ];
  assert.deepStrictEqual(skillOverridesOf(effects), { vitality: 70 });
  assert.deepStrictEqual(skillOverridesOf([]), {});
});

test("skill helpers: sunsign bonus, category mod and the Skill Base delta", () => {
  assert.strictEqual(sunsignBonusOf([{ sunsign: "leo", bonus: 5 }, { sunsign: "", bonus: 9 }], "leo"), 5);
  assert.strictEqual(sunsignBonusOf([{ sunsign: "", bonus: 9 }], ""), 0);
  assert.strictEqual(sunsignBonusOf(undefined, "leo"), 0);
  const mods = { combat: 10, psionic: 4 };
  assert.deepStrictEqual([skillCategoryMod("skill", "combat", mods), skillCategoryMod("skill", "esoterics", mods), skillCategoryMod("psionic", "", mods)], [10, 0, 4]);
  // Pre-1.0.51 keys fold into their category; several legacy keys count once (the largest absolute value), not summed.
  const legacy = { skill: 2, physical: -5, communication: -5, craft: -5, esoterics: 0, religion: 3, magic: -4 };
  assert.strictEqual(skillCategoryMod("skill", "skill", legacy), -3, "skill 2 + the largest legacy key -5");
  assert.strictEqual(skillCategoryMod("skill", "esoterics", legacy), -4, "magic -4 outweighs religion 3");
});

test("condition helpers: percent, token bar maximum never below 1, move bar", () => {
  assert.strictEqual(conditionPctOf(0.256), 26);
  assert.deepStrictEqual(conditionResourceOf(0, 0), { value: 0, max: 1 });
  assert.deepStrictEqual(conditionResourceOf(7, 9), { value: 7, max: 9 });
  assert.deepStrictEqual(moveResourceOf(8), { value: 8, max: 8 });
  assert.strictEqual(standaloneEslOf(-3), 0);
  assert.strictEqual(standaloneEslOf(40), 40);
});

test("derived constants equal the rules book values", () => {
  assert.strictEqual(LOAD_MAX_STEPS, 5);
  assert.strictEqual(LOAD_MAX_STEPS * LOAD_STEP + 1, LOAD_MAX_FACTOR);
  assert.strictEqual(SHOCK_THRESHOLD, 0.25);
  assert.strictEqual(SHOCK_THRESHOLD, CONDITION_BANDS[0].max);
  assert.strictEqual(BODY_PART_STRIKE.dice, STRIKE_DICE.normal);
  assert.deepStrictEqual(WOUND_LEVELS, [0, 1, 2, 3, 4, 5]);
  assert.strictEqual(MAX_WOUND_LEVEL, 5);
  assert.strictEqual(AMPUTATION_WOUND_LEVEL, 5);
  assert.strictEqual(VITAL_MAX_LEVEL, 5);
  assert.strictEqual(MEND_RATE_MAX, 6);
  assert.deepStrictEqual(MEND_RATES, [0, 1, 2, 3, 4, 5, 6]);
  assert.strictEqual(CHARACTER_ATTRIBUTE_KEYS.length, 9);
  assert.deepStrictEqual(CREATURE_ATTRIBUTE_KEYS, CHARACTER_ATTRIBUTE_KEYS.filter(key => key !== "pre"));
});

test("HELPER_GROUP: every group of HELPER_GROUPS has its index, and the object is frozen", () => {
  assert.deepStrictEqual(Object.fromEntries(HELPER_GROUPS.map((key, index) => [key.toUpperCase(), index])), HELPER_GROUP);
  assert.ok(Object.isFrozen(HELPER_GROUP));
});
