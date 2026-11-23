/** Running the actions of an item: "when <trigger>" it adds an effect, removes an effect, rolls a test, alters an item of the character (weapon or armor, picked in a dialog) or sends a message. Using a usable item sets off its "used" actions, opening the sheet of an item the character carries its "inspected" ones, consuming a consumable its "consumed" ones (helpers/consume.mjs), and a weapon that wounds its "hit" ones (helpers/combat/strike.mjs). What the actions did is posted at the end as cards, a verb plus a result (cards.mjs postRun), the first card carrying the rolls of the tests; using and consuming always say so in the chat (cards.mjs announce). The parts of a run, one file per kind of action, are in this folder; helpers/item-actions.mjs is the way in. */
import { ACTION_KIND_EFFECT, ACTION_KIND_TEST, ACTION_KIND_ALTER, ACTION_KIND_MESSAGE, ACTION_KIND_REMOVE, ACTION_KIND_MACRO, ACTION_TRIGGER_USED, ACTION_TRIGGER_INSPECTED } from "../../config/index.mjs";
import { actionsFor, unfinishedActions, spendsOnUse } from "../../rules/index.mjs";
import { warn, fail } from "../notify.mjs";
import { ownerOf, newRun } from "./shared.mjs";
import { postRun } from "./cards.mjs";
import { runEffectActions } from "./effects.mjs";
import { runMessageActions } from "./messages.mjs";
import { runRemoveActions } from "./removal.mjs";
import { runAlterActions } from "./alter.mjs";
import { runTestActions } from "./rolls.mjs";
import { runMacroActions } from "./macros.mjs";

/**
 * The function that does the actions of each kind (config/actions.mjs ACTION_KINDS), in the order a run does them: the effects first, so a test is rolled after the effects that change it (the toxicity of a drink), and the macros last, so a macro sees what the rest did. Each takes { item, trigger, run, hit, adjustPlan } and returns how many actions did something.
 */
export const ACTION_RUNNERS = {
  [ACTION_KIND_EFFECT]: runEffectActions,
  [ACTION_KIND_MESSAGE]: runMessageActions,
  [ACTION_KIND_REMOVE]: runRemoveActions,
  [ACTION_KIND_ALTER]: runAlterActions,
  [ACTION_KIND_TEST]: runTestActions,
  [ACTION_KIND_MACRO]: runMacroActions
};

/**
 * Set off the actions of `item` that fire on `trigger`, kind by kind in the order of ACTION_RUNNERS. What happened is posted at the end (postRun): one card per action, the first carrying the rolls; when no action said "<actor> used <item>" that plain line is posted (config/actions.mjs `announces`: used and consumed).
 *
 * @param {object} [options]
 * @param {(plan: object[]) => void} [options.adjustPlan] called with the effects about to be added, before they are (consuming adds the toxicity)
 * @param {Actor} [options.hit] the one a weapon wounded, for the "hit" trigger
 * @param {Actor|null} [options.actor] who the actions act as (default: the actor that carries the item); for an actor that has actions, the one that opened its sheet
 * @returns {Promise<number>} how many things were done
 */
export async function runActions(item, trigger, { adjustPlan, hit = null, actor = ownerOf(item) } = {}) {
  if (unfinishedActions(item.system.actions, trigger).length) warn("SCARMARK.Action.unfinished", { item: item.name });
  const run = newRun(actor);
  let done = 0;
  for (const runner of Object.values(ACTION_RUNNERS)) done += await runner({ item, trigger, run, hit, adjustPlan });
  await postRun(trigger, item, run);
  return done;
}

/** Spend one unit of an item's stack; the last unit removes the item. */
export async function spendOneUnit(item) {
  const quantity = item.system.quantity ?? 1;
  if (quantity > 1) await item.update({ "system.quantity": quantity - 1 });
  else await item.delete();
}

/** Use an item: set off its "when used" actions; the chat says it was used. An item that is used up (honing oil) then loses one unit, if the use did something. */
export async function useItem(item) {
  try {
    const done = await runActions(item, ACTION_TRIGGER_USED);
    if (spendsOnUse(item.system, actionsFor(item.system.actions, ACTION_TRIGGER_USED).length, done)) await spendOneUnit(item);
  } catch (err) {
    fail("use", "SCARMARK.Gear.useFailed", err);
  }
}

/** Who a sheet is opened for: the character that carries the item (when the user owns the item), or, for the sheet of an actor, the character of the user. */
const openerOf = (document) => (document.documentName === "Actor" ? game.user.character : (document.isOwner ? ownerOf(document) : null));

/**
 * The sheet of an item or an actor was opened: set off its "when inspected" actions on the character that opened it (an item carried by a character: that character; an actor such as a chest: the character of the user). Does nothing for the GM, who opens sheets to edit them. A player with no character is told so when the actor has such actions. Called once when the sheet is first rendered.
 */
export async function inspect(document) {
  if (game.user.isGM || !actionsFor(document.system.actions, ACTION_TRIGGER_INSPECTED).length) return;
  const actor = openerOf(document);
  if (!actor) {
    if (document.documentName === "Actor") warn("SCARMARK.Action.noCharacter");
    return;
  }
  try {
    await runActions(document, ACTION_TRIGGER_INSPECTED, { actor });
  } catch (err) {
    console.error("Scarmark | inspect failed", err);
  }
}
