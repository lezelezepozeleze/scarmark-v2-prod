/**
 * Small strike calculations the combat helpers used to do inline: which hit location a roll picks, which forced test a wound triggers and whether a strike takes the attacker's Impact modifier. Pure: values come from module/config/, random numbers are parameters.
 */
import { DEFAULT_AIM_ZONE, FUMBLE_TEST_LOCATIONS, STUMBLE_TEST_LOCATIONS, IMPACT_SKILLS } from "../config/index.mjs";
import { locationKey } from "./locations.mjs";
import { pickWeighted } from "./strike.mjs";

/**
 * Aim weight of each hit location in a zone. Two-sided locations (Left and Right Shoulder) are separate items sharing a Location Type, so the canon weight is split evenly across the items of one type: the pair is not hit twice as often as a single location.
 *
 * @param {{type: string, aim?: Object<string, number>}[]} locations the candidates: Location Type and the aim weights of the item
 * @param {string} [zone] "high", "medium" or "low"; a zone the location has no weight for falls back to its medium weight
 * @returns {number[]} one weight per location, in the same order
 */
export function locationWeights(locations, zone = DEFAULT_AIM_ZONE) {
  const counts = {};
  for (const l of locations) counts[l.type] = (counts[l.type] ?? 0) + 1;
  return locations.map(l => (l.aim?.[zone] ?? l.aim?.[DEFAULT_AIM_ZONE] ?? 0) / (counts[l.type] || 1));
}

/**
 * Index of the struck location: weighted by its aim value in the zone; the first one when no location has any weight.
 *
 * @param {{type: string, aim?: Object<string, number>}[]} locations the candidates (at least one)
 * @param {string} zone
 * @param {() => number} random supplies a number in [0, 1); called once, and not at all when every weight is 0
 * @returns {number}
 */
export function strikeLocationIndex(locations, zone, random) {
  const weights = locationWeights(locations, zone);
  if (weights.reduce((s, w) => s + w, 0) <= 0) return 0;
  return pickWeighted(weights, random());
}

/**
 * The forced test a wound triggers by its location: "fumble" (hand from WL 1, arm from WL 3), "stumble" (thigh and shin from WL 1) or null.
 *
 * @param {string} locType Location Type of the struck location (an old key is mapped to its current one)
 * @param {number} woundLevel
 * @returns {"fumble"|"stumble"|null}
 */
export function fumbleStumbleKind(locType, woundLevel) {
  const type = locationKey(locType);
  if (woundLevel >= (FUMBLE_TEST_LOCATIONS[type] ?? Infinity)) return "fumble";
  if (woundLevel >= (STUMBLE_TEST_LOCATIONS[type] ?? Infinity)) return "stumble";
  return null;
}

/**
 * The attacker's Impact modifier a strike takes: only muscle-driven strikes (Close and Unarmed Combat, thrown missiles included); Ranged and Arcane Combat get none.
 *
 * @param {string|null} skill associated combat skill key of the weapon or missile
 * @param {number} impactMod the attacker's system.mods.impact
 * @returns {number}
 */
export const impactBonusFor = (skill, impactMod) => (IMPACT_SKILLS.includes(skill) ? impactMod : 0);
