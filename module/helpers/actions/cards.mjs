/** The chat cards of the actions: a verb plus a result ("<actor> used <item> on <target>. <target> is now <effect>."), posted at the end of a run. view/action-card.mjs puts the sentence together, config/actions.mjs has the verb of each trigger. */
import { ACTION_TRIGGERS } from "../../config/index.mjs";
import { actionCardText } from "../../view/action-card.mjs";
import { sayText } from "../chat.mjs";
import { ownerOf } from "./shared.mjs";

/**
 * Post one chat card of an action: "<actor> used <item>[ on <target>]. <result>". Every action that does something has one, so the chat always says what was used and what it did.
 *
 * @param {string} trigger the trigger that set the action off
 * @param {Item} item the item used
 * @param {Actor} actor who speaks: the character that has the item
 * @param {object} [options]
 * @param {string} [options.result] one of ACTION_RESULTS; without it the card is only the verb ("Mara used Whetstone.")
 * @param {object} [options.data] the values of the result ({ target, effect, message })
 * @param {string|null} [options.on] the name of the one the item is used on ("used Whetstone on Knife")
 * @param {{html: string, rolls: Roll[]}|null} [options.extras] what goes under the line: the rolls of the tests of the run, with their dice
 */
function postCard(trigger, item, actor, { result = "", data = {}, on = null, extras = null } = {}) {
  const { verb, plain } = ACTION_TRIGGERS[trigger] ?? {};
  if (!verb && !plain) return undefined;
  return sayText(actor, actionCardText((key, values) => game.i18n.format(key, values), { verb, actor: actor.name, item: item.name, on }, result, data), extras ?? undefined);
}

/** The plain chat line of using or consuming an item, "<actor> used <item>.", for a trigger that announces itself (inspecting says nothing). */
export function announce(item, trigger) {
  const actor = ownerOf(item);
  return ACTION_TRIGGERS[trigger]?.announces && actor ? postCard(trigger, item, actor) : undefined;
}

/** Post what a run has to say: its cards in order, the first one carrying the tests. A run whose actions said nothing still says "<actor> used <item>." when the trigger announces itself or a test was rolled. */
export async function postRun(trigger, item, run) {
  const actor = run.actor;
  if (!actor) return;
  const cards = run.cards.length ? run.cards : (ACTION_TRIGGERS[trigger]?.announces || run.blocks ? [{}] : []);
  for (const [index, card] of cards.entries()) await postCard(trigger, item, actor, { ...card, extras: index === 0 ? { html: run.blocks, rolls: run.rolls } : null });
}
