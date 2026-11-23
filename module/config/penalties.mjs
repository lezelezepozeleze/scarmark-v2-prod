/**
 * Penalty model (skills reworked in 1.0.53). There is no pooled Burden any more: each source
 * lowers ATTRIBUTES (attribute rolls, Endurance, Move), and the same penalty points also lower
 * EVERY skill and psionic ESL by a fixed SKILL_PENALTY_PER_POINT, whatever attributes the skill
 * uses (rules/derived.mjs skillPenaltyOf). The old per-skill Base delta is gone, so Active
 * Effects on attributes no longer move skills.
 *  - Fatigue: -1 to every attribute per FATIGUE_STEP points (Endurance too).
 *  - Load: carrying capacity = STR + STA in kg (with effects, without penalties);
 *    -1 AGL per started LOAD_STEP (20 %) above it, at most LOAD_MAX_STEPS; more
 *    than LOAD_MAX_FACTOR x capacity cannot be carried at all.
 *  - Wounds: Condition = Endurance - WL; at or below a band's share of Endurance
 *    the WOUND_ATTRIBUTES (DEX, AGL) lose the band's points. Bands are checked in
 *    order, the lowest share first.
 */
export const FATIGUE_STEP = 2;
export const LOAD_STEP = 0.2;
export const LOAD_MAX_FACTOR = 2;
/** The most Load steps that count: the steps between the capacity and LOAD_MAX_FACTOR x capacity (5). */
export const LOAD_MAX_STEPS = Math.round((LOAD_MAX_FACTOR - 1) / LOAD_STEP);
export const WOUND_ATTRIBUTES = ["dex", "agl"];

/** The attribute that loses one point per Load step (carrying more than the capacity). */
export const LOAD_PENALTY_ATTRIBUTE = "agl";
export const CONDITION_BANDS = [
  { max: 0.25, penalty: 2, key: "critical" },
  { max: 0.5, penalty: 1, key: "wounded" }
];

/** At or below this share of Endurance every new wound calls for a Shock Roll: the share of the heaviest Condition band (0.25). Macros may read it as SCARMARK.SHOCK_THRESHOLD. */
export const SHOCK_THRESHOLD = CONDITION_BANDS[0].max;

/**
 * Mastery cap for d100 success tests. A skill/attribute/esoteric/combat target
 * (ESL/EML, after all modifiers) is capped at this value, so even ESL >= 100
 * keeps a ~5% failure chance (rolls 96-00), of which 1% (a rolled 00/100) is a
 * Critical Failure. Applied via capTarget() in rules/d100.mjs; also used by the d100 Shock Roll.
 */
export const ESL_CAP = 95;

/** Attributes that make up Endurance (their average, after the Fatigue penalty). */
export const ENDURANCE_ATTRIBUTES = ["str", "sta", "wil"];

/** Carrying capacity in kg = the sum of these attributes (their base values, with effects, without penalties). */
export const LOAD_CAPACITY_ATTRIBUTES = ["str", "sta"];

/** Load % shown when the actor can carry nothing (capacity 0) but carries something. */
export const LOAD_PCT_OVERLOADED = 999;

/** ESL lost by every skill and psionic talent per penalty point (fatigue steps + load steps + wound band points). Macros may read it as SCARMARK.SKILL_PENALTY_PER_POINT. */
export const SKILL_PENALTY_PER_POINT = 5;

/** A new actor's Condition starts at (and is at most) this value until Endurance is derived. */
export const CONDITION_INITIAL = 100;

/** The lowest Condition maximum a token bar shows (Endurance 0 still gives a bar of 1). */
export const CONDITION_MAX_FLOOR = 1;

/** Factor between a share (0.25) and the percent shown (25). */
export const PERCENT = 100;
