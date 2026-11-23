/**
 * The effect library: every standalone Active Effect compendium of this system and of the world (alcohol, hangovers, potion sickness, combat poisonings, outnumbered ...). The Add button of the actor Effects tab lists them, and picking one puts a stamped copy on the actor - the same stamp Consume uses.
 */
import { SYSTEM_ID, FLAGS, ALTERATION_PACKS } from "../constants.mjs";
import { durationSeconds, isImmediateEffect, withEffectFlag } from "../rules/index.mjs";
import { rewriteDocument } from "./rewrite.mjs";
import { mergedEntries, shortName, isWorldPack } from "./packs.mjs";

/**
 * Turn effect data into the copy that goes on an actor: enabled, not transferred, with the countdown started at `now` and the calendar-independent expiry stamp (Foundry cannot compute a time-based duration's "remaining" without game.time.calendar, which Simple Calendar does not set; the sweep in foundry/effect-expiry.mjs reads the stamp). Pure: returns a new object.
 */
export function stampEffectData(source, { now = null, origin = null } = {}) {
  const data = structuredClone(source);
  delete data._id;
  data.disabled = false;
  data.transfer = false;
  if (origin) data.origin = origin;
  if (now !== null) data.start = { ...(data.start ?? {}), time: now };
  const seconds = durationSeconds(data.duration);
  if (now !== null && seconds !== null) {
    data.flags = data.flags ?? {};
    data.flags[FLAGS.scope] = { ...(data.flags[FLAGS.scope] ?? {}), [FLAGS.expireWorldTime]: now + seconds };
  }
  return data;
}

/** The current world time, or null when the time module makes the getter throw. */
export function currentWorldTime() {
  try { return game.time?.worldTime ?? null; } catch { return null; }
}

/**
 * The effect packs of this system and of the world (not the alteration compendia, system or world): [{ label, entries: [{ uuid, name, img }] }], packs and entries sorted by name. A world compendium of the same name as a system one adds its entries to the group and wins on a name clash; a world compendium with no system counterpart is a group of its own (helpers/packs.mjs). Packs the user may not see are left out.
 */
export async function listEffectLibrary() {
  const alterationNames = Object.values(ALTERATION_PACKS).map(shortName);
  const effectPacks = game.packs.filter(p => p.documentName === "ActiveEffect" && p.visible !== false && (p.metadata.packageName === SYSTEM_ID || isWorldPack(p)) && !alterationNames.includes(shortName(p.collection)));
  const groups = [];
  for (const packName of new Set(effectPacks.map(p => shortName(p.collection)))) {
    const systemId = `${SYSTEM_ID}.${packName}`;
    const entries = (await mergedEntries(systemId, "ActiveEffect")).map(({ uuid, name, img }) => ({ uuid, name, img }));
    entries.sort((a, b) => a.name.localeCompare(b.name));
    const label = (effectPacks.find(p => p.collection === systemId) ?? effectPacks.find(p => p.collection === `world.${packName}`)).metadata.label;
    if (entries.length) groups.push({ label, entries });
  }
  return groups.sort((a, b) => a.label.localeCompare(b.label));
}

/** Create an effect on a document; returns it. */
async function createEffect(document, data) {
  const [created] = await document.createEmbeddedDocuments("ActiveEffect", [data]);
  return created ?? null;
}

/**
 * Apply effect data to a character or item the way the effect says: an ongoing effect is put in Effects, an immediate one rewrites the stored values once (helpers/rewrite.mjs) and leaves nothing behind.
 *
 * @returns {Promise<boolean>} whether something was applied
 */
export async function applyEffect(document, data) {
  if (isImmediateEffect(data)) return (await rewriteDocument(document, data)) > 0;
  return Boolean(await createEffect(document, data));
}

/** Put a library effect on an actor (see applyEffect), stamped as the library stamps its effects. Returns whether it was applied, or null when the uuid no longer resolves. */
export async function applyLibraryEffect(actor, uuid) {
  const entry = await fromUuid(uuid);
  return entry ? applyEffect(actor, stampEffectData(entry.toObject(), { now: currentWorldTime(), origin: entry.uuid })) : null;
}

/** Put a plain copy of a library effect on a document (an item keeps it as part of its definition, so the copy is not stamped or started, and does not transfer to the owner). The copy remembers where it came from. Returns the created effect, or null when the uuid no longer resolves. */
export async function copyLibraryEffect(document, uuid) {
  const effect = await fromUuid(uuid);
  if (!effect) return null;
  const data = withEffectFlag(effect.toObject(), FLAGS.librarySource, uuid);
  delete data._id;
  data.transfer = false;
  return createEffect(document, data);
}
