/** Sheet of a skill: category, level, attributes and sunsign bonuses. */
import ScarmarkItemSheetBase from "./item-sheet-base.mjs";
import { bodyParts } from "./item-layout.mjs";

/** Sheet of a skill: category, level, attributes and sunsign bonuses. */
export default class ScarmarkSkillSheet extends ScarmarkItemSheetBase {

  static DEFAULT_OPTIONS = {
    classes: ["skill"],
    position: { width: 460, height: 680 },
    actions: {
      addSunsignBonus: ScarmarkSkillSheet.#onAddSunsignBonus,
      deleteSunsignBonus: ScarmarkSkillSheet.#onDeleteSunsignBonus
    }
  };

  // No tab group - single page, same pattern as Trait.
  static TABS = {};

  static PARTS = bodyParts("skill/body", ["notes-field", "portrait", "name-input", "skill-attributes", "sunsign-bonuses"]);

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.attributeOptions = CONFIG.SCARMARK.attributes;
    context.sunsignOptions = CONFIG.SCARMARK.sunsigns;
    return context;
  }

  static #onAddSunsignBonus() {
    const bonuses = this.document.system.sunsignBonuses.map(b => ({ ...b }));
    bonuses.push({ sunsign: "", bonus: 1 });
    this.document.update({ "system.sunsignBonuses": bonuses });
  }

  static #onDeleteSunsignBonus(event, target) {
    const index = Number(target.closest("[data-index]")?.dataset.index);
    if (!Number.isInteger(index)) return;   // splice(NaN) would delete the first bonus
    const bonuses = this.document.system.sunsignBonuses.map(b => ({ ...b }));
    bonuses.splice(index, 1);
    this.document.update({ "system.sunsignBonuses": bonuses });
  }
}
