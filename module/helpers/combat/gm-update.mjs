/** Updates that belong to somebody else, relayed through the active GM (helpers/gm-relay.mjs): combat items, on-hit charges, taking effects off an actor, the "spent" mark of a region behavior, and its pause of the game. */
import { QUERIES, FLAGS } from "../../constants.mjs";
import { ON_HIT_ITEM_TYPES, REGION_BEHAVIOR_STEP } from "../../config/index.mjs";
import { chargesAfterHit, allowedCombatChanges } from "../../rules/index.mjs";
import { handleRemoveEffects } from "../remove-effects.mjs";
import { doOrAskGM, documentFor } from "../gm-relay.mjs";

/**
 * Update a combat item (the broken flag and the durability, `quality`, of a weapon or armor piece) even when it belongs to the OTHER side. An exchange resolves on the client that clicked the defense, which often doesn't own the opponent's gear (a player blocking an NPC's club); such updates are relayed to the active GM through a user query.
 * @returns {Promise<boolean>} whether the update was applied
 */
export const updateCombatItem = (item, changes) => doOrAskGM(item, () => item.update(changes), QUERIES.updateCombatItem, { uuid: item.uuid, changes });

/** GM-side handler for updateCombatItem. Deliberately narrow: only weapon/armor items, and only the fields combat wears or breaks: broken and quality. */
async function handleUpdateCombatItem({ uuid, changes } = {}) {
  const item = await documentFor(uuid, document => document instanceof Item && ["weapon", "armor"].includes(document.type));
  const allowed = allowedCombatChanges(changes);
  if (!Object.keys(allowed).length) throw new Error(game.i18n.localize("SCARMARK.CombatAuto.nothingToUpdate"));
  await item.update(allowed);
  return true;
}

/** Spend one charge of an on-hit effect (a poisoned blade): one fewer, and the effect goes when none are left. An effect with no limit is left alone. */
async function spendCharge(effect) {
  const left = chargesAfterHit(effect.getFlag(FLAGS.scope, FLAGS.charges));
  if (left === null) return;
  if (left <= 0) await effect.delete();
  else await effect.setFlag(FLAGS.scope, FLAGS.charges, left);
}

/**
 * Spend one charge of an on-hit effect on a weapon, even when the weapon belongs to the OTHER side (see updateCombatItem): relayed to the active GM when this user does not own it.
 * @returns {Promise<boolean>} whether the charge was spent
 */
export const spendOnHitCharge = (effect) => doOrAskGM(effect, () => spendCharge(effect), QUERIES.spendOnHitCharge, { uuid: effect.uuid });

/** GM-side handler for spendOnHitCharge. Narrow: only an on-hit effect of a weapon. */
async function handleSpendOnHitCharge({ uuid } = {}) {
  const effect = await documentFor(uuid, document => document instanceof ActiveEffect && ON_HIT_ITEM_TYPES.includes(document.parent?.type) && document.getFlag(FLAGS.scope, FLAGS.onHit) === true);
  await spendCharge(effect);
  return true;
}

/** GM-side handler for the "once" mark of a region behavior (helpers/region-triggers.mjs). Narrow: only a behavior of the system, and only its `spent` field. */
async function handleSpendRegionBehavior({ uuid } = {}) {
  const behavior = await documentFor(uuid, document => document instanceof foundry.documents.RegionBehavior && document.type === REGION_BEHAVIOR_STEP);
  await behavior.update({ "system.spent": true });
  return true;
}

/** GM-side handler for the pause of a region behavior (helpers/region-triggers.mjs): pauses the game for everybody. It takes no data. */
async function handlePauseGame() {
  game.togglePause(true, { broadcast: true });
  return true;
}

/** Register the GM queries (called once at init). */
export function registerScarmarkQueries() {
  CONFIG.queries[QUERIES.updateCombatItem] = handleUpdateCombatItem;
  CONFIG.queries[QUERIES.spendOnHitCharge] = handleSpendOnHitCharge;
  CONFIG.queries[QUERIES.removeEffects] = handleRemoveEffects;
  CONFIG.queries[QUERIES.spendRegionBehavior] = handleSpendRegionBehavior;
  CONFIG.queries[QUERIES.pauseGame] = handlePauseGame;
}
