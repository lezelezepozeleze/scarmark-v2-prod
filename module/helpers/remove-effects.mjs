/** Taking effects off an actor, also when the actor is somebody else's: a weapon that wounds removes an effect from the one it hit, and that actor usually belongs to the other side. Kept apart from helpers/combat/gm-update.mjs so the action runner can use it without loading the combat modules. */
import { QUERIES } from "../constants.mjs";
import { doOrAskGM, documentFor } from "./gm-relay.mjs";

/**
 * Delete effects of an actor: directly when this user owns it, else relayed to the active GM.
 *
 * @param {Actor} actor the one the effects are on
 * @param {string[]} ids the ids of the effects to delete
 * @returns {Promise<boolean>} whether they were deleted
 */
export const removeActorEffects = (actor, ids) => doOrAskGM(actor, () => actor.deleteEmbeddedDocuments("ActiveEffect", ids), QUERIES.removeEffects, { uuid: actor.uuid, ids });

/** GM-side handler of the relay. Narrow: only effects that are on that actor. */
export async function handleRemoveEffects({ uuid, ids } = {}) {
  const actor = await documentFor(uuid, document => document instanceof Actor);
  const own = (ids ?? []).filter(id => actor.effects.has(id));
  if (own.length) await actor.deleteEmbeddedDocuments("ActiveEffect", own);
  return true;
}
