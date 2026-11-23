/**
 * Data model of the "container" ITEM type (a backpack, chest). Owns its stored fields and its own totalWeight / totalValue; the weight of the contents is summed where the contents are visible (rules/inventory.mjs).
 */
import { itemTotals } from "../rules/index.mjs";
import { CONTAINER_CAPACITY_INITIAL } from "../config/index.mjs";
import { quantityField, weightField, valueField, carriedField, actionsField } from "./shared-fields.mjs";

const fields = foundry.data.fields;

/**
 * Data model for the "container" Item type: a backpack, chest, etc. that stores
 * other items (weapon/missile/armor/gear). Containers use a FLAT model: stored
 * items stay in the actor's inventory and reference this container by id via
 * their own `system.container` field. This item just defines the container's
 * own weight/value and its Max Capacity (max stored weight).
 *
 * The container's loaded weight and capacity usage are computed where the
 * contents are visible (actor sheet / this item's Stored tab), since summing
 * siblings needs the parent actor.
 */
export default class ScarmarkContainerData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {
      quantity: quantityField(),
      weight: weightField(),
      value: valueField(),
      // Max stored weight this container can hold.
      maxCapacity: new fields.NumberField({ required: true, initial: CONTAINER_CAPACITY_INITIAL, min: 0 }),
      carried: carriedField(),
      notes: new fields.StringField({ required: true, initial: "", blank: true }),

      // The actions of the item, edited on its Actions tab (data/shared-fields.mjs actionsField).
      actions: actionsField()
    };
  }

  /** @override */
  prepareDerivedData() {
    // Own weight only; contents are summed on the actor side (flat model).
    Object.assign(this, itemTotals(this.weight, this.value, this.quantity));
  }
}
