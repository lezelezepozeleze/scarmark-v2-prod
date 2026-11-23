/**
 * Data model of the "action" item type: an entry of the action compendium. It only holds actions (the same list as every other document with actions, data/shared-fields.mjs actionsField); the + Add menu of the Actions panel copies them into an item. It is never carried by a character (foundry/action-hooks.mjs refuses it).
 */
import { actionsField } from "./shared-fields.mjs";

export default class ScarmarkActionData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return { actions: actionsField() };
  }
}
