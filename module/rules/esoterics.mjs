/**
 * Esoteric difficulty steps: the Spell Level and Invocation Circle penalties, the targets they give, the Faith Points and Fatigue of an outcome and the Mend Rate change.
 *
 * Pure: no Foundry globals; values come from module/config/ (esoterics.mjs). A Level or Circle that is not a number and an outcome level the tables do not know count as 0 and never give NaN or undefined.
 */
import { SPELL_LEVEL_STEP, INVOCATION_CIRCLE_STEP, INVOCATION_FP_FACTOR, SPELL_FATIGUE, MEND_WL_DELTA } from "../config/index.mjs";

/**
 * Spell Level difficulty: L1 -0, then -SPELL_LEVEL_STEP per Level above 1. Shared by the cast roll and the ESL on the Esoterics tab.
 *
 * @param {number} level a missing or non-numeric Level counts as 1
 * @returns {number} the positive size of the penalty
 */
export const spellLevelPenalty = (level) => Math.max(0, (Number(level) || 1) - 1) * SPELL_LEVEL_STEP;

/**
 * Invocation difficulty for a Circle: INVOCATION_CIRCLE_STEP per Circle.
 *
 * @param {number} circle a missing or non-numeric Circle counts as 0
 * @returns {number} the positive size of the penalty
 */
export const invocationPenalty = (circle) => (Number(circle) || 0) * INVOCATION_CIRCLE_STEP;

/**
 * Spell target before the cap: the Magic skill's ESL minus the Level penalty, never below 0. The roll applies capTarget on top; the sheet shows it uncapped.
 *
 * @param {number} esl the Magic skill's ESL
 * @param {number} level the spell's Level
 * @returns {number}
 */
export const spellTarget = (esl, level) => Math.max(0, esl - spellLevelPenalty(level));

/**
 * Invocation target before the cap: the skill's ESL minus the Circle penalty, never below 0. The roll applies capTarget on top; the sheet shows it uncapped.
 *
 * @param {number} esl the Religion skill's ESL
 * @param {number} circle the invocation's Circle
 * @returns {number}
 */
export const invocationTarget = (esl, circle) => Math.max(0, esl - invocationPenalty(circle));

/**
 * Faith Points an Invocation costs for an outcome level (INVOCATION_FP_FACTOR x Circle).
 *
 * @param {"cs"|"ms"|"mf"|"cf"} level
 * @param {number} circle
 * @returns {number} 0 for an unknown outcome level
 */
export const invocationFpCost = (level, circle) => (INVOCATION_FP_FACTOR[level] ?? 0) * (Number(circle) || 0);

/**
 * Fatigue a Spell adds for an outcome level.
 *
 * @param {"cs"|"ms"|"mf"|"cf"} level
 * @returns {number} 0 for an unknown outcome level
 */
export const spellFatigue = (level) => SPELL_FATIGUE[level] ?? 0;

/**
 * Change of an Injury's Wound Level for a Mend Rate roll outcome level.
 *
 * @param {"cs"|"ms"|"mf"|"cf"} level
 * @returns {number} 0 for an unknown outcome level
 */
export const mendWoundLevelDelta = (level) => MEND_WL_DELTA[level] ?? 0;
