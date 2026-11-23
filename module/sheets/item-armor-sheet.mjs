/** Sheet of an armor piece: properties, coverage entries and effects. */
import ScarmarkItemSheetBase from "./item-sheet-base.mjs";
import { propertiesTabs, itemSheetParts } from "./item-layout.mjs";
import { pickerEntries, entryValue, entryFromValue, locationKey } from "../rules/index.mjs";
import { coverageLabel } from "../view/armor-coverage.mjs";

/** Sheet of an armor piece: properties, coverage entries and effects. */
export default class ScarmarkArmorSheet extends ScarmarkItemSheetBase {

  static DEFAULT_OPTIONS = {
    classes: ["armor"],
    position: { width: 520, height: 620 },
    actions: {
      addLocation: ScarmarkArmorSheet.#onAddLocation,
      removeLocation: ScarmarkArmorSheet.#onRemoveLocation
    }
  };

  // Properties + Effects (the tab id stays "details" so the .details CSS applies).
  static TABS = propertiesTabs();

  static PARTS = itemSheetParts("armor/properties", ["item-basics", "aspect-grid", "container-select", "details-tab", "quantity-weight-value"]);

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.containerOptions = this.containerOptions();
    const system = this.document.system;
    const coverage = Array.from(system.coverage ?? []);
    const i18n = { localize: (key) => game.i18n.localize(key), format: (key, data) => game.i18n.format(key, data) };
    context.coverageRows = coverage.map((entry, index) => ({
      index,
      type: entry.type,
      side: entry.side ?? "",
      label: coverageLabel(entry, i18n)
    }));
    // The picker offers the locations the piece does not cover yet and that the wearer has: the hit locations of the actor it is on, or every location when it is not on an actor.
    const wearer = this.document.parent?.documentName === "Actor" ? this.document.parent : null;
    const wearerLocations = wearer ? wearer.items.filter(i => i.type === "armorLocation") : null;
    context.availableCoverage = pickerEntries(wearerLocations)
      .filter(entry => !coverage.some(c => locationKey(c.type) === entry.type && (c.side ?? "") === entry.side))
      .map(entry => ({ value: entryValue(entry), label: coverageLabel(entry, i18n) }));
    return context;
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
    // The location picker is a transient selector, not a stored field. Keep its
    // change from bubbling to the form's submit-on-change handler so choosing a
    // location doesn't re-render and reset the dropdown before "Add" is clicked.
    const picker = this.element.querySelector("select.location-picker");
    picker?.addEventListener("change", (event) => event.stopPropagation());
  }

  /**
   * The coverage rows are form fields named system.coverage.<index>.<field>, which the form turns into an object keyed by index; send it as the array it is, so no entry is dropped.
   * @override
   */
  _prepareSubmitData(event, form, formData) {
    const submitData = super._prepareSubmitData(event, form, formData);
    const coverage = submitData.system?.coverage;
    if (coverage && !Array.isArray(coverage)) {
      submitData.system.coverage = Object.keys(coverage).sort((a, b) => a - b).map(key => coverage[key]);
    }
    return submitData;
  }

  /* -------------------------------------------- */
  /*  Location Actions                             */
  /* -------------------------------------------- */

  static #onAddLocation() {
    const entry = entryFromValue(this.element.querySelector("select.location-picker")?.value);
    if (!entry) return;
    const current = ScarmarkArmorSheet.#coverage(this.document);
    if (current.some(c => locationKey(c.type) === entry.type && c.side === entry.side)) return;
    this.document.update({ "system.coverage": [...current, entry] });
  }

  static #onRemoveLocation(event, target) {
    const index = Number(target.closest("[data-index]")?.dataset.index);
    if (!Number.isInteger(index)) return;
    this.document.update({ "system.coverage": ScarmarkArmorSheet.#coverage(this.document).filter((entry, i) => i !== index) });
  }

  /** The armor's coverage entries as plain objects, ready to be written back. */
  static #coverage(item) {
    return Array.from(item.system.coverage ?? [], entry => ({ type: entry.type, side: entry.side ?? "" }));
  }
}
