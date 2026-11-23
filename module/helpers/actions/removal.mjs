/** The "remove effect" actions: take a library effect off the targets. */
import { ACTION_RESULTS, ACTION_TARGET_HIT } from "../../config/index.mjs";
import { actionsFor, isRemoveAction, effectsMatching } from "../../rules/index.mjs";
import { warn } from "../notify.mjs";
import { removeActorEffects } from "../remove-effects.mjs";
import { listEffectLibrary } from "../effect-library.mjs";
import { addCard, actionTargets, refuse, DONE, SKIPPED, REFUSED } from "./shared.mjs";
import { resolveEntry } from "./entries.mjs";

/**
 * Take the effects of a library entry (its name, or put there from it) off one target and add the card. The one a weapon wounded (`quiet`) may belong to the other side, so the removal goes through the GM and it is not an error that the one hit has nothing to lose; any other target must be owned by this user and is told when it has none.
 *
 * @returns {Promise<string>} DONE, SKIPPED (nothing to take off, quietly) or REFUSED (the user is told why)
 */
async function removeFrom(target, entry, { quiet, run }) {
  const ids = effectsMatching(target.effects.contents, { uuid: entry.uuid, name: entry.name });
  if (!ids.length) return quiet ? SKIPPED : refuse("SCARMARK.Action.noSuchEffect", { target: target.name, effect: entry.name });
  if (!quiet && !target.isOwner) return refuse("SCARMARK.Action.noPermissionRemove", { actor: target.name });
  if (!(await removeActorEffects(target, ids))) return REFUSED;   // removeActorEffects has told the user
  addCard(run, ACTION_RESULTS.removed, { target: target.name, effect: entry.name });
  return DONE;
}

/**
 * Take effects off targets: the remove-effect actions of `item` that fire on `trigger`. Each names a library effect; the target loses its effects of that name or put there from that entry. Each removal posts a card.
 *
 * @param {object} context the run: { item, trigger, run, hit } (`hit` is the one a weapon wounded, for the "hit" trigger)
 * @returns {Promise<number>} how many targets lost something
 */
export async function runRemoveActions({ item, trigger, run, hit }) {
  let removed = 0;
  for (const action of actionsFor(item.system.actions, trigger).filter(isRemoveAction)) {
    const entry = await resolveEntry(item, action, action.effect, async () => (await listEffectLibrary()).flatMap(group => group.entries));
    if (!entry) {
      warn("SCARMARK.Action.effectMissing", { item: item.name });
      continue;
    }
    const { on, targets } = actionTargets(action, trigger, run.actor, hit);
    const quiet = on === ACTION_TARGET_HIT;
    for (const target of targets) {
      if (await removeFrom(target, entry, { quiet, run }) === DONE) removed++;
    }
  }
  return removed;
}
