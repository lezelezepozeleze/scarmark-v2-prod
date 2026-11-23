/** Targets of the Mend Rate and Psionic rolls. Pure: the caller applies capTarget on top. */

/** Mend Rate target before the cap: Endurance x the injury's current Mend Rate. */
export const mendTarget = (endurance, mend) => endurance * mend;

/** Psionic talent target before the cap: the talent's ESL plus the situational modifier, never below 0. */
export const psionicTarget = (esl, modifier) => Math.max(0, esl + (modifier || 0));
