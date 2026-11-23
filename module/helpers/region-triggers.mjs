/** What happens when a token sets off a region behavior of the system: the actions of the behavior run as the actor of that token. */
import { ACTION_TRIGGER_REGION, REGION_ONCE, REGION_WHEN } from "../config/index.mjs";
import { QUERIES } from "../constants.mjs";
import { whoMatches, isSpent } from "../rules/index.mjs";
import { runActions } from "./item-actions.mjs";
import { doOrAskGM, askGM } from "./gm-relay.mjs";

/** Mark a "once" behavior as spent. A player may not edit a region, so the GM does it (helpers/combat/gm-update.mjs). */
const spend = (behavior) => doOrAskGM(behavior, () => behavior.update({ "system.spent": true }), QUERIES.spendRegionBehavior, { uuid: behavior.uuid });

/** Pause the game for everybody. Only a GM can, so a player's client asks the GM (helpers/combat/gm-update.mjs). */
const pauseGame = async () => (game.user.isGM ? game.togglePause(true, { broadcast: true }) : askGM(QUERIES.pauseGame, {}));

/**
 * The actor of the token in a region event that this user caused, or null. The event reaches every client and the one that moved the token runs the actions, so another user's event is theirs to handle; an event that carries no user or no token is logged (the shape of the event is not something this code controls).
 */
function actorOfOwnEvent(event) {
  if (!event.user) {
    console.warn("Scarmark | a region event carries no user, so nobody can be told apart as the one that moved", event);
    return null;
  }
  if (!event.user.isSelf) return null;
  const actor = event.data?.token?.actor ?? null;
  if (!actor) console.warn("Scarmark | a region event carries no token with an actor", event);
  return actor;
}

/**
 * A region event reached a behavior of the system. When it is the event its `when` says (crossed or stopped), this user caused it, and the token is one the behavior is for, the actions run as the token's actor. A "once" behavior is marked as spent first, and one that pauses the game does that before the actions run.
 *
 * @param {RegionBehavior} behavior
 * @param {{name: string, user: User, data: {token: TokenDocument}}} event
 */
export async function handleRegionEvent(behavior, event) {
  const { when, who, frequency, pause, spent } = behavior.system;
  if (event.name !== REGION_WHEN[when]?.event) return;
  const actor = actorOfOwnEvent(event);
  if (!actor || !whoMatches(who, actor) || isSpent(frequency, spent)) return;
  if (frequency === REGION_ONCE && !(await spend(behavior))) return;
  if (pause) await pauseGame();
  try {
    await runActions(behavior, ACTION_TRIGGER_REGION, { actor });
  } catch (err) {
    console.error("Scarmark | the actions of a region behavior failed", err);
  }
}
