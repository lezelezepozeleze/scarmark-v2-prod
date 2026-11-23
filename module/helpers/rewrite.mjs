/** Immediate effects at work: rewrite the stored values of a character, weapon or armor piece once (rules/rewrite.mjs says what), instead of putting an effect in Effects. */
import { changeOf, itemModsOf, rewriteTarget, rewrittenValues, rewrittenItem } from "../rules/index.mjs";
import { ALTERABLE_ITEM_TYPES } from "../config/index.mjs";
import { warn } from "./notify.mjs";

/** The changes of effect data that the rules understand (add and set with a number). */
const changesOf = (data) => (data.system?.changes ?? data.changes ?? []).map(changeOf).filter(Boolean);

/** Rewrite the stored attributes, fatigue and skill levels of a character. A key that is not a stored value is reported and skipped. Returns how many values were written. */
async function rewriteActor(actor, changes) {
  const actorValues = {};
  const skillValues = new Map();
  for (const change of changes) {
    const target = rewriteTarget(change.key);
    if (!target) {
      warn("SCARMARK.Effect.cannotRewrite", { key: change.key });
    } else if (target.kind === "actor") {
      actorValues[change.key] = foundry.utils.getProperty(actor._source, change.key) ?? 0;
    } else {
      const skill = actor.items.find(item => item.type === "skill" && item.name.toLowerCase() === target.name.toLowerCase());
      if (skill) skillValues.set(change.key, skill);
      else warn("SCARMARK.Action.noSkill", { actor: actor.name, skill: target.name });
    }
  }
  const update = rewrittenValues(actorValues, changes);
  if (Object.keys(update).length) await actor.update(update);
  const levels = rewrittenValues(Object.fromEntries([...skillValues].map(([key, skill]) => [key, skill._source.system.level ?? 0])), changes);
  for (const [key, skill] of skillValues) await skill.update({ "system.level": levels[key] });
  return Object.keys(update).length + skillValues.size;
}

/**
 * Apply an immediate effect to a document: rewrite its stored values. A character is rewritten for attributes, fatigue and skill levels; a weapon or armor piece for the stats of its modifiers. Returns how many values were written (0 when the effect had nothing it could rewrite there).
 *
 * @param {Actor|Item} document the character, weapon or armor piece
 * @param {object} data the effect data (its changes, add or set)
 */
export async function rewriteDocument(document, data) {
  const changes = changesOf(data);
  if (document.documentName === "Actor") return rewriteActor(document, changes);
  if (!ALTERABLE_ITEM_TYPES.includes(document.type)) return 0;
  const update = rewrittenItem(document.type, document._source.system, itemModsOf([{ system: { changes } }]));
  if (Object.keys(update).length) await document.update(update);
  return Object.keys(update).length;
}
