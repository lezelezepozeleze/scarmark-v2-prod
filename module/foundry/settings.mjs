/** World settings and the values read from them. */
import { SYSTEM_ID, SETTINGS } from "../constants.mjs";

/**
 * Register the system's settings (the init hook).
 *
 * Hidden units switch. false = legacy world data (weights in "ounces" of 0.5 kg, distances in feet / miles); the one-shot macro convert-to-metric.js (removed from the tree, see git history before 1.0.56) converted the data to kg / m / km and turns it on. The Load maths reads it (weightUnitsPerKg), so Encumbrance is the same before and after.
 */
export function registerSettings() {
  game.settings.register(SYSTEM_ID, SETTINGS.metricUnits, {
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  });
  // Client setting, no menu entry: the macro toggle-hidden-description.js flips it. A gear item stores a description that no sheet shows; while this is on, its sheet shows the editor under the Note.
  game.settings.register(SYSTEM_ID, SETTINGS.showHiddenDescription, {
    scope: "client",
    config: false,
    type: Boolean,
    default: false,
    onChange: () => {
      for (const app of foundry.applications.instances.values()) {
        if (app.document?.documentName === "Item" && app.document.type === "gear") app.render();
      }
    }
  });
}

/** Whether the hidden Description editor of gear items is switched on (false when the setting is not registered, e.g. in Node tests). */
export function showHiddenDescription() {
  try { return game.settings.get(SYSTEM_ID, SETTINGS.showHiddenDescription) === true; }
  catch { return false; }
}

/**
 * Units of the stored item weights: 1 unit per kg once the world is converted to metric, 2 before (the legacy "ounces" of 0.5 kg). Any error (setting not registered yet, no `game`, e.g. in Node tests) gives 2. CONFIG.SCARMARK.weightUnitsPerKg is this function.
 */
export function weightUnitsPerKg() {
  try { return game.settings.get(SYSTEM_ID, SETTINGS.metricUnits) ? 1 : 2; }
  catch { return 2; }
}
