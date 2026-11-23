/** Repairing an armor piece or a weapon: a one-shot change of its stored data. Armor wear is one number for the whole piece, its durability (`quality`); a weapon has a durability too (`quality`, 0 for a natural weapon that cannot break) and a broken flag. Pure. */
import { QUALITY_PERMANENT, QUALITY_INITIAL } from "../config/index.mjs";

/**
 * Repair: the piece goes back to its original durability (a piece with no original durability: its current one, else the default).
 *
 * @param {{originalQuality: number, quality: number}} armor the stored data of the armor
 * @returns {{quality: number}} the fields to write
 */
export function repairedArmor({ originalQuality, quality }) {
  const current = quality > 0 ? quality : QUALITY_INITIAL;
  return { quality: originalQuality > 0 ? originalQuality : current };
}

/**
 * Why an armor piece cannot be repaired, or null when it can: "natural" (Natural Armor never wears).
 *
 * @param {{quality?: number}} armor the stored data of the armor
 * @returns {"natural"|null}
 */
export const armorRepairProblem = (armor) => (armor.quality === QUALITY_PERMANENT ? "natural" : null);

/**
 * Repair of a weapon: it is no longer broken. A weapon has no original durability recorded, so its durability (`quality`) is the reference and stays as it is (the wear of a shield is not given back).
 *
 * @returns {{broken: false}} the fields to write
 */
export const repairedWeapon = () => ({ broken: false });

/**
 * Why a weapon cannot be repaired, or null when it can: "naturalWeapon" (durability 0: a natural weapon cannot break) or "intact" (it is not broken, so there is nothing to repair).
 *
 * @param {{quality?: number, broken?: boolean}} weapon the stored data of the weapon
 * @returns {"naturalWeapon"|"intact"|null}
 */
export function weaponRepairProblem(weapon) {
  if (!(weapon.quality > 0)) return "naturalWeapon";
  return weapon.broken ? null : "intact";
}
