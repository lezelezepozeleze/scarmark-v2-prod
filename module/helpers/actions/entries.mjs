/**
 * The compendium entries that actions name by uuid (the alteration of an alter action, the library effect of a remove action), and what to do when a uuid no longer resolves (a compendium rebuilt, a world compendium made again: its entries have new ids). The item remembers the name of each entry (FLAGS.entryNames, by the id of the action); with the name the action finds the entry again in the compendiums it came from, so a stale uuid costs a lookup and not a broken item.
 */
import { FLAGS } from "../../constants.mjs";
import { ACTION_KINDS, ACTION_KIND_ALTER, ACTION_KIND_REMOVE, ACTION_KIND_MACRO } from "../../config/index.mjs";
import { kindOf } from "../../rules/index.mjs";
import { normalizeName } from "../packs.mjs";

/** The name remembered for the entry of an action, or "". */
const rememberedName = (item, action) => item.getFlag?.(FLAGS.scope, FLAGS.entryNames)?.[action.id] ?? "";

/** Remember the name of the entry an action names, when it is not remembered yet (or changed). The flag merges per action, so the other names stay. A failed write (no permission) is only logged: the action works without it. */
async function remember(item, action, entry) {
  if (!action.id || !entry?.name || rememberedName(item, action) === entry.name) return;
  try {
    await item.setFlag(FLAGS.scope, FLAGS.entryNames, { [action.id]: entry.name });
  } catch (err) {
    console.warn("Scarmark | could not remember the name of an entry of an action", err);
  }
}

/**
 * The entry an action names: the document of the uuid, or, when the uuid no longer resolves, the entry of the same name (case, spacing and dashes aside) among `candidates`. Null when there is none; the caller tells the user.
 *
 * @param {Item} item the item that has the action
 * @param {{id?: string}} action
 * @param {string} uuid the compendium uuid the action stores
 * @param {() => Promise<{uuid: string, name: string}[]>} candidates the entries the uuid may have come from, read only when the uuid does not resolve
 * @returns {Promise<Document|null>}
 */
export async function resolveEntry(item, action, uuid, candidates) {
  const entry = await fromUuid(uuid);
  if (entry) {
    await remember(item, action, entry);
    return entry;
  }
  const name = rememberedName(item, action);
  if (!name) return null;
  const wanted = normalizeName(name);
  const found = (await candidates()).find(candidate => normalizeName(candidate.name) === wanted);
  return found ? fromUuid(found.uuid) : null;
}

/** The kinds of action that name a document by uuid: an alteration, a library effect, a macro. */
const ENTRY_KINDS = [ACTION_KIND_ALTER, ACTION_KIND_REMOVE, ACTION_KIND_MACRO];

/** The stored field of an action that holds the uuid of the document it names, or null for a kind that names none. */
const entryField = (action) => (ENTRY_KINDS.includes(kindOf(action)) ? ACTION_KINDS[kindOf(action)].field : null);

/**
 * Remember the name of every entry the actions of an item name, so a uuid that goes stale can be found again by name. Called when the actions of an item change (foundry/action-hooks.mjs).
 *
 * @returns {Promise<number>} how many actions name an entry that resolves
 */
export async function rememberEntryNames(item) {
  let count = 0;
  for (const action of item.system.actions ?? []) {
    const field = entryField(action);
    const uuid = field ? String(action[field] ?? "") : "";
    if (!uuid) continue;
    const entry = await fromUuid(uuid);
    if (!entry) continue;
    await remember(item, action, entry);
    count++;
  }
  return count;
}
