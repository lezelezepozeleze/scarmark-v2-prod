/**
 * The view model of the sheet of a region behavior (sheets/region-behavior-sheet.mjs, templates/region/behavior.hbs). Pure: the text comes through `localize`.
 */
import { REGION_WHEN, REGION_WHO, REGION_FREQUENCY, REGION_ONCE } from "../config/index.mjs";
import { option } from "./options.mjs";

/** The roll-down options of a table of config/regions.mjs, the current one selected. */
const options = (table, current, t) => Object.entries(table).map(([value, { label }]) => option(value, t(label), current));

/**
 * @param {{name?: string, disabled?: boolean, system: {when: string, who: string, frequency: string, pause: boolean, spent: boolean}}} behavior the region behavior as data
 * @param {{localize: (key: string) => string}} o the translator
 */
export function buildRegionBehaviorSheet(behavior, { localize: t }) {
  const { when, who, frequency, pause, spent } = behavior.system;
  return {
    name: behavior.name ?? "",
    disabled: Boolean(behavior.disabled),
    whenOptions: options(REGION_WHEN, when, t),
    whenHint: REGION_WHEN[when] ? t(REGION_WHEN[when].hint) : "",
    whoOptions: options(REGION_WHO, who, t),
    frequencyOptions: options(REGION_FREQUENCY, frequency, t),
    pause: Boolean(pause),
    showSpent: frequency === REGION_ONCE,
    spent: Boolean(spent)
  };
}
