/** The action compendium: the entries (items of type "action") of the system pack and of a world compendium named "actions", and copying the actions of one into a document. */
import { PACKS } from "../constants.mjs";
import { ACTION_ENTRY_TYPE } from "../config/index.mjs";
import { actionsFromEntry } from "../rules/index.mjs";
import { mergedEntries } from "./packs.mjs";

/** The entries of the action compendium, sorted by name: [{ uuid, name, img }]. A world compendium named "actions" adds to the system one and wins on a name clash (helpers/packs.mjs). */
export async function listActionLibrary() {
  const entries = (await mergedEntries(PACKS.actions, "Item")).map(({ uuid, name, img }) => ({ uuid, name, img }));
  return entries.sort((a, b) => a.name.localeCompare(b.name));
}

/** The actions of an entry as new actions (fresh ids, see actionsFromEntry), or null when the uuid no longer resolves to an action entry. */
export async function copyLibraryActions(uuid) {
  const entry = await fromUuid(uuid);
  if (!entry || entry.type !== ACTION_ENTRY_TYPE) return null;
  return actionsFromEntry(entry._source?.system?.actions ?? entry.system.actions, entry.name, () => foundry.utils.randomID());
}
