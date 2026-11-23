/** Sheet of a melee weapon: properties, damage aspects and effects. */
import ScarmarkItemSheetBase from "./item-sheet-base.mjs";
import { propertiesTabs, itemSheetParts } from "./item-layout.mjs";

/** Sheet of a melee weapon: properties, damage aspects and effects. */
export default class ScarmarkWeaponSheet extends ScarmarkItemSheetBase {

  static DEFAULT_OPTIONS = {
    classes: ["weapon"],
    position: { width: 500, height: 560 }
  };

  // Properties + Effects (the tab id stays "details" so the .details CSS applies).
  static TABS = propertiesTabs();

  static PARTS = itemSheetParts("weapon/properties", ["item-basics", "aspect-grid", "skill-row", "weapon-durability", "container-select", "details-tab", "notes-field", "quantity-weight-value", "artifact-fields"]);

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.containerOptions = this.containerOptions();
    context.weaponSkills = CONFIG.SCARMARK.combatSkills;
    return context;
  }
}
