/** The names of armor coverage entries ({ type, side }) as the armor sheet and the item tooltip show them. Pure: the text lookups are passed in. */
import { armorLocationLabel, hasSides } from "../rules/index.mjs";

/**
 * "Head", "Left Arm", or "Arm (both sides)" for a type that has sides and is covered on both.
 *
 * @param {{type: string, side?: string}} entry
 * @param {{localize: (key: string) => string, format: (key: string, data: object) => string}} i18n
 */
export function coverageLabel(entry, { localize, format }) {
  const name = localize(armorLocationLabel(entry.type));
  if (entry.side) return format("SCARMARK.ArmorLocation.sidedLabel", { side: localize(`SCARMARK.ArmorLocation.sides.${entry.side}`), location: name });
  return hasSides(entry.type) ? `${name} (${localize("SCARMARK.Armor.bothSides")})` : name;
}
