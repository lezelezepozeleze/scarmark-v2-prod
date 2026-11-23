/** Sheet of a psionic talent: the skill sheet with a Fatigue field and no category. */
import ScarmarkSkillSheet from "./item-skill-sheet.mjs";
import { bodyParts } from "./item-layout.mjs";

/**
 * Psionic sheet: the Skill sheet with a Fatigue field and no Category (psionic
 * talents aren't categorized). Inherits SB/SL/ESL, attributes, sunsign-bonus
 * editing (addSunsignBonus/deleteSunsignBonus) and context from ScarmarkSkillSheet.
 */
export default class ScarmarkPsionicSheet extends ScarmarkSkillSheet {

  static DEFAULT_OPTIONS = {
    classes: ["psionic"],
    position: { width: 460, height: 760 }
  };

  static PARTS = bodyParts("psionic/body", ["esoteric-header", "notes-field", "portrait", "name-input", "skill-attributes", "sunsign-bonuses"]);
}
