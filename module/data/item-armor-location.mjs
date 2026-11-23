/**
 * Data model of the "armorLocation" item type (one hit location of an actor). Owns the stored fields and the migration of the old letter codes; the canonical values come from config/locations.mjs.
 */
import { MAX_WOUND_LEVEL, ARMOR_LOCATIONS, INJURY_THRESHOLDS, LOCATION_SIDES } from "../config/index.mjs";
const fields = foundry.data.fields;

/** The injury threshold keys in ascending order (t1, t5, t9, t13, t17); INJURY_THRESHOLDS lists them highest first. */
const THRESHOLD_KEYS = INJURY_THRESHOLDS.map(t => t.key).reverse();

/** A Wound Level a location gives at one impact threshold: 0 = no wound, 1-5. */
const woundLevel = (initial) => new fields.NumberField({ required: true, integer: true, initial, min: 0, max: MAX_WOUND_LEVEL });

/**
 * Data model for the "armorLocation" Item type: a single hit location (a body
 * part) on a Character or Creature. It defines how likely the location is to be
 * struck (aim-weighted probability) and how bad a hit is (Wound Level at each
 * impact threshold + risk flags). It carries NO armor protection - that comes
 * from Armor items covering the location.
 *
 * Fields are pre-filled from CONFIG.SCARMARK.armorLocations when the Location
 * Type is chosen (see the sheet), then remain editable. Schema initials below
 * mirror the canonical "head" so a freshly-created location is already valid.
 *
 * Since 1.0.39 the humanoid body has ten location types and a wound threshold is a
 * plain Wound Level (the old letter codes M1 ... K5 are gone). migrateData turns the
 * old codes into numbers; the old TYPE keys stay until the migration macro runs (see
 * LEGACY_LOCATION_MAP).
 */
export default class ScarmarkArmorLocationData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {
      locationType: new fields.StringField({ required: true, initial: "head" }),

      // Which side of the body this location is on ("left", "right", or "" for a location with no side). Armor that covers only one side matches on it; a location without the field falls back to the word Left or Right in its name (rules/locations.mjs locationSide).
      side: new fields.StringField({ required: true, initial: "", blank: true, choices: ["", ...LOCATION_SIDES] }),

      // Hit Probability Weights per aim zone (relative weights, not percentages).
      aim: new fields.SchemaField({
        high: new fields.NumberField({ required: true, integer: true, initial: ARMOR_LOCATIONS.head.aim.high, min: 0 }),
        medium: new fields.NumberField({ required: true, integer: true, initial: ARMOR_LOCATIONS.head.aim.medium, min: 0 }),
        low: new fields.NumberField({ required: true, integer: true, initial: ARMOR_LOCATIONS.head.aim.low, min: 0 })
      }),

      // Wound Level at each effective-impact threshold (INJURY_THRESHOLDS).
      injury: new fields.SchemaField(Object.fromEntries(THRESHOLD_KEYS.map(key => [key, woundLevel(ARMOR_LOCATIONS.head.injury[key])]))),

      risk: new fields.SchemaField({
        fumble: new fields.BooleanField({ required: true, initial: false }),
        stumble: new fields.BooleanField({ required: true, initial: false }),
        amputate: new fields.BooleanField({ required: true, initial: false })
      }),

      notes: new fields.StringField({ required: true, initial: "", blank: true })
    };
  }

  /** @override */
  static migrateData(source) {
    // 1.0.39: a threshold is a Wound Level, not a letter code ("K4" -> 4, "" -> 0).
    if ( source.injury && (typeof source.injury === "object") ) {
      for ( const { key } of INJURY_THRESHOLDS ) {
        const value = source.injury[key];
        if ( typeof value === "string" ) source.injury[key] = Number(value.replace(/\D/g, "")) || 0;
      }
    }
    return super.migrateData(source);
  }
}
