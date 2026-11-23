/** Consuming an item: its Active Effects (plus its toxicity) go onto the actor with their countdown started, and one unit is spent. */
import { TOXICITY_SKILL, SKILL_MOD_KEY_PREFIX, ACTION_TRIGGER_CONSUMED, ACTION_TARGET_SELF } from "../config/index.mjs";
import { durationSeconds, isImmediateEffect } from "../rules/index.mjs";
import { stampEffectData, currentWorldTime, applyEffect } from "./effect-library.mjs";
import { runActions, announce, spendOneUnit } from "./item-actions.mjs";
import { warn, fail } from "./notify.mjs";

/**
 * Add the Vitality penalty of a toxicity to the effects that are about to be applied: it goes into the longest-lasting ongoing effect, so it ends with it (an immediate effect rewrites values and never carries it). An item with no ongoing effect gets a permanent one of its own, added to the end. Returns the same array (mutated) when the penalty joined an effect, a new one with the extra effect added, or the array as given when there is no toxicity.
 *
 * @param {object[]} effects effect data (stamped copies, safe to change)
 * @param {{toxicity: number, name: string, img: string, uuid: string}} item the consumed item
 */
export function withToxicity(effects, { toxicity, name, img, uuid }) {
  if (!(toxicity > 0)) return effects;
  const change = { key: `${SKILL_MOD_KEY_PREFIX}${TOXICITY_SKILL}`, type: "add", value: -toxicity, priority: 20, phase: "initial" };
  const ongoing = effects.filter(effect => !isImmediateEffect(effect));
  if (!ongoing.length) return [...effects, { name, img, disabled: false, transfer: false, origin: uuid, system: { changes: [change] } }];
  const seconds = (effect) => durationSeconds(effect.duration) ?? 0;
  const lasting = ongoing.reduce((best, e) => (seconds(e) > seconds(best) ? e : best), ongoing[0]);
  lasting.system = { ...(lasting.system ?? {}), changes: [...(lasting.system?.changes ?? []), change] };
  return effects;
}

/**
 * Add the toxicity to what the item's "consumed" actions are about to put on the consumer: into the longest-lasting effect that lands on the consumer (see withToxicity), or, when no action puts one there, as an effect of its own (permanent, no card). It is in the plan, so it is on before the tests of the actions roll.
 */
function addToxicity(plan, actor, info) {
  const own = plan.filter(entry => entry.on === ACTION_TARGET_SELF).map(entry => entry.data);
  const extra = withToxicity(own, info).slice(own.length)[0];
  if (extra) plan.push({ on: ACTION_TARGET_SELF, data: extra, targets: [actor], silent: true });
}

/**
 * Consume one unit of a consumable, and say so in the chat ("<actor> consumed <item>."). An item with actions is consumed by them (only its "consumed" ones fire, see runActions); an older consumable with none puts all its effects on the consumer. The unit is spent whatever the actions did; what could not be done is reported. Errors are reported to the user, not thrown.
 */
export async function consumeItem(actor, item) {
  const now = currentWorldTime();
  const info = { toxicity: Number(item.system.toxicity) || 0, name: item.name, img: item.img, uuid: item.uuid };
  const buildEffects = () => withToxicity(item.effects.contents.map(e => stampEffectData(e.toObject(), { now, origin: item.uuid })), info);
  try {
    if ((item.system.actions?.length ?? 0) > 0) {
      await runActions(item, ACTION_TRIGGER_CONSUMED, { adjustPlan: (plan) => addToxicity(plan, actor, info) });
    } else {
      await applyOwnEffects(actor, buildEffects);
      await announce(item, ACTION_TRIGGER_CONSUMED);
    }
    await spendOneUnit(item);
  } catch (err) {
    fail("consume", "SCARMARK.Gear.consumeFailed", err);
  }
}

/** Put the item's own effects (with the toxicity) on the actor. A time or calendar module can make Foundry's duration processing throw (game.time.worldTime unavailable): then they go on without the timed duration so consuming still works. */
async function applyOwnEffects(actor, buildEffects) {
  const [immediate, ongoing] = [true, false].map(wanted => buildEffects().filter(effect => isImmediateEffect(effect) === wanted));
  for (const effect of immediate) await applyEffect(actor, effect);
  if (!ongoing.length) return;
  try {
    await actor.createEmbeddedDocuments("ActiveEffect", ongoing);
  } catch (durationError) {
    console.warn("Scarmark | effect-duration processing failed; applying without duration", durationError);
    await actor.createEmbeddedDocuments("ActiveEffect", buildEffects().filter(effect => !isImmediateEffect(effect)).map(effect => { delete effect.duration; return effect; }));
    warn("SCARMARK.Gear.consumedNoDuration");
  }
}
