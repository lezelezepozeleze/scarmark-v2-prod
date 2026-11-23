/** The character sheet (Journal tab, birth block, Race subtitle) on top of the shared actor sheet. */
import { SCARMARK } from "../config.mjs";
import ScarmarkActorSheetBase, { RACE_SUBTITLE } from "./actor-sheet-base.mjs";
import { PLAY_TABS, tabsConfig, partsConfig } from "./sheet-layout.mjs";

/** The character sheet: the base actor sheet with all six skill categories and the personal details. */
export default class ScarmarkCharacterSheet extends ScarmarkActorSheetBase {

  static DEFAULT_OPTIONS = {
    classes: ["character"]
  };

  static TABS = tabsConfig(["journal", ...PLAY_TABS]);

  static PARTS = partsConfig(["journal", ...PLAY_TABS]);

  /** @override */
  get subtitleField() {
    return RACE_SUBTITLE;
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const system = this.document.system;

    context.months = SCARMARK.months;
    context.sunsignLabel = SCARMARK.sunsigns[system.sunsign];
    context.personalities = SCARMARK.personalities;

    return context;
  }
}
