/**
 * The sheet of a region behavior of the system (crossed, stopped): who sets it off, how often, and what it does. It replaces Foundry's window so the actions can be edited with the Actions panel. The form saves on every change.
 */
import { TEMPLATE_DIR } from "../constants.mjs";
import { buildRegionBehaviorSheet } from "../view/region-behavior-view.mjs";
import { ActionsPanelMixin, ACTIONS_PANEL_TEMPLATES } from "./actions/action-panel.mjs";

const { HandlebarsApplicationMixin, DocumentSheetV2 } = foundry.applications.api;

export default class ScarmarkRegionBehaviorSheet extends ActionsPanelMixin(HandlebarsApplicationMixin(DocumentSheetV2)) {

  static DEFAULT_OPTIONS = {
    classes: ["scarmark", "sheet", "region-behavior-sheet"],
    position: { width: 600, height: "auto" },
    window: { resizable: true, icon: "fa-solid fa-shoe-prints" },
    form: { submitOnChange: true, closeOnSubmit: false }
  };

  static PARTS = {
    body: { template: `${TEMPLATE_DIR}region/behavior.hbs`, templates: ACTIONS_PANEL_TEMPLATES }
  };

  /** @override */
  get title() {
    return this.document.name || game.i18n.localize(`TYPES.RegionBehavior.${this.document.type}`);
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    return Object.assign(context, buildRegionBehaviorSheet(this.document, { localize: (key) => game.i18n.localize(key) }));
  }
}
