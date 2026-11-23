/**
 * Data model of the "armor" item type (a worn piece). Owns the stored fields, the migration of the old location sets to coverage entries and the derived totalWeight / totalValue.
 */
import { itemTotals, legacyCoverage, splitBothSides, itemModsOf, armorEffective } from "../rules/index.mjs";
import { quantityField, weightField, valueField, carriedField, containerField, aspectFields, actionsField } from "./shared-fields.mjs";
import { ARMOR_LAYER_MAX, LOCATION_SIDES, QUALITY_INITIAL } from "../config/index.mjs";

const fields = foundry.data.fields;

/**
 * Data model for the "armor" Item type: a worn armor piece. It carries the
 * per-aspect protection (B/E/P/F) and the set of hit locations it covers
 * (referenced by Armor Location type and side). On a strike, the Combat tab
 * (helpers/combat/armor.mjs) finds the armor pieces covering the struck location
 * and sums their protection for the relevant aspect (rules/combat.mjs protectionSum).
 *
 * No Material field: protection is entered directly as B/E/P/F, so material is
 * redundant here, and Squeeze/Tear resolve as Blunt/Edge without needing it.
 * No Size / Source / Artifact per the Scarmark armor design.
 */
export default class ScarmarkArmorData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {
      quantity: quantityField(),
      weight: weightField(),
      value: valueField(),
      carried: carriedField(),
      // Id of the Container item this is stored in ("" = On Person / top level).
      container: containerField(),

      // Armor Durability (DUR; formerly AQ, the field stays `quality`): one number for the whole
      // piece. A hit that wears the piece lowers it by 1 (the highest-layer covering piece
      // wears); at 0 the piece no longer protects. -1 (QUALITY_PERMANENT) means "permanent /
      // never decays" (Natural Armor). Not the weapon DUR: that one lives on the weapon item.
      quality: new fields.NumberField({ required: true, integer: true, initial: QUALITY_INITIAL }),

      // The durability the piece started with, shown next to the current one (5/10). Edited
      // by hand (the compendium items carry it). 0 = not set.
      originalQuality: new fields.NumberField({ required: true, integer: true, initial: 0 }),

      // Layering order: 0 Natural | 1 Cloth | 2 Padded/Quilted | 3 Fur/Leather/
      // Cuir | 4 Mail | 5 Rigid (Lamellar/Brigandine/Plate). On a hit, only the
      // highest-layer piece still holding at the struck location wears (its condition there).
      layer: new fields.NumberField({ required: true, integer: true, initial: 1, min: 0, max: ARMOR_LAYER_MAX }),

      // Per-aspect protection.
      protection: aspectFields(() => new fields.NumberField({ required: true, integer: true, initial: 0 })),

      // Hit locations this piece covers: one entry per covered location type.
      // side "" covers both sides of a type that has sides (and a location with no
      // known side); "left" or "right" covers only that side. The wear is not per
      // location: the whole piece shares `quality`.
      coverage: new fields.ArrayField(new fields.SchemaField({
        type: new fields.StringField({ required: true, blank: false }),
        side: new fields.StringField({ required: true, initial: "", blank: true, choices: ["", ...LOCATION_SIDES] })
      }), { initial: [] }),

      notes: new fields.StringField({ required: true, initial: "", blank: true }),

      // The actions of the item, edited on its Actions tab (data/shared-fields.mjs actionsField).
      actions: actionsField()
    };
  }

  /**
   * Armor made before the coverage entries stored its locations as a set of keys
   * (system.locations, "arm" for both sides, "leftArm" for one) and a map of
   * conditions (system.locationConditions). Turn them into coverage entries when
   * the data loads. Armor that covers both sides of a type that has sides (an entry
   * with side "") gets a left and a right entry instead. scripts/imports/
   * migrate-armor-coverage.js writes the result back for the world and the compendiums.
   * The per-location `condition` of 1.0.58 is dropped: the piece wears as a whole through `quality`.
   * @override
   */
  static migrateData(source) {
    if (!Array.isArray(source.coverage) && (source.locations || source.locationConditions)) {
      source.coverage = legacyCoverage(source.locations);
    }
    if (Array.isArray(source.coverage)) source.coverage = splitBothSides(source.coverage);
    delete source.locations;
    delete source.locationConditions;
    return super.migrateData(source);
  }

  /** @override */
  prepareDerivedData() {
    // weight/value are per-unit; these feed the Actor's Load and Gear totals (rules/inventory.mjs gearSummary).
    Object.assign(this, itemTotals(this.weight, this.value, this.quantity));
    // The protection and durability as combat sees them: the stored values plus the modifiers of the effects on this item (rules/item-mods.mjs). The stored fields stay as they are, so the sheet inputs never write a modifier back.
    this.effective = armorEffective(this, itemModsOf(this.parent?.effects));
  }
}
