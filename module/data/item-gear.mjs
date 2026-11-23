/**
 * Data model of the "gear" item type (generic equipment, consumables, runes). Owns the stored fields and the derived totalWeight / totalValue.
 */
import { itemTotals } from "../rules/index.mjs";
import { quantityField, weightField, valueField, carriedField, containerField, artifactField, actionsField } from "./shared-fields.mjs";

const fields = foundry.data.fields;

/**
 * Data model for the "gear" Item type. Deliberately minimal - generic
 * equipment/possessions for the Gear tab. Weapons, missiles and armor have
 * their own, more complex item types.
 */
export default class ScarmarkGearData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {
      weight: weightField(),
      value: valueField(),
      quantity: quantityField(),
      description: new fields.HTMLField({ required: true, initial: "", blank: true }),
      notes: new fields.StringField({ required: true, initial: "", blank: true }),
      carried: carriedField(),
      // Id of the Container item this is stored in ("" = On Person / top level).
      container: containerField(),
      // A consumable (potion, scroll, ...): shows a Consume button on the actor's
      // Gear/Containers tabs that copies this item's Active Effects onto the actor
      // and spends one unit. Its effect(s) should have "Apply to Actor" OFF so they
      // only take hold on consumption (see _consumeItem on the actor sheet).
      consumable: new fields.BooleanField({ required: true, initial: false }),
      // A usable item (razor, ...): shows a Use button on the actor's Gear tab; using it sets off its actions that say "when used" (helpers/item-actions.mjs).
      usable: new fields.BooleanField({ required: true, initial: false }),
      // A usable item that is used up: using it spends one unit of the stack, as consuming does (the last unit removes the item), but only when the use did something (rules/actions.mjs spendsOnUse). A whetstone is not used up, honing oil is.
      usedUp: new fields.BooleanField({ required: true, initial: false }),
      // Toxicity of a consumable: consuming it lowers the Vitality skill by this many points
      // for as long as its effect lasts (alcohol, potions, ...; TOXICITY_SKILL in config/items.mjs). 0 = no Vitality cost.
      toxicity: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      // When true, the item is a magic Rune: it lists under a dedicated "Runes"
      // section on the Character sheet (between Missiles and Armor) instead of
      // general Gear. Uses the owner's Spirit Capacity instead of item charges.
      rune: new fields.BooleanField({ required: true, initial: false }),
      artifact: artifactField(),

      // The actions of the item, edited on its Actions tab (data/shared-fields.mjs actionsField).
      actions: actionsField()
    };
  }

  /** @override */
  prepareDerivedData() {
    // weight/value are per-unit; these are what the Actor's Load and Gear
    // totals sum across its items (rules/inventory.mjs gearSummary).
    Object.assign(this, itemTotals(this.weight, this.value, this.quantity));
  }
}
