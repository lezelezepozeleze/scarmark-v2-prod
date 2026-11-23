/**
 * Tabs and parts of the item sheets, built from the template names so the sheet classes do not repeat the same lists.
 * Most item sheets are a header, the tab navigation, one properties panel, an Effects tab and an Actions tab.
 */
import { TEMPLATE_DIR } from "../constants.mjs";
import { ACTIONS_PANEL_TEMPLATES, ACTION_FIELDS_TEMPLATES } from "./actions/action-templates.mjs";

const ITEM_DIR = `${TEMPLATE_DIR}item/`;

const ITEM_PARTIALS_DIR = `${ITEM_DIR}partials/`;

/** The paths of item partials (templates/item/partials/<name>.hbs) for the `templates` key of an item sheet part, so Foundry loads them before the part renders. */
function itemPartials(...names) {
  return names.map(name => `${ITEM_PARTIALS_DIR}${name}.hbs`);
}

/** The portrait and name header part (a new object each call: Foundry may change what it is given). */
export const headerPart = () => ({ template: `${ITEM_DIR}parts/header.hbs`, templates: itemPartials("portrait", "name-input") });

/** The Foundry tab navigation part. */
export const tabsPart = () => ({ template: "templates/generic/tab-navigation.hbs" });

/** The Effects tab part. */
export const effectsPart = () => ({ template: `${ITEM_DIR}parts/effects.hbs`, templates: itemPartials("effects-table") });

/** The Actions tab part. */
export const actionsPart = () => ({ template: `${ITEM_DIR}parts/actions.hbs`, templates: ACTIONS_PANEL_TEMPLATES });

/** The body of an action compendium entry: the lines of its action, with no tab and none of the panel's controls. */
export const actionEntryPart = () => ({ template: `${ITEM_DIR}parts/action-entry.hbs`, templates: ACTION_FIELDS_TEMPLATES });

/**
 * The static TABS of an item sheet: the details tab (id "details", so the .details CSS applies) and a second tab, then the Actions tab.
 *
 * @param {string} detailsLabel what the first tab is called: SCARMARK.Tabs.<detailsLabel>
 * @param {string} [second] id and label (SCARMARK.Tabs.<id>) of the second tab
 */
export function itemTabs(detailsLabel, second = "effects") {
  return {
    primary: {
      tabs: [
        { id: "details", label: `SCARMARK.Tabs.${detailsLabel}` },
        { id: second, label: `SCARMARK.Tabs.${second}` },
        { id: "actions", label: "SCARMARK.Tabs.actions" }
      ],
      initial: "details"
    }
  };
}

/** The TABS of a sheet with a "Properties" panel, an Effects tab (or another second tab) and the Actions tab. */
export const propertiesTabs = (second = "effects") => itemTabs("properties", second);

/**
 * The static PARTS of an item sheet: the header, the tab navigation, the details panel and the last parts (the Effects and Actions tabs unless told otherwise).
 *
 * @param {string} detailsTemplate path of the details template below templates/item/ (without .hbs), e.g. "weapon/properties"
 * @param {string[]} partials names of the item partials the details template uses (see itemPartials)
 * @param {object} [tail] the parts after the details panel, by part id
 */
export function itemSheetParts(detailsTemplate, partials, tail = { effects: effectsPart(), actions: actionsPart() }) {
  return {
    header: headerPart(),
    tabs: tabsPart(),
    details: { template: `${ITEM_DIR}${detailsTemplate}.hbs`, templates: itemPartials(...partials) },
    ...tail
  };
}

/** The PARTS of a one-page item sheet: the template of its body and the item partials it uses. */
export function bodyParts(bodyTemplate, partials) {
  return { body: { template: `${ITEM_DIR}${bodyTemplate}.hbs`, templates: itemPartials(...partials) } };
}
