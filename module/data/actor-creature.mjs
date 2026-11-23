/**
 * Data model of the "creature" actor type (monsters; the animal type extends it). Owns the creature-only fields; the attribute and resource schema, the migration, the mods and the derived chain come from ScarmarkActorData (base-actor-schema.mjs).
 */
import { CREATURE_ATTRIBUTE_KEYS } from "../config/index.mjs";
import { ScarmarkActorData, buildAttributeFields, buildResourceField } from "./base-actor-schema.mjs";

const fields = foundry.data.fields;

/**
 * Data model for the "creature" Actor type (NPCs/monsters).
 * Shares its attribute/resource schema with "character" but:
 * - has no Presence (8 attributes)
 * - has no Sunsign / date of birth / Race / Journal
 * - has "Species" (instead of Race) and a free-form "Special Abilities" field
 * With no Sunsign, applyDerivedCombat's per-skill sunsign bonus is simply 0.
 */
export default class ScarmarkCreatureData extends ScarmarkActorData {

  static attributeKeys = CREATURE_ATTRIBUTE_KEYS;

  static defineSchema() {
    const schema = {};

    schema.attributes = new fields.SchemaField(buildAttributeFields(this.attributeKeys));
    schema.resources = buildResourceField();

    schema.species = new fields.StringField({ required: true, initial: "", blank: true });
    schema.specialAbilities = new fields.HTMLField({ required: true, initial: "", blank: true });

    return schema;
  }
}
