/** The "run macro" actions: run a macro as the character that acts. */
import { isMacroAction } from "../../rules/index.mjs";
import { listMacros } from "../macros.mjs";
import { forEachAction, refuse, DONE } from "./shared.mjs";
import { resolveEntry } from "./entries.mjs";

/**
 * Run the macro actions of `item` that fire on `trigger`. The macro gets what a macro of Foundry gets (`actor`, `speaker`) and `item`, the document that has the action (an item, a chest). A macro the user may not run, or one that is gone, is reported.
 *
 * @param {object} context the run: { item, trigger, run }
 * @returns {Promise<number>} how many macros were run
 */
export function runMacroActions({ item, trigger, run }) {
  return forEachAction({ item, trigger, run }, isMacroAction, async (action, actor) => {
    const macro = await resolveEntry(item, action, action.macro, async () => (await listMacros()).flatMap(group => group.entries));
    if (!macro) return refuse("SCARMARK.Action.macroMissing", { item: item.name });
    if (macro.canUserExecute?.(game.user) === false) return refuse("SCARMARK.Action.macroNotAllowed", { macro: macro.name });
    await macro.execute({ actor, speaker: ChatMessage.getSpeaker({ actor }), item });
    return DONE;
  });
}
