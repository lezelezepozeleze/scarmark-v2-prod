/** Pieces the dice modules share: the d100 roll, the d100 test card, the acting actor and Fatigue. */
import { testCard, speak } from "../chat.mjs";
import { outcomeLevel } from "../../rules/index.mjs";

/**
 * Roll a d100 against a finished target.
 * @param {number} target the (capped) target number
 * @returns {Promise<{roll: Roll, level: "cs"|"ms"|"mf"|"cf"}>} the evaluated roll and its success level
 */
export async function rollD100(target) {
  const roll = await new Roll("1d100").evaluate();
  return { roll, level: outcomeLevel(roll.total, target) };
}

/**
 * Roll a plain d100 test against a finished target and post the result card: the shared tail of the attribute and skill tests (each builds its own target first). Returns { roll, level } so a caller can act on the outcome.
 */
export async function rollD100Test(actor, title, target) {
  const { roll, level } = await rollD100(target);
  await speak(actor, testCard({ title, target, roll: roll.total, level }), { rolls: [roll] });
  return { roll, level };
}

/** The actor a macro acts for: the first controlled token's actor, else the user's assigned character (undefined when there is neither). */
export const controlledActor = () => canvas.tokens?.controlled?.[0]?.actor ?? game.user.character;

/**
 * Add Fatigue to an actor's STORED value. Never add onto the prepared
 * `system.resources.fatigue`: Active Effects (hangover, disease, poison, a
 * stimulant's override 0) already sit in it, and writing it back would bake the
 * effect into the base permanently. Works for unlinked token actors too.
 */
export function addFatigue(actor, amount) {
  if (!actor || !amount) return;
  const base = actor._source?.system?.resources?.fatigue ?? 0;
  return actor.update({ "system.resources.fatigue": Math.max(0, base + amount) });
}
