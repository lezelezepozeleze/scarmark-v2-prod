/** Sheet of a container item: capacity and the items stored in it. */
import ScarmarkItemSheetBase from "./item-sheet-base.mjs";
import { containerLoad } from "../rules/index.mjs";
import { propertiesTabs, itemSheetParts, actionsPart } from "./item-layout.mjs";
import { openItemOf, ejectItemOf } from "./actions/item-rows.mjs";
import { TEMPLATE_DIR } from "../constants.mjs";

/** The actor the stored items belong to: the one that has the container. */
const wearer = (sheet) => sheet.document.parent;

export default class ScarmarkContainerSheet extends ScarmarkItemSheetBase {

  static DEFAULT_OPTIONS = {
    classes: ["container"],
    position: { width: 500, height: 480 },
    actions: {
      openStored: openItemOf(wearer),
      ejectStored: ejectItemOf(wearer)
    }
  };

  // Properties + Stored (no Effects/Description).
  static TABS = propertiesTabs("stored");

  static PARTS = itemSheetParts("container/properties", ["item-basics", "container-select", "details-tab", "notes-field", "quantity-weight-value"], {
    stored: { template: `${TEMPLATE_DIR}item/container/stored.hbs` },
    actions: actionsPart()
  });

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = this.document.parent;
    const contents = actor
      ? actor.items.filter(i => i.system?.container === this.document.id)
      : [];
    context.storedItems = contents;
    Object.assign(context, containerLoad(contents, this.document.system.maxCapacity));
    return context;
  }
}
