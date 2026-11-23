/** d100 test values. Pure data. */

/** A d100 roll that is a multiple of this is a critical (success or failure). */
export const CRITICAL_DIVISOR = 5;

/** Default multiplier of an attribute test (target = effective attribute x multiplier + modifier). */
export const ATTRIBUTE_TEST_MULTIPLIER = 5;

/** Fumble and Stumble tests: target = DEX (fumble) or AGL (stumble) x this. */
export const FUMBLE_STUMBLE_MULTIPLIER = 5;

/** Condition % assumed when an actor has no condition data (Shock Roll). */
export const SHOCK_FALLBACK_PCT = 100;
