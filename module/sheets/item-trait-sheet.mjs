/** Sheet of a trait: its text, note and effects on one page. */
import ScarmarkItemSheetBase from "./item-sheet-base.mjs";
import { bodyParts } from "./item-layout.mjs";

/** Sheet of a trait: its text and Active Effects. */
export default class ScarmarkTraitSheet extends ScarmarkItemSheetBase {

  static DEFAULT_OPTIONS = {
    classes: ["trait"],
    position: { width: 460, height: 640 }
  };

  // No tab group - everything lives on a single page for this simple item type.
  static TABS = {};

  static PARTS = bodyParts("trait/body", ["notes-field", "portrait", "name-input", "effects-table"]);
}
