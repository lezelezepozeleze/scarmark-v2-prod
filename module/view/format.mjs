/** Display formatting for numbers on the sheets. Pure. */

/**
 * A number as shown on a sheet: at most 3 decimals, no trailing zeros ("2.5", "0.125", "4"), and "-" for a missing or non-numeric value.
 *
 * @param {*} value
 * @returns {string}
 */
export function formatNumber(value) {
  const missing = value == null || (typeof value === "string" && value.trim() === "");
  const n = missing ? NaN : Number(value);
  return Number.isFinite(n) ? String(Number(n.toFixed(3))) : "-";
}

/**
 * Durability as the Gear tab and the tooltip show it: "5/10" (current over original), "5/-" when the original is not set (0 or less).
 *
 * @param {number} quality current durability
 * @param {number} [original] the durability the piece started with
 */
export function durabilityText(quality, original) {
  return `${formatNumber(quality)}/${original > 0 ? formatNumber(original) : "-"}`;
}
