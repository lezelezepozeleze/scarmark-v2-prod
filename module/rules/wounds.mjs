/**
 * Wound calculations: vital wounds, severity, the injury catalog lookup, the mend label, the Shock Roll target and the Stun Test bonus.
 *
 * Pure: no Foundry globals; values come from module/config/ (wounds.mjs, combat.mjs).
 */
import { VITAL_WOUNDS, VITAL_MIN_LEVEL, VITAL_MAX_LEVEL, INJURY_TYPES, MIN_WOUND_LEVEL, MAX_WOUND_LEVEL, SEVERITY_BY_LEVEL, SEVERITY_TOP, SHOCK_TARGET_FACTOR, STUN_ARMOR_BONUSES } from "../config/index.mjs";
import { locationKey } from "./locations.mjs";
import { capTarget } from "./d100.mjs";

/**
 * Vital state of a Wound Level at a location type: Dire and Mortal wounds to a vital location take the victim out or leave them dying.
 *
 * @param {string} locType a location type (an old key is read as the type it became)
 * @param {number} woundLevel
 * @returns {""|"out"|"dying"} "" when the location is not vital or the level is too low
 */
export function vitalWoundFor(locType, woundLevel) {
  const entry = VITAL_WOUNDS[locationKey(locType)];
  if (!entry || woundLevel < VITAL_MIN_LEVEL) return "";
  return entry[Math.min(VITAL_MAX_LEVEL, woundLevel)] ?? "";
}

/**
 * Severity for a Wound Level: 1 Light, 2 Heavy, 3 Severe, 4 Dire, 5+ Mortal (SEVERITY_BY_LEVEL). A level that is not a number counts as 0 (Light).
 *
 * @param {number} level
 * @returns {string} a key of INJURY_SEVERITIES
 */
export function severityKey(level) {
  const lvl = Number(level) || 0;
  return SEVERITY_BY_LEVEL.find(row => lvl <= row.max)?.key ?? SEVERITY_TOP;
}

/**
 * Look up the injury type entry for an aspect and a Wound Level (the level is clamped to MIN_WOUND_LEVEL..MAX_WOUND_LEVEL).
 *
 * @param {string} aspect a damage aspect (blunt, edged, piercing, fire)
 * @param {number} level
 * @returns {{name: string, heavyBleeding: boolean, amputation: boolean}|null} null for an unknown aspect
 */
export function injuryFor(aspect, level) {
  const lvl = Math.max(MIN_WOUND_LEVEL, Math.min(MAX_WOUND_LEVEL, level));
  return INJURY_TYPES[aspect]?.[lvl] ?? null;
}

/** Label of a Mend Rate: its number, or "MRN" (Mend Rate: Narrative) for 0. */
export const mendLabel = (n) => (Number(n) > 0 ? String(n) : "MRN");

/**
 * Shock Roll target: d100 against SHOCK_TARGET_FACTOR (2) x Condition %, capped with capTarget (rules/d100.mjs). Condition 25 % gives 50, every point closer to 0 makes it harder.
 *
 * Pure: no Foundry globals. A percent that is not a number counts as 0. Callers still pass the cap (SCARMARK.ESL_CAP) as a second argument; it is ignored, capTarget owns the cap.
 *
 * @param {number} pct Condition percentage (system.condition.pct, never negative)
 * @returns {number}
 */
export function shockTarget(pct) {
  return capTarget(Math.max(0, SHOCK_TARGET_FACTOR * (Number(pct) || 0)));
}

/**
 * Stun Test bonus from head armor: the best armor layer worn on the Head (layer 5 +20, layers 2-4 +10, else 0; STUN_ARMOR_BONUSES).
 *
 * @param {number} layer
 * @returns {number}
 */
export function stunProtectionBonus(layer) {
  return STUN_ARMOR_BONUSES.find(step => layer >= step.minLayer)?.bonus ?? 0;
}
