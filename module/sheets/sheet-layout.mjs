/**
 * Tabs and parts of the actor sheets, built from tab ids so the sheet classes do not repeat the same lists.
 * A tab id names its part and, by default, its template: templates/actor/parts/<id>.hbs.
 */
import { TEMPLATE_DIR } from "../constants.mjs";
import { ACTIONS_PANEL_TEMPLATES } from "./actions/action-panel.mjs";

const PARTS_DIR = `${TEMPLATE_DIR}actor/parts/`;

const PARTIALS_DIR = `${TEMPLATE_DIR}actor/partials/`;

/**
 * The partials (templates/actor/partials/<name>.hbs) each part uses. Foundry loads them before the part renders (the `templates` key of a part) and registers each under its path, which is how the templates call them: {{> "systems/scarmark/templates/actor/partials/<name>.hbs"}}.
 */
const PART_PARTIALS = {
  header: ["header-identity"],
  profile: ["attribute-rows", "trait-column"],
  combat: ["combat-section", "table"],
  esoterics: ["esoteric-section", "table"],
  gear: ["gear-section", "container-section", "chest-section", "chest-row"]
};

/**
 * The tabs (a record by id) or the parts (a list of ids) of a sheet that this user may see: the ids a sheet keeps for the GM are left out for anybody else.
 *
 * @param {Object<string, *>|string[]} entries tab configs by id, or part ids
 * @param {string[]} gmOnly the ids only the GM sees
 * @param {boolean} isGM whether the user is the GM
 */
export function visibleTo(entries, gmOnly, isGM) {
  if (isGM) return entries;
  if (Array.isArray(entries)) return entries.filter(id => !gmOnly.includes(id));
  return Object.fromEntries(Object.entries(entries).filter(([id]) => !gmOnly.includes(id)));
}

/** The play tabs every stat-bearing sheet (Character, NPC, Creature, Animal) shows, in order. */
export const PLAY_TABS = ["profile", "skills", "combat", "esoterics", "gear", "containers", "effects"];

/**
 * The static TABS of a sheet: one tab group ("primary") with a tab per id.
 *
 * @param {string[]} ids tab ids in display order
 * @param {{initial?: string, labels?: Object<string, string>}} [options] the first tab shown, and lang keys for tabs whose label is not SCARMARK.Tabs.<id>
 */
export function tabsConfig(ids, { initial = "profile", labels = {} } = {}) {
  return {
    primary: {
      tabs: ids.map(id => ({ id, label: labels[id] ?? `SCARMARK.Tabs.${id}` })),
      initial
    }
  };
}

/**
 * The static PARTS of a sheet: the header, Foundry's tab navigation and one part per tab id.
 *
 * @param {string[]} ids tab ids in display order
 * @param {{header?: string, templates?: Object<string, string>}} [options] header template name, and template names for parts that do not use <id>.hbs
 */
export function partsConfig(ids, { header = "header", templates = {} } = {}) {
  const parts = {
    header: { template: `${PARTS_DIR}${header}.hbs` },
    tabs: { template: "templates/generic/tab-navigation.hbs" }
  };
  for (const id of ids) parts[id] = { template: `${PARTS_DIR}${templates[id] ?? id}.hbs` };
  for (const [id, names] of Object.entries(PART_PARTIALS)) {
    if (parts[id]) parts[id].templates = names.map(name => `${PARTIALS_DIR}${name}.hbs`);
  }
  if (parts.actions) parts.actions.templates = ACTIONS_PANEL_TEMPLATES;
  return parts;
}
