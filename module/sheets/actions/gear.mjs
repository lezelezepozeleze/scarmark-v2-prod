/** Sheet actions of the gear and container lists: add, edit, delete, carry, store, take out, unpack. Called by ApplicationV2 with the sheet as `this`. */
import { storeIntoContainer, unpackItem } from "../../helpers/inventory.mjs";
import { addItem, openItem, deleteItem, ejectItem, rowItemId } from "./item-rows.mjs";

/** Add a blank gear item. */
export const onAddGear = addItem("SCARMARK.Gear.new", { type: "gear" });
/** Add a blank rune (gear flagged as a rune, artifact on). */
export const onAddRune = addItem("SCARMARK.Gear.newRune", { type: "gear", system: { rune: true, artifact: { active: true, class: 1 } } });
/** Add a blank melee weapon. */
export const onAddWeapon = addItem("SCARMARK.Weapon.new", { type: "weapon" });
/** Add a blank missile weapon. */
export const onAddMissile = addItem("SCARMARK.Missile.new", { type: "missile" });
/** Add a blank armor piece. */
export const onAddArmor = addItem("SCARMARK.Armor.new", { type: "armor" });
/** Add a blank container. */
export const onAddContainer = addItem("SCARMARK.Container.new", { type: "container" });

/** Toggle whether the item of this row is carried. */
export function onToggleCarried(event, target) {
  const itemId = rowItemId(target);
  const item = this.document.items.get(itemId);
  item?.update({ "system.carried": !item.system.carried });
}

/** Store the item of this row into a container, chosen via a dialog (there may be several). */
export async function onStoreItem(event, target) {
  const item = this.document.items.get(rowItemId(target));
  if (item) await storeIntoContainer(this.document, item);
}

/** Unpack the row: take an item out of its container, or empty a container. */
export async function onUnpackItem(event, target) {
  const item = this.document.items.get(rowItemId(target));
  if (item) await unpackItem(this.document, item);
}

/** The data-action handlers of the gear lists, by action name. */
export const GEAR_ACTIONS = {
  addGear: onAddGear,
  addRune: onAddRune,
  addWeapon: onAddWeapon,
  addMissile: onAddMissile,
  addArmor: onAddArmor,
  addContainer: onAddContainer,
  editGear: openItem,
  deleteGear: deleteItem,
  toggleCarried: onToggleCarried,
  storeItem: onStoreItem,
  ejectItem,
  unpackItem: onUnpackItem
};
