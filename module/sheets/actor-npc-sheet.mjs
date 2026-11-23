/** The NPC sheet: the character sheet without the Journal tab and the birth block. */
import ScarmarkActorSheetBase, { RACE_SUBTITLE } from "./actor-sheet-base.mjs";
import { PLAY_TABS, tabsConfig, partsConfig } from "./sheet-layout.mjs";

/**
 * Sheet for the "npc" Actor type: a simplified Character sheet for generic NPCs.
 * Same body as Character (the 9 attributes of the base sheet, Race subtitle, all the play tabs)
 * but drops the Journal tab and the birth block (Sunsign / date of birth /
 * Birthplace) - see showBirthInfo, consumed by the shared profile.hbs.
 */
export default class ScarmarkNpcSheet extends ScarmarkActorSheetBase {

  static DEFAULT_OPTIONS = {
    classes: ["npc"]
  };

  static TABS = tabsConfig(PLAY_TABS);

  static PARTS = partsConfig(PLAY_TABS);

  /** @override */
  get subtitleField() {
    return RACE_SUBTITLE;
  }

  /** @override - NPCs have no birth block (Sunsign / DoB / Birthplace). */
  get showBirthInfo() {
    return false;
  }
}
