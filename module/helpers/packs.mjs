/** Where the system reads its compendium content: a world compendium of the same name as a system one adds to it and wins on a name clash (a GM's own skill or alteration next to the shipped ones). */

/** Lowercase, collapse whitespace and fold every Unicode dash to "-", so spellings that differ only in case, spacing or dash kind compare equal. */
export const normalizeName = (s) => String(s).toLowerCase().replace(/[‐-―−]/g, "-").replace(/\s+/g, " ").trim();

/** The part of a pack id after the package: "skills" for "scarmark.skills" and for "world.skills". */
export const shortName = (collection) => String(collection).slice(String(collection).indexOf(".") + 1);

/** The uuid of the entry `id` of a pack (what an index entry without a uuid of its own is given). */
export const packEntryUuid = (pack, id) => `Compendium.${pack.collection}.${pack.documentName}.${id}`;

/** Whether a reference (a uuid, or the id of a document of an item) points into a compendium. */
export const isCompendiumUuid = (reference) => String(reference ?? "").startsWith("Compendium.");

/** Whether a pack is a world compendium (id "world.<name>"). */
export const isWorldPack = (pack) => String(pack?.collection).startsWith("world.");

/**
 * The packs behind a system pack id, in priority order: the world pack of the same short name first (`world.skills` for `scarmark.skills`), then the system pack. Only packs of one kind of document are returned (the given one, else the kind of the system pack, else of the world pack), and only packs this user may see.
 *
 * @param {string} systemPackId e.g. PACKS.skills
 * @param {string} [documentName] e.g. "ActiveEffect": only packs of this kind
 * @returns {CompendiumCollection[]} zero, one or two packs
 */
function packsFor(systemPackId, documentName) {
  const system = game.packs?.get?.(systemPackId);
  const world = game.packs?.get?.(`world.${shortName(systemPackId)}`);
  const kind = documentName ?? system?.documentName ?? world?.documentName;
  return [world, system].filter(pack => pack && pack.visible !== false && pack.documentName === kind);
}

/**
 * The entries of all packs behind a system pack id, one per normalized name: the world entry wins, the system entry fills the gaps. Each entry knows its pack, so a document can be fetched from the right one.
 *
 * @param {string} systemPackId e.g. PACKS.skills
 * @param {string} [documentName] e.g. "ActiveEffect": only packs of this kind (see packsFor)
 * @returns {Promise<{name: string, id: string, img?: string, uuid: string, pack: CompendiumCollection}[]>}
 */
export async function mergedEntries(systemPackId, documentName) {
  const byName = new Map();
  for (const pack of packsFor(systemPackId, documentName)) {
    const index = await pack.getIndex();
    for (const entry of index) {
      if (!entry.name) continue;
      const key = normalizeName(entry.name);
      if (byName.has(key)) continue;
      byName.set(key, { name: entry.name, id: entry._id, img: entry.img, uuid: entry.uuid ?? packEntryUuid(pack, entry._id), pack });
    }
  }
  return [...byName.values()];
}
