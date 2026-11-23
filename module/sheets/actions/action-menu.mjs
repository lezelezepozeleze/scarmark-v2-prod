/** The + Add menu of the Actions panel: a blank action and the entries of the action compendium (the menu itself is sheets/effect-menu.mjs openAddMenu). */
import { openAddMenu } from "../effect-menu.mjs";

/**
 * Open the menu under the Add link, or close it when it is open already. The caller opens it only when the compendium has entries (with none there is nothing to pick from and a blank action is added at once).
 *
 * @param {ApplicationV2} sheet the sheet that holds the panel
 * @param {HTMLElement} target the Add link
 * @param {(entry: string|null) => Promise<void>|void} onPick gets the uuid of the picked entry, or null for a blank action
 * @param {{uuid: string, name: string, img?: string}[]} entries the entries of the action compendium
 */
export function openActionMenu(sheet, target, onPick, entries) {
  openAddMenu(sheet, target, { blankLabel: game.i18n.localize("SCARMARK.Action.blank"), groups: [{ label: game.i18n.localize("TYPES.Item.action"), entries }], onPick, cls: "action-add-menu" });
}
