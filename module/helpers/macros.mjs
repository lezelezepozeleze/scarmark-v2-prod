/** The macros an action can run: the world's and those of the macro compendiums, in groups like the effect library. */
import { packEntryUuid } from "./packs.mjs";

const byName = (a, b) => a.name.localeCompare(b.name);

/** @returns {Promise<{label: string, entries: {uuid: string, name: string}[]}[]>} the macros the user can see, a group for the world and one per compendium of macros, each sorted by name; empty groups are left out */
export async function listMacros() {
  const groups = [];
  const world = [...game.macros].map(macro => ({ uuid: macro.uuid, name: macro.name })).sort(byName);
  if (world.length) groups.push({ label: game.i18n.localize("SCARMARK.Action.macrosWorld"), entries: world });
  for (const pack of game.packs.filter(candidate => candidate.documentName === "Macro" && candidate.visible !== false)) {
    const index = await pack.getIndex();
    const entries = index.map(entry => ({ uuid: entry.uuid ?? packEntryUuid(pack, entry._id), name: entry.name })).sort(byName);
    if (entries.length) groups.push({ label: pack.metadata.label, entries });
  }
  return groups;
}
