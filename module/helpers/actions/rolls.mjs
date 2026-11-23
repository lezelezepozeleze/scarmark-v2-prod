/** The "roll test" actions: a d100 against a skill or an attribute of the character, rolled with the Foundry dice and put in the card of the item. */
import { ATTRIBUTES, ATTRIBUTE_TEST_MULTIPLIER } from "../../config/index.mjs";
import { isTestAction, parseActionTest, capTarget } from "../../rules/index.mjs";
import { warn } from "../notify.mjs";
import { rollD100, rollD100Test } from "../dice/shared.mjs";
import { testBlock } from "../chat.mjs";
import { forEachAction, DONE, REFUSED } from "./shared.mjs";

/**
 * The test an action asks of a character: a d100 against the ESL of the test's skill of the character (found by name), or against its effective attribute times the test multiplier. `value` is a roll-down value ("skill:<name>" or "attribute:<key>").
 *
 * @returns {{title: string, target: number}|null} the title of the roll (HTML-safe) and its target, or null when the character cannot take the test (reported to the user)
 */
function testTarget(actor, value) {
  const test = parseActionTest(value);
  if (!test) return null;
  if (test.type === "attribute") {
    const attribute = actor.system.attributes?.[test.name];
    if (!attribute) {
      warn("SCARMARK.Action.noAttribute", { actor: actor.name, attribute: test.name });
      return null;
    }
    const label = game.i18n.localize(ATTRIBUTES[test.name]?.label ?? test.name);
    return { title: `${label} ${game.i18n.localize("SCARMARK.Test")}`, target: capTarget(attribute.effective * ATTRIBUTE_TEST_MULTIPLIER) };
  }
  const skill = actor.items.find(i => i.type === "skill" && i.name.toLowerCase() === test.name.toLowerCase());
  if (!skill) {
    warn("SCARMARK.Action.noSkill", { actor: actor.name, skill: test.name });
    return null;
  }
  return { title: `${skill.name} ${game.i18n.localize("SCARMARK.Test")}`, target: capTarget(skill.system.esl) };
}

/** Roll a test for the actor now and post its own roll card (the poison on a blade uses it). Returns { roll, level }, or null when the actor cannot take the test. */
export async function rollActionTest(actor, value) {
  const test = testTarget(actor, value);
  return test ? rollD100Test(actor, test.title, test.target) : null;
}

/**
 * Roll the test actions of `item` that fire on `trigger`, each for the character, with the Foundry dice. The roll goes into the run: its block (the target, the roll, the outcome) and its dice. What the outcome does to the character is not automatic: effects are added by hand after the roll. A character without the skill gets a warning and no roll.
 *
 * @param {object} context the run: { item, trigger, run }
 * @returns {Promise<number>} how many tests were rolled
 */
export function runTestActions({ item, trigger, run }) {
  return forEachAction({ item, trigger, run }, isTestAction, async (action, actor) => {
    const test = testTarget(actor, action.test);
    if (!test) return REFUSED;   // testTarget has told the user why
    const { roll, level } = await rollD100(test.target);
    run.rolls.push(roll);
    run.blocks += testBlock({ title: test.title, target: test.target, roll: roll.total, level });
    return DONE;
  });
}
