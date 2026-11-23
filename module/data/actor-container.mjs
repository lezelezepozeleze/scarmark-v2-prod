/**
 * Data model of the "container" ACTOR type (a loot chest). Owns its two stored fields and the gearSummary it shows; the weights come from rules/inventory.mjs.
 */
import { CONTAINER_CAPACITY_INITIAL } from "../config/index.mjs";
import { computeGearSummary } from "./base-actor-schema.mjs";
import { actionsField } from "./shared-fields.mjs";

const fields = foundry.data.fields;

/**
 * Data model for the "container" ACTOR type - a loot chest / stash / merchant
 * inventory. Deliberately stat-less: it only holds items and a Max Capacity the
 * GM sets by hand. Its single Contents tab reuses the Character Gear tab layout.
 * (Separate from the "container" ITEM type, which is an on-actor sub-container.)
 */
export default class ScarmarkContainerActorData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {
      // Free capacity number the GM adjusts at will (weight units).
      maxCapacity: new fields.NumberField({ required: true, initial: CONTAINER_CAPACITY_INITIAL, min: 0 }),
      description: new fields.HTMLField({ required: true, initial: "", blank: true }),
      // What a player who opens the sheet gets ("when inspected"), edited on the Actions tab (data/shared-fields.mjs actionsField).
      actions: actionsField()
    };
  }

  /** @override */
  prepareDerivedData() {
    // Same per-category weight totals the Gear tab shows; capacity = Max Capacity.
    this.gearSummary = { ...computeGearSummary(this.parent), capacity: this.maxCapacity };
  }
}
