/** Hooks on the items, actors and region behaviors that have actions: a library effect that an action picks is copied onto the document, an "owned" action makes its effect transfer to the owner, and the names of the compendium entries the actions name are remembered (helpers/item-actions.mjs). */
import { materializeActionEffects, syncOwnedEffects, rememberEntryNames } from "../helpers/item-actions.mjs";
import { ACTION_ENTRY_TYPE } from "../config/index.mjs";
import { warn } from "../helpers/notify.mjs";

/** The actions of a document changed: bring the remembered entry names in step and, for an item, its copies of library effects and its owned effects (a chest or a region behavior uses the library effects as they are). */
async function syncActions(document) {
  if (document.documentName === "Item" && document.type !== ACTION_ENTRY_TYPE) {
    await materializeActionEffects(document);
    await syncOwnedEffects(document);
  }
  await rememberEntryNames(document);
}

/** An entry of the action compendium lives in a compendium or the Items directory; it is not put on a character (it would only sit there, doing nothing). */
function refuseCarriedEntry(item) {
  if (item.type !== ACTION_ENTRY_TYPE || !item.parent) return;
  warn("SCARMARK.Action.noEntryItems");
  return false;
}

/** Register the hooks (called when the module loads). */
export function registerActionHooks() {
  Hooks.on("preCreateItem", refuseCarriedEntry);
  for (const hook of ["updateItem", "updateActor", "updateRegionBehavior"]) {
    // Only the client that made the change syncs the effects (it is the one with permission and the others would repeat it).
    Hooks.on(hook, (document, changes, options, userId) => {
      if (userId !== game.user.id || !foundry.utils.hasProperty(changes, "system.actions")) return;
      syncActions(document).catch(err => console.error("Scarmark | syncing the actions of a document failed", err));
    });
  }
}
