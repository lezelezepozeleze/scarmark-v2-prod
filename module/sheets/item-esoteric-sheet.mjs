/** The base of the Spell and Invocation sheets: one Properties panel with a skill chosen from the owning actor's Esoterics skills of one kind. */
import ScarmarkItemSheetBase from "./item-sheet-base.mjs";

export default class ScarmarkEsotericSheet extends ScarmarkItemSheetBase {

  static DEFAULT_OPTIONS = {
    position: { width: 500, height: 520 }
  };

  // No tab group - everything lives on a single page.
  static TABS = {};

  /**
   * The Esoterics skill kind the item's skill is chosen from ("arcane" for a spell, "religion" for an invocation).
   * @returns {string}
   */
  get skillKind() {
    throw new Error("An esoteric sheet must name its skill kind.");
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = this.document.parent;
    context.skillNames = actor
      ? actor.items.filter(i => i.type === "skill" && i.system.category === "esoterics" && i.system.esotericKind === this.skillKind).map(s => s.name)
      : [];
    return context;
  }
}
