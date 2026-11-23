/**
 * Data model of the "trait" item type (a physical or psyche trait). Owns the stored fields; a trait has no derived values.
 */
import { TRAIT_CATEGORIES } from "../config/index.mjs";
const fields = foundry.data.fields;

/**
 * Data model for the "trait" Item type.
 * Covers both Physical Traits and Psyche Traits, distinguished by `category`.
 */
export default class ScarmarkTraitData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {
      category: new fields.StringField({
        required: true,
        initial: "physical",
        choices: Object.keys(TRAIT_CATEGORIES)
      }),
      description: new fields.HTMLField({ required: true, initial: "", blank: true }),
      notes: new fields.StringField({ required: true, initial: "", blank: true })
    };
  }
}
