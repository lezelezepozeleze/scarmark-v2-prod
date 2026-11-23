/** Sheet of an action compendium entry: its icon and name, and the lines of its action. */
import ScarmarkItemSheetBase from "./item-sheet-base.mjs";
import { headerPart, actionEntryPart } from "./item-layout.mjs";
import { blankAction } from "./actions/action-panel.mjs";

/**
 * Action sheet: an entry of the action compendium is one action and its name is the name of the item. The sheet shows the icon and the name, then "when" and the roll-downs of the action; there is no tab, Add link, name field, switch or bin. An entry with no action yet (a new one) gets a blank one when the sheet opens, so there is always something to fill in. The + Add menu of any other Actions panel offers the entry and copies its action under the entry's name (rules/actions.mjs actionsFromEntry). An entry has no Effects tab: name the library effects, tests and macros in its action (an effect that lives on one item cannot travel with the entry).
 */
export default class ScarmarkActionSheet extends ScarmarkItemSheetBase {

  static DEFAULT_OPTIONS = {
    classes: ["action"],
    position: { width: 480, height: 360 }
  };

  static TABS = {};

  static PARTS = { header: headerPart(), actions: actionEntryPart() };

  /** @override Give a new entry its action: the sheet has no Add link to do it. */
  _onFirstRender(context, options) {
    super._onFirstRender(context, options);
    if (this.isEditable && !this.document._source.system.actions?.length) {
      this.document.update({ "system.actions": [blankAction(this.document, foundry.utils.randomID())] });
    }
  }
}
