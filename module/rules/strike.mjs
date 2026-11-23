/**
 * Strike calculations: the dice of a strike, the Wound Level a location's thresholds give, Armor-Piercing and armor wear, and the weighted pick of a hit location.
 *
 * Pure: no Foundry globals and no randomness (the random number is a parameter); numbers come from module/config/ (combat.mjs, locations.mjs).
 */
import { STRIKE_DICE, INJURY_THRESHOLDS, ARMOR_WEAR_CHANCE, ARMOR_PIERCING_DIVISOR } from "../config/index.mjs";

/**
 * Number of d6 a successful strike rolls: a Critical Success (cs) rolls 3, any other success rolls 2 (STRIKE_DICE in module/config/combat.mjs).
 *
 * Pure: no Foundry globals. Only meaningful for a success level; callers check the success first (the body-part clash strike in helpers/combat/clash.mjs always rolls the normal number and does not use this).
 *
 * @param {"cs"|"ms"|"mf"|"cf"} level outcome level of the striking side
 * @returns {number} 3 or 2
 */
export function strikeDice(level) {
  return level === "cs" ? STRIKE_DICE.critical : STRIKE_DICE.normal;
}

/**
 * Wound Level (0 = none) a location's injury thresholds give at an effective impact. The highest threshold the impact reaches wins (INJURY_THRESHOLDS); a missing threshold counts as 0.
 *
 * @param {Object} injury the location's injury thresholds (t1, t5, t9, t13, t17)
 * @param {number} effImpact
 * @returns {number}
 */
export function injuryLevelFor(injury, effImpact) {
  const step = INJURY_THRESHOLDS.find(t => effImpact >= t.impact);
  return step ? (injury[step.key] ?? 0) : 0;
}

/**
 * Point armor left after an Armor-Piercing strike: the armor divided by ARMOR_PIERCING_DIVISOR, rounded down.
 *
 * @param {number} armorProt
 * @returns {number}
 */
export const armorAfterPiercing = (armorProt) => Math.floor(armorProt / ARMOR_PIERCING_DIVISOR);

/**
 * Does a hit wear a piece of armor (ARMOR_WEAR_CHANCE)?
 *
 * @param {number} random a number in [0, 1) passed in by the caller
 * @returns {boolean}
 */
export const armorWears = (random) => random < ARMOR_WEAR_CHANCE;

/**
 * Pick an index from weights with a random number in [0, 1) passed in by the caller. Walks the weights in order and takes the first one the random share runs out in; falls back to the last index. The caller handles an all-zero total.
 *
 * @param {number[]} weights
 * @param {number} random
 * @returns {number}
 */
export function pickWeighted(weights, random) {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = random * total;
  // Half-open buckets [start, end): r exactly on a boundary belongs to the NEXT bucket, and a zero-weight bucket is never picked.
  for (let i = 0; i < weights.length; i++) { r -= weights[i]; if (r < 0) return i; }
  const lastPositive = weights.findLastIndex(w => w > 0);
  return lastPositive >= 0 ? lastPositive : weights.length - 1;
}
