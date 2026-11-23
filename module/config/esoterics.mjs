/** Esoteric (magic, religion) rule values. Pure data. */

/** Spell Level difficulty (Arcane Rules): -5 per Level above 1 (L2 -5 ... L6 -25). */
export const SPELL_LEVEL_STEP = 5;

/** Invocation difficulty: -5 ESL per Circle (target = ESL - circle x INVOCATION_CIRCLE_STEP). */
export const INVOCATION_CIRCLE_STEP = 5;

/**
 * Faith Points an Invocation costs, as a multiple of its Circle, by outcome level
 * (a Marginal Success or Critical Failure costs the full Circle).
 */
export const INVOCATION_FP_FACTOR = { cs: 0, ms: 1, mf: 0, cf: 1 };

/** Fatigue a Spell adds, by outcome level. */
export const SPELL_FATIGUE = { cs: 0, ms: 0, mf: 1, cf: 2 };

/** Change of an Injury's Wound Level on a Mend Rate roll, by outcome level. */
export const MEND_WL_DELTA = { cs: -2, ms: -1, mf: 0, cf: 1 };
