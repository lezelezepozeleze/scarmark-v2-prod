/**
 * Data model of the "psionic" item type (a psionic talent). Owns the stored fields and the standalone derived values (sb, esl); the actor's applyDerivedCombat (base-actor-schema.mjs) finishes esl and sets sunsignBonus.
 */
import { ATTRIBUTES, SUNSIGNS } from "../config/index.mjs";
import { skillBase, standaloneEslOf } from "../rules/index.mjs";
import { migrateSkillAttributeKeys } from "./migrations.mjs";
import { sunsignBonusesField, skillAttributeField } from "./shared-fields.mjs";

const fields = foundry.data.fields;

/**
 * Data model for the "psionic" Item type: a psionic talent. Same shape as a
 * Skill (SB derived from 3 attributes, SL/ML set directly, ESL) plus a
 * **Fatigue** value = the Fatigue Levels the character accrues each time the
 * talent is used. ESL (with the Zodiac
 * Sign bonus and the fixed fatigue, load and wound skill penalty) is finished by the Actor's applyDerivedCombat pass,
 * like Skills.
 */
export default class ScarmarkPsionicData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {
      attribute1: skillAttributeField(ATTRIBUTES, "spi"),
      attribute2: skillAttributeField(ATTRIBUTES, "spi"),
      attribute3: skillAttributeField(ATTRIBUTES, "wil"),

      sunsignBonuses: sunsignBonusesField(SUNSIGNS),

      level: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
      // Fatigue Levels accrued per use of the talent.
      fatigue: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),

      notes: new fields.StringField({ required: true, initial: "", blank: true }),
      description: new fields.HTMLField({ required: true, initial: "", blank: true }),
      // Backlash text posted to chat on a Critical Failure (CF) when the talent is used.
      misfire: new fields.HTMLField({ required: true, initial: "", blank: true })
    };
  }

  /** @override - Skill Base attributes from before 1.0.36 (see migrations.mjs). */
  static migrateData(source) {
    migrateSkillAttributeKeys(source);
    return super.migrateData(source);
  }

  /** @override */
  prepareDerivedData() {
    this.sb = skillBase(this.parent?.actor?.system?.attributes, [this.attribute1, this.attribute2, this.attribute3]);
    // Zodiac Sign bonus, mods and the fixed skill penalty are applied by the Actor's applyDerivedCombat pass.
    this.esl = standaloneEslOf(this.level);
  }
}
