/**
 * Data model of the "npc" actor type (a stripped-down character). Owns the npc fields; the attribute and resource schema, the migration, the mods and the derived chain come from ScarmarkActorData (base-actor-schema.mjs).
 */
import { CHARACTER_ATTRIBUTE_KEYS } from "../config/index.mjs";
import { ScarmarkActorData, buildAttributeFields, buildResourceField } from "./base-actor-schema.mjs";

const fields = foundry.data.fields;

/**
 * Data model for the "npc" Actor type - a stripped-down player Character for
 * generic NPCs (Infantry, Guardsman, ...). Same attribute/resource schema as
 * "character" (all 9 attributes, incl. Presence) plus Race, but WITHOUT the
 * personal-history fields: no date of birth / Zodiac Sign, no Birthplace, no
 * Personality and no Journal. With no Sunsign, applyDerivedCombat's per-skill sunsign bonus is
 * simply 0 (system.sunsign stays undefined - handled the same way as creature).
 */
export default class ScarmarkNpcData extends ScarmarkActorData {

  static attributeKeys = CHARACTER_ATTRIBUTE_KEYS;

  static defineSchema() {
    const schema = {};

    schema.attributes = new fields.SchemaField(buildAttributeFields(this.attributeKeys));
    schema.resources = buildResourceField();

    schema.race = new fields.StringField({ required: true, initial: "", blank: true });
    // Free-text background and specializations (roleplay and GM ruling, no mechanics).
    schema.specialization = new fields.StringField({ required: true, initial: "", blank: true });

    return schema;
  }
}
