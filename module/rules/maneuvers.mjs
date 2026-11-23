/**
 * The numbers that appear in a maneuver's description. They come from config (status penalties, the attribute test multiplier), so the text follows the values.
 *
 * Pure: no Foundry globals.
 */
import { STATUS_PENALTIES, ATTRIBUTE_TEST_MULTIPLIER } from "../config/index.mjs";

const signed = (n) => (n > 0 ? `+${n}` : String(n));

/**
 * Placeholder values for the lang description of a maneuver ({skills}, {melee}, {missile}, {mult}); an empty object for maneuvers with no numbers from config.
 *
 * @param {string} id maneuver id
 * @returns {Object<string, string|number>}
 */
export function maneuverTextValues(id) {
  if (id === "grapple") return { skills: signed(STATUS_PENALTIES.grappled.skills) };
  if (id === "pin") {
    const pinned = STATUS_PENALTIES.pinnedDown;
    return { mult: ATTRIBUTE_TEST_MULTIPLIER, skills: signed(pinned.skills), melee: signed(pinned.incomingMelee), missile: signed(pinned.incomingMissile) };
  }
  return {};
}
