/**
 * Combat lookups: which shields block a missile, the Dodge against a missile, the range band, aimed strikes (aim, called part, penalty), the Outnumbered defense penalty and the worn-armor protection sum.
 *
 * Pure: no Foundry globals; values come from module/config/ (combat.mjs).
 */
import { RANGED_BLOCK_SHIELDS, HIGH_VELOCITY_DODGE_DIVISOR, AIM, OUTNUMBERED_STEPS } from "../config/index.mjs";
import { locationKey } from "./locations.mjs";

/**
 * Names of the shields that may Block a missile of this velocity ("low" adds the Buckler).
 *
 * @param {"low"|"high"} velocity
 * @returns {string[]} weapon-item names
 */
export const rangedBlockShields = (velocity) =>
  velocity === "low" ? [...RANGED_BLOCK_SHIELDS.always, ...RANGED_BLOCK_SHIELDS.lowVelocityOnly] : [...RANGED_BLOCK_SHIELDS.always];

/**
 * Dodge target against a missile: a High-Velocity Missile divides it by HIGH_VELOCITY_DODGE_DIVISOR (rounded down).
 *
 * @param {number} dodge
 * @param {"low"|"high"} velocity
 * @returns {number}
 */
export const dodgeVsMissile = (dodge, velocity) => (velocity === "high" ? Math.floor(dodge / HIGH_VELOCITY_DODGE_DIVISOR) : dodge);

/** Range band of a missile for a measured distance: "short", "medium", "long", "extreme", or null when out of range. `range` holds the four thresholds. */
export function rangeBand(range, distance) {
  if (distance <= range.short) return "short";
  if (distance <= range.medium) return "medium";
  if (distance <= range.long) return "long";
  if (distance <= range.extreme) return "extreme";
  return null;
}

/**
 * The aim a dialog or card may carry: an unknown one is the default (mid). Object.hasOwn: "constructor" and other inherited names are not aims.
 *
 * @param {string} aim
 * @returns {string} a key of AIM
 */
export const aimKey = (aim) => (Object.hasOwn(AIM, aim) ? aim : "mid");

/**
 * Is a struck location (its type, old keys allowed, and its side) the called part? "general" and unknown parts match every location. A location with no side matches a left or right part.
 *
 * @param {string} aim
 * @param {string} part
 * @param {string} type the struck location's type
 * @param {string} [side] "left", "right" or ""
 * @returns {boolean}
 */
export const matchesAimPart = (aim, part, type, side = "") => {
  const spec = AIM[aimKey(aim)].parts[part];
  return !spec || (spec.types.includes(locationKey(type)) && (!spec.side || !side || spec.side === side));
};

/**
 * The parts offered for an aim, in order: "general" first (unless the aim only offers parts), then the called parts of config AIM.
 * With the target's locations ([{ type, side }]), only the parts the target has a location for are offered.
 *
 * @param {string} aim
 * @param {Array<{type: string, side?: string}>|null} [locations]
 * @returns {string[]}
 */
export const aimPartKeys = (aim, locations = null) => {
  const key = aimKey(aim);
  const def = AIM[key];
  const present = Object.keys(def.parts).filter(part => !locations || locations.some(l => matchesAimPart(key, part, l.type, l.side)));
  return [...(def.general === false ? [] : ["general"]), ...present];
};

/**
 * The part an aim really has: an unknown or missing one is the first part offered. "" when the aim offers none (Disarm against a target with no hand).
 *
 * @param {string} aim
 * @param {string} part
 * @param {Array<{type: string, side?: string}>|null} [locations] the target's locations
 * @returns {string}
 */
export const aimPartKey = (aim, part, locations = null) => {
  const keys = aimPartKeys(aim, locations);
  return keys.includes(part) ? part : (keys[0] ?? "");
};

/**
 * The total ASL penalty of aiming at a part ("general" is the penalty of the aim itself).
 *
 * @param {string} aim
 * @param {string} [part]
 * @returns {number}
 */
export const aimPenalty = (aim, part = "general") => {
  const def = AIM[aimKey(aim)];
  return def.parts[part]?.penalty ?? def.penalty;
};

/**
 * Defense-only Outnumbered penalty (steps in module/config/combat.mjs OUTNUMBERED_STEPS): outnumbered by exactly 2 = 20, by 3 or more = 30, otherwise 0.
 *
 * `count` is the number of attackers (the actor's mods.outnumbered). A non-integer such as 2.5 gives 0. Returns the positive size of the penalty; the caller subtracts it. data/base-actor-schema.mjs outnumberedPenalty(actor) reads the actor's mod and calls this.
 *
 * @param {number} count
 * @returns {number} 0, 20 or 30
 */
export function outnumberedPenaltyFor(count) {
  const step = OUTNUMBERED_STEPS.find(s => (s.orMore ? count >= s.attackers : count === s.attackers));
  return step ? step.penalty : 0;
}

/**
 * Worn-armor protection: the sum of one aspect's protection over the armor pieces covering a location.
 *
 * Which pieces count (worn, not destroyed, covering the location) is decided by the caller (helpers/combat/armor.mjs coveringArmor); this only adds up. A piece without a value for the aspect counts as 0.
 *
 * @param {Array<{system: {protection?: Object<string, number>, effective?: {protection?: Object<string, number>}}}>} pieces (the effective protection, with the modifiers of the item's effects, is used when the piece has one)
 * @param {string} aspect blunt | edged | piercing | fire
 * @returns {number}
 */
export function protectionSum(pieces, aspect) {
  return pieces.reduce((sum, piece) => sum + (piece.system.effective?.protection?.[aspect] ?? piece.system.protection?.[aspect] ?? 0), 0);
}
