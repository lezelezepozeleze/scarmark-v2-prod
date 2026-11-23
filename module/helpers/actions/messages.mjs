/** The "send message" actions: a text posted to the chat in the card of the item. */
import { ACTION_RESULTS, ACTION_TRIGGERS } from "../../config/index.mjs";
import { isMessageAction } from "../../rules/index.mjs";
import { addCard, forEachAction, DONE, SKIPPED } from "./shared.mjs";

/**
 * Post the "send message" actions of `item` that fire on `trigger` as a card: "<actor> used <item>. <message>". `{character}` in the text is the name of the character the actions act as ("Watch your step, {character}!").
 *
 * @param {object} context the run: { item, trigger, run }
 * @returns {Promise<number>} how many were added
 */
export function runMessageActions({ item, trigger, run }) {
  return forEachAction({ item, trigger, run }, isMessageAction, async (action, actor) => {
    const { verb, plain } = ACTION_TRIGGERS[trigger] ?? {};
    if (!verb && !plain) return SKIPPED;   // a trigger with no moment to speak at (owned)
    addCard(run, ACTION_RESULTS.message, { message: action.message.trim().replaceAll("{character}", actor.name) });
    return DONE;
  });
}
