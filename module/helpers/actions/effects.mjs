/** The "add effect" actions: plan what each would do, put the effects on their targets, and keep the item's own copies of the library effects its actions pick (and the owned ones transferring). */
import { ACTION_RESULTS } from "../../config/index.mjs";
import { FLAGS } from "../../constants.mjs";
import { actionsFor, isEffectAction, ownedEffectChanges, isImmediateEffect } from "../../rules/index.mjs";
import { warn } from "../notify.mjs";
import { isCompendiumUuid } from "../packs.mjs";
import { stampEffectData, currentWorldTime, copyLibraryEffect, applyEffect } from "../effect-library.mjs";
import { addCard, actionTargets } from "./shared.mjs";

/** The effect an action names: a library effect by its uuid (a region behavior or a chest has no effects of its own to copy it to), or one of the document's own by its id (the copy an item keeps of a library effect an action picked). */
const effectOf = (item, reference) => (isCompendiumUuid(reference) ? fromUuid(reference) : item.effects?.get(reference));

/**
 * What the add-effect actions of `item` that fire on `trigger` would do: one entry per action, { trigger, item, effectName, on, data, targets }, with the effect already stamped for putting on an actor. Actions that cannot run (the effect is gone, nobody to target) are reported to the user and left out.
 */
async function planActions(item, trigger, actor) {
  const plan = [];
  for (const action of actionsFor(item.system.actions, trigger).filter(isEffectAction)) {
    const effect = await effectOf(item, action.effect);
    if (!effect) {
      warn("SCARMARK.Action.effectMissing", { item: item.name });
      continue;
    }
    const { on, targets } = actionTargets(action, trigger, actor);
    if (!targets.length) continue;
    plan.push({ trigger, item, effectName: effect.name, on, data: stampEffectData(effect.toObject(), { now: currentWorldTime(), origin: item.uuid }), targets });
  }
  return plan;
}

/**
 * Put the effect of every plan entry on its targets (the ones the user owns) and add its card to the run: "<actor> used <item>. <target> is now <effect>." (config/actions.mjs; no card for an entry marked `silent`).
 *
 * @returns {Promise<number>} how many effects were added
 */
async function applyPlan(plan, run) {
  let applied = 0;
  for (const entry of plan) {
    const done = [];
    for (const target of entry.targets) {
      if (!target.isOwner) {
        warn("SCARMARK.Action.noPermission", { actor: target.name });
        continue;
      }
      if (await applyEffect(target, foundry.utils.deepClone(entry.data))) done.push(target);
    }
    applied += done.length;
    if (done.length && !entry.silent) {
      const result = isImmediateEffect(entry.data) ? ACTION_RESULTS.immediate : (done.length > 1 ? ACTION_RESULTS.addedMany : ACTION_RESULTS.added);
      addCard(run, result, { target: done.map(target => target.name).join(", "), effect: entry.effectName });
    }
  }
  return applied;
}

/**
 * Do the add-effect actions of a run: plan them, let the caller adjust the plan (consuming adds the toxicity), put the effects on their targets.
 *
 * @param {object} context the run: { item, trigger, run, adjustPlan }
 * @returns {Promise<number>} how many effects were added
 */
export async function runEffectActions({ item, trigger, run, adjustPlan }) {
  const plan = await planActions(item, trigger, run.actor);
  adjustPlan?.(plan);
  return applyPlan(plan, run);
}

/**
 * Make the effects named by the item's "owned" actions transfer to the owner, and undo it for the ones whose action is gone (see rules/actions.mjs ownedEffectChanges). Called when the actions of an item change (foundry/action-hooks.mjs). Returns how many effects were updated.
 */
export async function syncOwnedEffects(item) {
  const flag = `flags.${FLAGS.scope}.${FLAGS.ownedByAction}`;
  const effects = item.effects.map(effect => ({ id: effect.id, transfer: Boolean(effect.transfer), managed: effect.getFlag(FLAGS.scope, FLAGS.ownedByAction) === true }));
  const updates = ownedEffectChanges(effects, item.system.actions).map(change => ({ _id: change.id, transfer: change.transfer, [flag]: change.managed }));
  if (updates.length) await item.updateEmbeddedDocuments("ActiveEffect", updates);
  return updates.length;
}

/**
 * An action can pick an effect of the effect library (a compendium uuid). The item keeps its own copy, so its Effects tab lists everything its actions use: the copy is made (once per library effect, marked with where it came from) and the action is pointed at it. Called when the actions of an item change (foundry/action-hooks.mjs; only items keep copies, see effectOf). Returns how many actions were pointed at a copy.
 */
export async function materializeActionEffects(item) {
  const actions = (item.system.actions ?? []).map(action => ({ ...action }));
  let changed = 0;
  for (const action of actions) {
    if (!isEffectAction(action) || !isCompendiumUuid(action.effect)) continue;
    const source = action.effect;
    const copy = item.effects.find(effect => effect.getFlag(FLAGS.scope, FLAGS.librarySource) === source) ?? await copyLibraryEffect(item, source);
    if (!copy) {
      warn("SCARMARK.Action.effectMissing", { item: item.name });
      continue;
    }
    action.effect = copy.id;
    changed++;
  }
  if (changed) await item.update({ "system.actions": actions });
  return changed;
}
