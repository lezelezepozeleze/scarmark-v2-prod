/** Actions shared by every list of owned items on an actor sheet (gear, traits, skills): create one, open one, delete one. Called by ApplicationV2 with the sheet as `this`. */

/** The id of the item row a clicked element sits in. */
export const rowItemId = (target) => target.closest("[data-item-id]")?.dataset.itemId;

/** An action that creates one owned item: `nameKey` is the lang key of its default name, `data` adds the type and any system values. */
export const addItem = (nameKey, data) => function createItem() {
  this.document.createEmbeddedDocuments("Item", [{ name: game.i18n.localize(nameKey), ...data }]);
};

/** The actor the rows of an actor sheet belong to. */
const actorOwner = (sheet) => sheet.document;

/** An action that opens the sheet of the item row that was clicked; `owner(sheet)` gives the actor that has the item. */
export const openItemOf = (owner) => function openRow(event, target) {
  owner(this)?.items.get(rowItemId(target))?.sheet.render(true);
};

/** An action that takes the clicked row's item out of its container; `owner(sheet)` gives the actor that has the item. */
export const ejectItemOf = (owner) => function ejectRow(event, target) {
  owner(this)?.items.get(rowItemId(target))?.update({ "system.container": "" });
};

/** Open the sheet of the item row that was clicked. */
export const openItem = openItemOf(actorOwner);

/** Take the item row that was clicked out of its container. */
export const ejectItem = ejectItemOf(actorOwner);

/** Delete the item row that was clicked. */
export function deleteItem(event, target) {
  const itemId = rowItemId(target);
  if (itemId) this.document.deleteEmbeddedDocuments("Item", [itemId]);
}
