/** The creature sheet (Species subtitle, Special Abilities, no religion skills) on top of the shared actor sheet. */
import { SCARMARK } from "../config.mjs";
import ScarmarkActorSheetBase from "./actor-sheet-base.mjs";
import { PLAY_TABS, tabsConfig, partsConfig } from "./sheet-layout.mjs";

/** The creature sheet: the base actor sheet without the Religion skills. */
export default class ScarmarkCreatureSheet extends ScarmarkActorSheetBase {

  static DEFAULT_OPTIONS = {
    classes: ["creature"]
  };

  static TABS = tabsConfig(PLAY_TABS);

  static PARTS = partsConfig(PLAY_TABS);

  /** @override */
  get attributeKeys() {
    return SCARMARK.creatureAttributeKeys;
  }

  /** @override */
  get subtitleField() {
    return { path: "species", label: "SCARMARK.Species" };
  }

  /** @override - creatures have no birth block (Sunsign / date of birth / Birthplace). */
  get showBirthInfo() {
    return false;
  }

  /** @override - creatures list their Special Abilities on the Profile tab. */
  get showSpecialAbilities() {
    return true;
  }

  /** @override - a creature has no Religion skills. */
  showSkill(skill) {
    return skill.system.esotericKind !== "religion";
  }
}
