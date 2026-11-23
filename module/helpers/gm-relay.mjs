/** Doing something that may belong to somebody else. An exchange resolves on the client that clicked, which often does not own what it changes (a player blocking an NPC's club, a weapon wounding the other side's actor, a player stepping into a region): the owner does it directly, anybody else asks the active GM through a user query. The GM-side handlers are registered in helpers/combat/gm-update.mjs. */
import { warn } from "./notify.mjs";

/**
 * Ask the active GM to do something (a user query).
 *
 * @param {string} query the user query the GM answers (constants.mjs QUERIES)
 * @param {object} payload what the query carries
 * @returns {Promise<boolean>} whether the GM did it; false when no GM is connected or the GM refused (the user is told)
 */
export async function askGM(query, payload) {
  const gm = game.users.activeGM;
  if (!gm) {
    warn("SCARMARK.CombatAuto.needGM");
    return false;
  }
  try {
    await gm.query(query, payload);
    return true;
  } catch (err) {
    console.warn(`Scarmark | GM request failed (${query})`, err);
    warn("SCARMARK.CombatAuto.needGM");
    return false;
  }
}

/**
 * The document a GM-side handler was asked about, when `accepts` says it may touch it; otherwise the request is refused with an error.
 *
 * @param {string} uuid
 * @param {(document: Document|null) => boolean} accepts
 */
export async function documentFor(uuid, accepts) {
  const document = await fromUuid(uuid);
  if (!accepts(document)) throw new Error(game.i18n.localize("SCARMARK.CombatAuto.invalidCombatItem"));
  return document;
}

/**
 * Do something to a document: directly when this user owns it, else ask the active GM.
 *
 * @param {Document} document what the change is about
 * @param {() => Promise<unknown>} direct what to do when this user owns the document
 * @param {string} query the user query the GM answers
 * @param {object} payload what the query carries
 * @returns {Promise<boolean>} whether it was done
 */
export async function doOrAskGM(document, direct, query, payload) {
  if (document.isOwner) {
    await direct();
    return true;
  }
  return askGM(query, payload);
}
