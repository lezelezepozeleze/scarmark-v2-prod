/**
 * Data model of the "weapon" item type (melee and close-combat weapons). Owns the stored fields and the derived totalWeight / totalValue.
 */
import { itemTotals, itemModsOf, weaponEffective } from "../rules/index.mjs";
import { quantityField, weightField, valueField, carriedField, containerField, artifactField, aspectFields, actionsField } from "./shared-fields.mjs";
import { QUALITY_INITIAL, QUALITY_MAX, COMBAT_SKILLS } from "../config/index.mjs";

const fields = foundry.data.fields;

/**
 * Data model for the "weapon" Item type: melee/close-combat weapons.
 * Beyond generic Gear it carries the combat stats used by the
 * Combat tab - Attack/Defense modifiers, per-aspect impact, and the
 * character's weapon specialization that feeds the associated skill.
 *
 * Damage aspects are kept to Blunt/Edged/Piercing/Fire (B/E/P/F, DAMAGE_ASPECTS). Squeeze and
 * Tear are NOT separate aspects here - they resolve as Blunt
 * resp. Edge on the creature-attack side, to keep armor/injury lean.
 */
export default class ScarmarkWeaponData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {
      quantity: quantityField(),
      weight: weightField(),
      value: valueField(),
      carried: carriedField(),
      // Id of the Container item this is stored in ("" = On Person / top level).
      container: containerField(),

      // Weapon Durability (DUR; formerly WQ, the field stays `quality`), 0 to
      // QUALITY_MAX. Armor has its own `quality` = armor DUR with different rules; the
      // two never meet because they live on different item types.
      // DUR 0 = "not a breakable weapon" sentinel: natural weapons / body parts
      // (fists, paws, claws). The DUR check on block skips them and instead does a
      // self-strike on the limb (see helpers/combat/clash.mjs).
      quality: new fields.NumberField({ required: true, integer: true, initial: QUALITY_INITIAL, min: 0, max: QUALITY_MAX }),

      // Marks a shield - including improvised ones (a tabletop, a barrel lid).
      // Only shields keep partial damage in the WQ-check-on-block: a shield that
      // rolls above its WQ wears down (WQ -1), a normal weapon that survives does
      // not. A simple flag so anything can be made a shield on the fly.
      isShield: new fields.BooleanField({ required: true, initial: false }),

      // A weapon destroyed by a WQ-check-on-block. Repairable by an armorer
      // (clear the flag). Broken weapons are filtered out of combat option lists.
      broken: new fields.BooleanField({ required: true, initial: false }),

      // Attack/Defense = weapon's contribution to AML/DML (class, reach, etc.).
      attack: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      defense: new fields.NumberField({ required: true, integer: true, initial: 0 }),

      // Character's specialization with this weapon; added as a modifier to the
      // associated combat skill (the per-weapon skills are collapsed into one).
      specialization: new fields.NumberField({ required: true, integer: true, initial: 0 }),

      // Per-aspect impact. -1 means the weapon lacks that aspect entirely
      // (it won't be offered when attacking, and shows as "—" on the sheet).
      impact: aspectFields(() => new fields.NumberField({ required: true, integer: true, initial: 0, min: -1 })),

      // Which combat skill this weapon rolls against. The schema accepts all four COMBAT_SKILLS (the sheet dropdown lists the same four); WEAPON_SKILLS (close, unarmed) is not used here.
      associatedSkill: new fields.StringField({
        required: true, initial: "close", choices: Object.keys(COMBAT_SKILLS)
      }),

      notes: new fields.StringField({ required: true, initial: "", blank: true }),

      rune: new fields.BooleanField({ required: true, initial: false }),
      artifact: artifactField(),

      // The actions of the item, edited on its Actions tab (data/shared-fields.mjs actionsField).
      actions: actionsField()
    };
  }

  /** @override */
  prepareDerivedData() {
    // weight/value are per-unit; these feed the Actor's Load and Gear totals (rules/inventory.mjs gearSummary).
    Object.assign(this, itemTotals(this.weight, this.value, this.quantity));
    // Attack, defense and impact as combat sees them: the stored values plus the modifiers of the effects on this item (rules/item-mods.mjs). The stored fields stay as they are, so the sheet inputs never write a modifier back.
    this.effective = weaponEffective(this, itemModsOf(this.parent?.effects));
  }
}
