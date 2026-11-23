/** The "alter" actions: change a weapon or armor piece of the character with an alteration (repair it, rewrite its values once, or put a modifier on it). Which item gets it is asked in a dialog (helpers/alterations.mjs). */
import { ACTION_RESULTS, ALTERABLE_ITEM_TYPES, ALTERATION_REPAIR } from "../../config/index.mjs";
import { FLAGS, ALTERATION_PACKS } from "../../constants.mjs";
import { isAlterAction, armorRepairProblem, repairedArmor, weaponRepairProblem, repairedWeapon, isTimedDuration, isImmediateEffect, withEffectFlag } from "../../rules/index.mjs";
import { stampEffectData, currentWorldTime } from "../effect-library.mjs";
import { rewriteDocument } from "../rewrite.mjs";
import { pickItemToAlter } from "../alterations.mjs";
import { mergedEntries } from "../packs.mjs";
import { addCard, forEachAction, refuse, DONE, SKIPPED } from "./shared.mjs";
import { resolveEntry } from "./entries.mjs";

/** Why a repair was refused: problem key -> lang key ({target}). */
const REPAIR_PROBLEM_MESSAGE = {
  natural: "SCARMARK.Action.noArmorWear",
  naturalWeapon: "SCARMARK.Action.noWeaponWear",
  intact: "SCARMARK.Action.nothingToRepair"
};

/** Repair an item: an armor piece has its durability put back to its original, a weapon is no longer broken (rules/armor-care.mjs); the temporary modifiers of earlier alterations are removed (permanent ones stay). Returns DONE, or REFUSED (the user is told why). */
async function repairItem(target) {
  const armor = target.type === "armor";
  const stored = target._source.system;
  const problem = armor ? armorRepairProblem(stored) : weaponRepairProblem(stored);
  if (problem) return refuse(REPAIR_PROBLEM_MESSAGE[problem], { target: target.name });
  await target.update(armor ? { "system.quality": repairedArmor(stored).quality } : { "system.broken": repairedWeapon().broken });
  const temporary = target.effects.filter(effect => effect.getFlag(FLAGS.scope, FLAGS.improvedBy) && isTimedDuration(effect._source.duration)).map(effect => effect.id);
  if (temporary.length) await target.deleteEmbeddedDocuments("ActiveEffect", temporary);
  return DONE;
}

/** Apply an immediate alteration to an item: its changes rewrite the stored values of the item once (nothing is put on the item). Returns DONE, or REFUSED when nothing was written. */
async function rewriteItem(target, entry) {
  const written = await rewriteDocument(target, entry.toObject());
  return written > 0 ? DONE : refuse("SCARMARK.Action.alterNothingChanged", { target: target.name, effect: entry.name });
}

/** Put an alteration (an effect of an alteration compendium) on an item as a modifier, timed if the effect has a duration. The copy remembers its compendium entry, and one entry cannot alter an item twice. Returns DONE, or REFUSED when the item has it already. */
async function alterItem(item, target, entry) {
  if (target.effects.some(existing => existing.getFlag(FLAGS.scope, FLAGS.improvedBy) === entry.uuid)) {
    return refuse("SCARMARK.Action.alreadyHasEffect", { target: target.name, effect: entry.name });
  }
  const data = withEffectFlag(stampEffectData(entry.toObject(), { now: currentWorldTime(), origin: item.uuid }), FLAGS.improvedBy, entry.uuid);
  data.transfer = false;
  delete data.flags[FLAGS.scope][FLAGS.alteration];
  await target.createEmbeddedDocuments("ActiveEffect", [data]);
  return DONE;
}

/**
 * Do the "alter" actions of `item` that fire on `trigger`: each names a kind of item (weapon or armor) and an alteration of that kind; the player picks which of the character's items of that kind gets it (a dialog), and a card says what was done ("<actor> used <item> on <target>. <target> is now <effect>."). Problems are reported to the user and the action is skipped.
 *
 * @param {object} context the run: { item, trigger, run }
 * @returns {Promise<number>} how many items were altered
 */
export function runAlterActions({ item, trigger, run }) {
  return forEachAction({ item, trigger, run }, isAlterAction, async (action, owner) => {
    if (!ALTERABLE_ITEM_TYPES.includes(action.targetItem)) return refuse("SCARMARK.Action.alterKindMissing", { item: item.name });
    const entry = await resolveEntry(item, action, action.alteration, () => mergedEntries(ALTERATION_PACKS[action.targetItem]));
    if (!entry) return refuse("SCARMARK.Action.alterationMissing", { item: item.name });
    const target = await pickItemToAlter(owner, action.targetItem, entry.name);
    if (!target) return SKIPPED;   // the dialog was closed, or pickItemToAlter told the user why there is no item
    const repairing = entry.getFlag(FLAGS.scope, FLAGS.alteration) === ALTERATION_REPAIR;
    const immediate = isImmediateEffect(entry);
    const outcome = await (repairing ? repairItem(target) : immediate ? rewriteItem(target, entry) : alterItem(item, target, entry));
    if (outcome !== DONE) return outcome;
    addCard(run, repairing ? ACTION_RESULTS.repaired : (immediate ? ACTION_RESULTS.immediate : ACTION_RESULTS.altered), { target: target.name, effect: entry.name }, target.name);
    return DONE;
  });
}
