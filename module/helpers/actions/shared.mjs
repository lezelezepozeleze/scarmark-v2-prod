/** What every kind of action needs: the actor that carries the item, who an action acts on, the cards one run collects, and the loop over the actions of one kind. */
import { ACTION_TARGET_SELECTED_TOKEN, ACTION_TARGET_SELF, ACTION_TARGET_HIT } from "../../config/index.mjs";
import { actionsFor, targetOf } from "../../rules/index.mjs";
import { warn } from "../notify.mjs";

/** The actor that carries the item (null for a loose item). */
export const ownerOf = (item) => item.parent?.documentName === "Actor" ? item.parent : null;

/**
 * What one run of the actions of an item has to say: the cards its actions want (`cards`), the blocks of its tests with what they did (`blocks`, HTML) and their dice (`rolls`). Nothing is posted while the actions run, so a test can be rolled after the effects that change it (the toxicity of a drink) and still end up in the first card.
 *
 * @param {Actor|null} actor who the actions act as: the one that carries the item, or the one that opened the sheet of an actor that has the actions (null: nobody, which the actions report)
 * @returns {{actor: Actor|null, cards: {result: string, data: object, on: string|null}[], blocks: string, rolls: Roll[]}}
 */
export const newRun = (actor) => ({ actor, cards: [], blocks: "", rolls: [] });

/** Add a card to a run: what happened ("Knife is now Sharpened"), and on whom the item was used. */
export const addCard = (run, result, data, on = null) => run.cards.push({ result, data, on });

/** The actors an action's "on" names (`self`: the actor that acts, `hit`: the one a weapon wounded); empty when there are none. */
export function targetsOf(action, actor, hit = null) {
  if (action.on === ACTION_TARGET_HIT) return hit ? [hit] : [];
  if (action.on === ACTION_TARGET_SELF) return actor ? [actor] : [];
  if (action.on === ACTION_TARGET_SELECTED_TOKEN) return [...new Set((canvas.tokens?.controlled ?? []).map(token => token.actor).filter(Boolean))];
  return [];
}

/** The lang key of the warning for an action that has nobody to act on. */
export const NO_TARGET_MESSAGE = {
  [ACTION_TARGET_SELF]: "SCARMARK.Action.noOwner",
  [ACTION_TARGET_SELECTED_TOKEN]: "SCARMARK.Action.noTarget"
};

/**
 * Who an action of `trigger` acts on: `on` is what the trigger asks (a trigger that asks for no target always acts on the carrier) and `targets` the actors it names. The user is told when there is nobody, except for the one a weapon wounded (it may simply be nobody).
 *
 * @returns {{on: string, targets: Actor[]}}
 */
export function actionTargets(action, trigger, actor, hit = null) {
  const on = targetOf(trigger, action);
  const targets = targetsOf({ ...action, on }, actor, hit);
  if (!targets.length && on !== ACTION_TARGET_HIT) warn(NO_TARGET_MESSAGE[on] ?? "SCARMARK.Action.noTarget");
  return { on, targets };
}

/**
 * What the handler of one action reports. An action that did not happen is never silent: either it was refused and the user was told why (`refuse`), or there was nothing to say (the user closed the dialog, the trigger has no moment to speak at).
 */
export const DONE = "done";
export const SKIPPED = "skipped";
export const REFUSED = "refused";

/** Tell the user why an action cannot be done (a lang key and its values), and report it as refused. */
export function refuse(key, data) {
  warn(key, data);
  return REFUSED;
}

/**
 * Run `handler(action, actor)` for each action of `item` of that kind that fires on `trigger`, as the actor of the run; with nobody to act as (an item that is not on a character) it cannot (a warning). The handler returns DONE, SKIPPED or REFUSED; a handler that returns anything else is a bug and is logged, so a forgotten return value does not turn into a silent no-op.
 *
 * @returns {Promise<number>} how many actions were done
 */
export async function forEachAction({ item, trigger, run }, kind, handler) {
  const actor = run.actor;
  let count = 0;
  for (const action of actionsFor(item.system.actions, trigger).filter(kind)) {
    if (!actor) {
      warn("SCARMARK.Action.noOwner");
      continue;
    }
    const outcome = await handler(action, actor);
    if (outcome === DONE) count++;
    else if (outcome !== SKIPPED && outcome !== REFUSED) console.error("Scarmark | an action handler returned no outcome", action, outcome);
  }
  return count;
}
