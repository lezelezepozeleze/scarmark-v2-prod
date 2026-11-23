/** The on-hit effects of a weapon (a poisoned blade) at the strike: when the weapon wounds, each spends a charge and the strike card offers its test to the target; the target rolls it and, if it fails, gets the poison's effect. */
import { onHitEffects, isFailure } from "../../rules/index.mjs";
import { cardButton } from "./card-buttons.mjs";
import { spendOnHitCharge } from "./gm-update.mjs";
import { rollActionTest } from "../item-actions.mjs";
import { applyLibraryEffect } from "../effect-library.mjs";
import { esc } from "../escape.mjs";
import { say } from "../chat.mjs";

/**
 * The card buttons for the on-hit effects of the weapon that wounded: one "<effect>: roll the test" button per effect that still has a charge. Each spends a charge now (a resisted poison is used up too). Call it only for a wound that got through the armor.
 *
 * @param {Item|null} weapon the weapon or missile that struck
 * @param {Actor} victim the one struck
 * @returns {Promise<string>} the buttons' HTML ("" when there are none)
 */
export async function onHitButtons(weapon, victim) {
  let buttons = "";
  for (const poison of onHitEffects(weapon?.effects?.contents)) {
    const effect = weapon.effects.get(poison.id);
    if (!(await spendOnHitCharge(effect))) continue;
    buttons += cardButton("poison", { victim: victim.uuid, name: poison.name, test: poison.test, effect: poison.failEffect }, esc(game.i18n.format("SCARMARK.CombatAuto.poisonTest", { poison: poison.name })));
  }
  return buttons;
}

/**
 * The target rolls the test of an on-hit effect from the strike card; a failure (a miss or a critical failure) puts the effect on the target.
 *
 * @param {Actor} victim
 * @param {{name: string, test: string, effect: string}} data the button payload
 * @returns {Promise<boolean>} whether the test was rolled (the button then stays off)
 */
export async function rollOnHit(victim, data) {
  const result = await rollActionTest(victim, data.test);
  if (!result) return false;
  if (!isFailure(result.level)) return true;
  const applied = data.effect ? await applyLibraryEffect(victim, data.effect) : null;
  const key = applied ? "poisonFailed" : "poisonFailedNoEffect";
  await say(victim, `SCARMARK.CombatAuto.${key}`, { actor: victim.name, poison: data.name });
  return true;
}
