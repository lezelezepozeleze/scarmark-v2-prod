/** Sheet of a missile weapon: properties, ranges and effects. */
import ScarmarkItemSheetBase from "./item-sheet-base.mjs";
import { propertiesTabs, itemSheetParts } from "./item-layout.mjs";

/** Sheet of a missile weapon: properties, ranges and effects. */
export default class ScarmarkMissileSheet extends ScarmarkItemSheetBase {

  static DEFAULT_OPTIONS = {
    classes: ["missile"],
    position: { width: 520, height: 520 }
  };

  // Properties + Effects (the tab id stays "details" so the .details CSS applies).
  static TABS = propertiesTabs();

  static PARTS = itemSheetParts("missile/properties", ["item-basics", "skill-row", "weapon-durability", "container-select", "details-tab", "notes-field", "quantity-weight-value"]);

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.containerOptions = this.containerOptions();
    context.damageAspects = CONFIG.SCARMARK.damageAspects;
    context.missileSkills = CONFIG.SCARMARK.missileSkills;
    context.missileVelocities = CONFIG.SCARMARK.missileVelocities;
    return context;
  }
}
