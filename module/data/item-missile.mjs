/**
 * Data model of the "missile" item type (ammunition, thrown weapons). Owns the stored fields and the derived totalWeight / totalValue.
 */
import { itemTotals } from "../rules/index.mjs";
import { quantityField, weightField, valueField, carriedField, containerField, actionsField } from "./shared-fields.mjs";
import { QUALITY_INITIAL, QUALITY_MAX, SPELL_CLASS_MAX, ESOTERIC_MIN, DAMAGE_ASPECTS, COMBAT_SKILLS, MISSILE_VELOCITIES, RANGE_PENALTY } from "../config/index.mjs";

const fields = foundry.data.fields;

/** A SchemaField with one field per range band (short, medium, long, extreme; RANGE_PENALTY order). */
const perRangeBand = (makeField) => new fields.SchemaField(Object.fromEntries(Object.keys(RANGE_PENALTY).map(band => [band, makeField()])));

/**
 * Data model for the "missile" Item type: projectiles/ammunition (arrows,
 * bolts, sling stones, thrown projectiles). Unlike a melee weapon it carries
 * a SINGLE damage aspect, and its Impact drops across four range bands.
 *
 * Range thresholds are stored in scene distance units - metres since the
 * metric switch (1.0.34, convert-to-metric.js; one grid square = 1 m, formerly
 * 5 ft) - so the Combat tab compares a measured token distance directly (rules/combat.mjs rangeBand),
 * without any grid-size conversion. Whole metres (grid squares), rounded up
 * on conversion (Trident 8 / 14 / 22 / 35 ft -> 2 / 3 / 5 / 7 m).
 */
export default class ScarmarkMissileData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {
      quantity: quantityField(),
      weight: weightField(),
      value: valueField(),
      carried: carriedField(),
      // Id of the Container item this is stored in ("" = On Person / top level).
      container: containerField(),

      quality: new fields.NumberField({ required: true, integer: true, initial: QUALITY_INITIAL, min: 0, max: QUALITY_MAX }),

      // Low vs High velocity. HVM (arrows/bolts/bullets/sling stones)
      // halve the defender's Dodge and allow Block only with a shield - that
      // consequence lives in rules/combat.mjs (dodgeVsMissile, rangedBlockShields);
      // this just carries the class.
      velocity: new fields.StringField({
        required: true, initial: "high", choices: Object.keys(MISSILE_VELOCITIES)
      }),

      // Single damage aspect (B/E/P/F) for the whole missile.
      aspect: new fields.StringField({
        required: true, initial: "piercing", choices: Object.keys(DAMAGE_ASPECTS)
      }),

      associatedSkill: new fields.StringField({
        required: true, initial: "ranged", choices: Object.keys(COMBAT_SKILLS)
      }),

      // Character's specialization with this missile weapon; added to the ASL of
      // the associated combat skill (same meaning as on the weapon item).
      specialization: new fields.NumberField({ required: true, integer: true, initial: 0 }),

      // Range band thresholds, in scene distance units (whole metres).
      range: perRangeBand(() => new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 })),

      // Impact per range band (drops with distance).
      impact: perRangeBand(() => new fields.NumberField({ required: true, integer: true, initial: 0 })),

      // Magic Missile: instead of ammo, each shot spends the spell's Class from the
      // shooter's Spirit Capacity (shots available = Spirit Capacity / Class).
      magic: new fields.BooleanField({ required: true, initial: false }),
      spellClass: new fields.NumberField({ required: true, integer: true, initial: ESOTERIC_MIN, min: ESOTERIC_MIN, max: SPELL_CLASS_MAX }),

      notes: new fields.StringField({ required: true, initial: "", blank: true }),

      // The actions of the item, edited on its Actions tab (data/shared-fields.mjs actionsField).
      actions: actionsField()
    };
  }

  /** @override */
  prepareDerivedData() {
    // weight/value are per-unit; these feed the Actor's Load and Gear totals (rules/inventory.mjs gearSummary).
    Object.assign(this, itemTotals(this.weight, this.value, this.quantity));
  }
}
