/** What an "alter" action works with: the alterations it offers (the entries of the armor and weapon alteration compendia, constants.mjs ALTERATION_PACKS) and the dialog that asks which of the character's items gets the one picked. */
import { fieldValue } from "./form-fields.mjs";
import { ALTERATION_PACKS } from "../constants.mjs";
import { esc } from "./escape.mjs";
import { mergedEntries } from "./packs.mjs";
import { warn } from "./notify.mjs";

/** @returns {Promise<Object<string, {uuid: string, name: string}[]>>} item type -> its alterations, sorted by name (empty when the compendium is missing) */
export async function listAlterations() {
  const lists = {};
  for (const [type, collection] of Object.entries(ALTERATION_PACKS)) {
    const entries = await mergedEntries(collection);
    lists[type] = entries.map(({ uuid, name }) => ({ uuid, name })).sort((a, b) => a.name.localeCompare(b.name));
  }
  return lists;
}

/**
 * Ask which of the character's items of a kind gets the alteration: a small dialog with a roll-down of all of them (every owned weapon, or every owned armor piece).
 *
 * @param {Actor} owner the character that uses the item
 * @param {string} type the kind of item, one of ALTERABLE_ITEM_TYPES
 * @param {string} alteration the name of the alteration, for the title of the dialog
 * @returns {Promise<Item|null>} the item picked, or null when nothing was picked: the dialog was closed (quietly), or the character has none or the answer named no item of theirs (the user is told)
 */
export async function pickItemToAlter(owner, type, alteration) {
  const kind = game.i18n.localize(`TYPES.Item.${type}`);
  const items = owner.items.filter(item => item.type === type).sort((a, b) => a.name.localeCompare(b.name));
  if (!items.length) {
    warn("SCARMARK.Action.noItemsToAlter", { actor: owner.name, type: kind });
    return null;
  }
  // The answer is an object, so pressing the button (always an object) is told apart from closing the dialog (nothing), whatever the field held.
  const answer = await foundry.applications.api.DialogV2.prompt({
    window: { title: game.i18n.format("SCARMARK.Action.alterPickTitle", { alteration }) },
    content: `<div class="form-group"><label>${esc(game.i18n.format("SCARMARK.Action.alterPickLabel", { type: kind.toLowerCase() }))}</label><select name="pick">${items.map(item => `<option value="${esc(item.id)}">${esc(item.name)}</option>`).join("")}</select></div>`,
    ok: { label: game.i18n.localize("SCARMARK.Action.alterPickOk"), callback: (event, button) => ({ id: fieldValue(button.form, "pick") }) },
    rejectClose: false
  });
  if (!answer) return null;
  const picked = answer.id ? owner.items.get(answer.id) : null;
  if (!picked) warn("SCARMARK.Action.alterPickMissing", { type: kind.toLowerCase() });
  return picked ?? null;
}
