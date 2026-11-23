/** Sheet of an armor location: a tab-less Properties panel. */
import ScarmarkItemSheetBase from "./item-sheet-base.mjs";
import { headerPart, bodyParts } from "./item-layout.mjs";
import { LOCATION_SIDES } from "../config/index.mjs";

/**
 * Armor Location sheet: a single, tab-less panel. A location is a very basic
 * thing - it never carries Active Effects and needs no description - so there
 * is only the Properties view (header + body, no tab navigation).
 *
 * Picking a Location Type pre-fills the aim/injury/risk fields from the
 * canonical CONFIG.SCARMARK.armorLocations table; individual fields stay
 * editable afterwards. See _prepareSubmitData.
 */
export default class ScarmarkArmorLocationSheet extends ScarmarkItemSheetBase {

  static DEFAULT_OPTIONS = {
    classes: ["armor-location"],
    position: { width: 500, height: 480 }
  };

  // No tabs.
  static TABS = {};

  static PARTS = {
    header: headerPart(),
    ...bodyParts("armor-location/body", ["notes-field"])
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.locationTypes = CONFIG.SCARMARK.armorLocations;
    context.sideOptions = LOCATION_SIDES;
    context.injuryResults = CONFIG.SCARMARK.woundLevels;   // Wound Levels 0-5 (0 = no wound)
    return context;
  }

  /**
   * When the Location Type is changed, overwrite the aim/injury/risk fields with
   * that type's canonical values. Editing any other field leaves them alone.
   * @override
   */
  _prepareSubmitData(event, form, formData) {
    const submitData = super._prepareSubmitData(event, form, formData);
    const newType = submitData.system?.locationType;
    if (newType && newType !== this.document.system.locationType) {
      const canon = CONFIG.SCARMARK.armorLocations[newType];
      if (canon) {
        foundry.utils.mergeObject(submitData, {
          system: {
            aim: { ...canon.aim },
            injury: { ...canon.injury },
            risk: { ...canon.risk }
          }
        });
      }
    }
    return submitData;
  }
}
