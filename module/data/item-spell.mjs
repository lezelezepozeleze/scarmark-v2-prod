/**
 * Data model of the "spell" item type (a Magic esoteric). Owns the stored fields; the targets and Fatigue come from rules/esoterics.mjs.
 */
import { SPELL_LEVEL_MAX, ESOTERIC_MIN } from "../config/index.mjs";
const fields = foundry.data.fields;

/**
 * Data model for the "spell" Item type (Magic esoteric). Like Invocation, but
 * rolls against a Magic-type skill and uses Level (ESOTERIC_MIN to SPELL_LEVEL_MAX) instead of Circle:
 * each Level above 1 lowers the effective target (SPELL_LEVEL_STEP), and a
 * failed cast accrues Fatigue (see rollSpell in helpers/dice/esoterics.mjs). Magic Type is the magic skill
 * it draws on (dropdown of the actor's magic-category skills; empty until magic
 * skills are defined).
 */
export default class ScarmarkSpellData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {
      // Name of the Magic-category skill this spell draws on (the "Convocation").
      magicType: new fields.StringField({ required: true, initial: "", blank: true }),
      level: new fields.NumberField({ required: true, integer: true, initial: ESOTERIC_MIN, min: ESOTERIC_MIN, max: SPELL_LEVEL_MAX }),
      notes: new fields.StringField({ required: true, initial: "", blank: true }),
      description: new fields.HTMLField({ required: true, initial: "", blank: true })
    };
  }
}
