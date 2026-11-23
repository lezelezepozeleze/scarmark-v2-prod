/**
 * Data model of the "character" actor type (a player character). Owns the character-only fields; the attribute and resource schema, the migration, the mods and the derived chain come from ScarmarkActorData (base-actor-schema.mjs).
 */
import { CHARACTER_ATTRIBUTE_KEYS, MONTHS, PERSONALITIES } from "../config/index.mjs";
import { ScarmarkActorData, buildAttributeFields, buildResourceField } from "./base-actor-schema.mjs";

const fields = foundry.data.fields;

/**
 * Data model for the "character" Actor type.
 * Shares its attribute/resource schema with "creature" (see base-actor-schema.mjs)
 * but adds the fields unique to player characters: Presence, date of birth +
 * Zodiac Sign (internal key `sunsign`), Birthplace, Personality, Race and the
 * Journal notes field.
 */
export default class ScarmarkCharacterData extends ScarmarkActorData {

  static attributeKeys = CHARACTER_ATTRIBUTE_KEYS;

  static defineSchema() {
    const schema = {};

    schema.attributes = new fields.SchemaField(buildAttributeFields(this.attributeKeys));
    schema.resources = buildResourceField();

    schema.race = new fields.StringField({ required: true, initial: "", blank: true });
    schema.dob = new fields.SchemaField({
      month: new fields.StringField({ required: true, initial: "", blank: true, choices: Object.keys(MONTHS) }),
      day: new fields.StringField({ required: true, initial: "", blank: true }),
      year: new fields.StringField({ required: true, initial: "", blank: true })
    });
    schema.birthplace = new fields.StringField({ required: true, initial: "", blank: true });
    schema.personality = new fields.StringField({ required: true, initial: "", blank: true, choices: ["", ...Object.keys(PERSONALITIES)] });
    schema.specialization = new fields.StringField({ required: true, initial: "", blank: true });
    schema.journal = new fields.HTMLField({ required: true, initial: "", blank: true });

    return schema;
  }

  /** @override */
  prepareDerivedData() {
    // Sunsign first: applyDerivedCombat's skill-ESL pass reads it for the
    // per-skill sunsign bonus.
    this.sunsign = MONTHS[this.dob.month]?.sunsign ?? "";
    super.prepareDerivedData();
  }
}
