/** Saving an action or an effect of a document to a compendium: the dialog that asks where, and the copy. Only world compendiums are offered (a system one is locked); when the usual one does not exist in the world yet, the dialog offers to make it. */
import { SYSTEM_ID, FLAGS, PACKS, ALTERATION_PACKS } from "../constants.mjs";
import { ACTION_ENTRY_TYPE } from "../config/index.mjs";
import { isEffectAction } from "../rules/index.mjs";
import { esc } from "./escape.mjs";
import { fieldValue } from "./form-fields.mjs";
import { warn, fail } from "./notify.mjs";
import { isCompendiumUuid, isWorldPack, shortName } from "./packs.mjs";

/** The value of the "make the usual compendium" option of the dialog. */
const NEW_PACK = "__new__";

/** The short name of the compendium an effect is offered first: the alterations of a weapon or of an armor for an effect on such an item, the effects for anything else. */
export function defaultEffectPack(effect) {
  const type = effect.parent?.documentName === "Item" ? effect.parent.type : "";
  if (type === "weapon") return shortName(ALTERATION_PACKS.weapon);
  if (type === "armor") return shortName(ALTERATION_PACKS.armor);
  return "effects";
}

/**
 * Ask where to save. Returns the compendium (made first when the user took the "new" option), or null when the dialog was closed.
 *
 * @param {object} options
 * @param {string} options.documentName "Item" or "ActiveEffect": only compendiums of this kind
 * @param {string} options.defaultName the short name of the compendium offered first ("actions", "effects" ...)
 * @param {string} options.name the name of what is saved, for the title
 */
async function askPack({ documentName, defaultName, name }) {
  const packs = game.packs.filter(pack => pack.documentName === documentName && isWorldPack(pack) && !pack.locked);
  const label = game.packs.get(`${SYSTEM_ID}.${defaultName}`)?.metadata.label ?? defaultName;
  const options = packs.map(pack => ({ value: pack.collection, label: pack.metadata.label, selected: shortName(pack.collection) === defaultName }));
  // The usual compendium is not in the world yet: offer to make it, and take it unless the user picks another.
  if (!game.packs.get(`world.${defaultName}`)) options.unshift({ value: NEW_PACK, label: game.i18n.format("SCARMARK.Compendium.newPack", { label }), selected: true });
  if (!options.length) {
    warn("SCARMARK.Compendium.noPack");
    return null;
  }
  const answer = await foundry.applications.api.DialogV2.prompt({
    window: { title: game.i18n.format("SCARMARK.Compendium.title", { name }) },
    content: `<div class="form-group"><label>${esc(game.i18n.localize("SCARMARK.Compendium.where"))}</label><select name="pack">${options.map(option => `<option value="${esc(option.value)}"${option.selected ? " selected" : ""}>${esc(option.label)}</option>`).join("")}</select></div>`,
    ok: { label: game.i18n.localize("SCARMARK.Compendium.save"), callback: (event, button) => ({ pack: fieldValue(button.form, "pack") }) },
    rejectClose: false
  });
  if (!answer) return null;
  if (answer.pack !== NEW_PACK) return game.packs.get(answer.pack) ?? null;
  return foundry.documents.collections.CompendiumCollection.createCompendium({ type: documentName, label, name: defaultName });
}

/** Tell the user what was saved, where. */
const saved = (name, pack) => ui.notifications.info(game.i18n.format("SCARMARK.Compendium.saved", { name, pack: pack.metadata.label }));

/**
 * Save one action of a document as an entry of an action compendium (an Action item whose one action is a copy of it, with a fresh id, switched on). An action that names the document's own copy of a library effect is pointed back at the library effect, so the entry works on another item; one that names an effect that only lives on this document cannot travel, and the user is told.
 *
 * @param {foundry.abstract.Document} document the item, actor or region behavior that holds the action
 * @param {object} action the stored action
 * @returns {Promise<Item|null>} the entry made, or null when nothing was saved
 */
export async function saveActionToCompendium(document, action) {
  const name = action.name || game.i18n.localize("SCARMARK.Action.unnamed");
  const pack = await askPack({ documentName: "Item", defaultName: shortName(PACKS.actions), name });
  if (!pack) return null;
  const copy = { ...foundry.utils.deepClone(action), id: foundry.utils.randomID(), disabled: false };
  let travels = true;
  if (isEffectAction(action) && action.effect && !isCompendiumUuid(action.effect)) {
    const source = document.effects?.get(action.effect)?.getFlag(FLAGS.scope, FLAGS.librarySource);
    if (source) copy.effect = source;
    else travels = false;
  }
  try {
    const entry = await Item.implementation.create({ name, type: ACTION_ENTRY_TYPE, system: { actions: [copy] } }, { pack: pack.collection });
    saved(name, pack);
    if (!travels) warn("SCARMARK.Compendium.ownEffect", { name });
    return entry;
  } catch (error) {
    fail("saving an action to a compendium", "SCARMARK.Compendium.failed", error);
    return null;
  }
}

/**
 * Save an Active Effect as an entry of an effect compendium (a plain copy: where it came from and the mark of an action that owns it are left out).
 *
 * @param {ActiveEffect} effect
 * @returns {Promise<ActiveEffect|null>} the entry made, or null when nothing was saved
 */
export async function saveEffectToCompendium(effect) {
  if (!effect) return null;
  const pack = await askPack({ documentName: "ActiveEffect", defaultName: defaultEffectPack(effect), name: effect.name });
  if (!pack) return null;
  const data = effect.toObject();
  delete data._id;
  delete data.origin;
  const flags = data.flags?.[FLAGS.scope];
  if (flags) {
    delete flags[FLAGS.librarySource];
    delete flags[FLAGS.ownedByAction];
  }
  try {
    const entry = await ActiveEffect.implementation.create(data, { pack: pack.collection });
    saved(effect.name, pack);
    return entry;
  } catch (error) {
    fail("saving an effect to a compendium", "SCARMARK.Compendium.failed", error);
    return null;
  }
}
