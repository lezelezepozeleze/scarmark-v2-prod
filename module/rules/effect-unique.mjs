/** "Unique" effects: an effect with the unique box ticked cannot exist twice on the same item or actor. Pure. */
import { FLAGS } from "../constants.mjs";
import { effectFlags } from "./effect-flags.mjs";

/** Whether the effect has its unique box ticked. */
export const isUniqueEffect = (effect) => effectFlags(effect)[FLAGS.unique] === true;

/**
 * What makes two effects "the same effect": the compendium entry they were copied from (an alteration, a library effect, or any compendium drop), else their name.
 *
 * @param {{name?: string, flags?: object, _stats?: {compendiumSource?: string}}} effect an effect as plain data
 * @returns {string}
 */
export function effectIdentity(effect) {
  const scope = effectFlags(effect);
  return scope[FLAGS.improvedBy] || scope[FLAGS.librarySource] || effect?._stats?.compendiumSource || `name:${String(effect?.name ?? "").trim().toLowerCase()}`;
}

/**
 * The effect that blocks adding `candidate`, or null: one that is the same effect while either of them has the unique box ticked.
 *
 * @param {Array<object>} existing the effects the document already has
 * @param {object} candidate the effect about to be added
 * @returns {object|null}
 */
export function uniqueConflict(existing, candidate) {
  const identity = effectIdentity(candidate);
  const candidateUnique = isUniqueEffect(candidate);
  return (existing ?? []).find(effect => (candidateUnique || isUniqueEffect(effect)) && effectIdentity(effect) === identity) ?? null;
}
