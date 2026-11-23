/** Effects that fire when a weapon wounds (a poisoned blade): which of an item's effects do, and how their charges count down. Pure. */
import { FLAGS } from "../constants.mjs";
import { ON_HIT_DEFAULT_TEST } from "../config/index.mjs";
import { effectFlags } from "./effect-flags.mjs";

/** Whether a stored charges value means "no limit" (never set, or the field left empty). */
const unlimited = (value) => value === undefined || value === null || value === "";

/**
 * The charges an effect has left: null for no limit, else a whole number of 0 or more.
 *
 * @param {*} value the charges flag as stored
 * @returns {number|null}
 */
export function chargesOf(value) {
  if (unlimited(value)) return null;
  const number = Math.trunc(Number(value));
  return Number.isFinite(number) ? Math.max(0, number) : null;
}

/**
 * The charges left after one wounding hit: null for an effect with no limit, else one fewer (0 means the effect is spent and goes).
 *
 * @param {*} value the charges flag as stored
 * @returns {number|null}
 */
export function chargesAfterHit(value) {
  const charges = chargesOf(value);
  return charges === null ? null : Math.max(0, charges - 1);
}

/**
 * The effects of an item that fire on a wounding hit: switched on, marked onHit, and with a charge left (or no limit).
 *
 * @param {Array<{id?: string, name?: string, disabled?: boolean, flags?: object}>} effects the item's effects
 * @returns {{id: string, name: string, test: string, failEffect: string, charges: number|null}[]}
 */
export function onHitEffects(effects) {
  const result = [];
  for (const effect of effects ?? []) {
    const scope = effectFlags(effect);
    if (effect.disabled || scope[FLAGS.onHit] !== true) continue;
    const charges = chargesOf(scope[FLAGS.charges]);
    if (charges === 0) continue;
    result.push({ id: effect.id, name: effect.name, test: scope[FLAGS.onHitTest] || ON_HIT_DEFAULT_TEST, failEffect: scope[FLAGS.onHitEffect] || "", charges });
  }
  return result;
}
