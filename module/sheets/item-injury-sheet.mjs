/** Sheet of an injury: wound level, mend rate, heavy bleeding and effects. */
import ScarmarkItemSheetBase from "./item-sheet-base.mjs";
import { rollMendRate } from "../helpers/dice.mjs";
import { propertiesTabs, itemSheetParts } from "./item-layout.mjs";

/**
 * Injury sheet: a lean Details panel - Wound Level, Mend Rate, a Heavy Bleeding
 * checkbox, and a Note (Severity is shown derived from Wound Level) - plus an
 * Effects tab so poisons, infections and diseases can ride the injury as Active
 * Effects.
 */
export default class ScarmarkInjurySheet extends ScarmarkItemSheetBase {

  static DEFAULT_OPTIONS = {
    classes: ["injury"],
    position: { width: 440, height: 380 },
    actions: { rollMend: ScarmarkInjurySheet.#onRollMend }
  };

  static #onRollMend() {
    rollMendRate(this.document.actor, this.document);
  }

  // Properties + Effects (the tab id stays "details" so the .details CSS applies).
  static TABS = propertiesTabs();

  static PARTS = itemSheetParts("injury/body", ["details-tab", "notes-field"]);

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const key = CONFIG.SCARMARK.severityKey(this.document.system.woundLevel);
    context.severityLabel = game.i18n.localize(CONFIG.SCARMARK.injurySeverities[key]);
    context.vitalOptions = CONFIG.SCARMARK.vitalStates;
    const mend = this.document.system.mend;
    context.mendOptions = CONFIG.SCARMARK.mendRates.map(v => ({
      value: v,
      label: CONFIG.SCARMARK.mendLabel(v),
      selected: v === mend
    }));
    return context;
  }
}
