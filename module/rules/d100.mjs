/**
 * The d100 success test: the target cap (ESL_CAP) and the outcome level of a roll. Every d100 roll of the system (skills, attributes, esoterics, combat, Shock) ends here.
 *
 * Pure: no Foundry globals; the numbers come from module/config/ (penalties.mjs ESL_CAP, tests.mjs CRITICAL_DIVISOR).
 */
import { ESL_CAP, CRITICAL_DIVISOR } from "../config/index.mjs";

/**
 * Cap a d100 success-test target (ESL/EML, after modifiers) at ESL_CAP (95). This is the "ESL >= 100 rolls as 95" rule: it guarantees rolls of 96-00 still fail, so a master never becomes literally infallible. Apply at each target's computation so the SAME value drives outcomeLevel AND the chat card. Applies to every d100 success test, including the Shock Roll.
 *
 * Pure: no Foundry globals.
 *
 * @param {number} target
 * @returns {number}
 */
export function capTarget(target) {
  return Math.min(ESL_CAP, target);
}

/**
 * d100 roll against a target -> outcome level. A multiple of CRITICAL_DIVISOR (5) is critical.
 *
 * @param {number} roll
 * @param {number} target
 * @returns {"cs"|"ms"|"mf"|"cf"}
 */
export function outcomeLevel(roll, target) {
  const crit = roll % CRITICAL_DIVISOR === 0;
  const success = roll <= target;
  if (success) return crit ? "cs" : "ms";
  return crit ? "cf" : "mf";
}

/** Whether an outcome level is a failure (a miss or a critical failure). */
export const isFailure = (level) => level === "mf" || level === "cf";
