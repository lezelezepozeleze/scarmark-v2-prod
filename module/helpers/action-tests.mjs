/** The tests the Actions panel offers: every attribute, and every skill of the Skills compendium and of a world compendium of the same name (the canonical names; the character rolls against its own skill of that name). */
import { ATTRIBUTES } from "../config/index.mjs";
import { PACKS } from "../constants.mjs";
import { mergedEntries } from "./packs.mjs";

/** The canonical skill names, sorted: the Skills compendium and a world compendium of the same name (helpers/packs.mjs). */
export async function listSkillNames() {
  return (await mergedEntries(PACKS.skills)).map(entry => entry.name).sort((a, b) => a.localeCompare(b));
}

/** The groups of the test roll-down: [{ label, options: [{ value, label }] }]. A value is "attribute:<key>" or "skill:<name>" (rules/actions.mjs parseActionTest). */
export async function listActionTests() {
  const attributes = Object.entries(ATTRIBUTES).map(([key, attribute]) => ({ value: `attribute:${key}`, label: game.i18n.localize(attribute.label) }));
  const groups = [{ label: game.i18n.localize("SCARMARK.Action.testAttributes"), options: attributes }];
  const names = await listSkillNames();
  if (names.length) {
    groups.push({ label: game.i18n.localize("SCARMARK.Action.testSkills"), options: names.map(name => ({ value: `skill:${name}`, label: name })) });
  }
  return groups;
}
