/** Small localization helpers shared by the helper modules. */

/**
 * A function that localizes keys under one prefix: `const T = localizer("SCARMARK.Inventory")`, then `T("busy")` or `T("split", { name, keep })` (data makes it a format call).
 *
 * @param {string} prefix lang key prefix without the trailing dot
 */
export const localizer = (prefix) => (key, data) => (data
  ? game.i18n.format(`${prefix}.${key}`, data)
  : game.i18n.localize(`${prefix}.${key}`));

/** A string comparison for the current language: case and accent insensitive, numbers in natural order. */
export const collator = () => new Intl.Collator(game.i18n.lang, { sensitivity: "base", numeric: true });

/** Text for case-insensitive matching: trimmed and lower-cased. */
export const normalize = (value) => String(value ?? "").trim().toLocaleLowerCase();
