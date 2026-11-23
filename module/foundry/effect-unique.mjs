/**
 * Unique effects: an effect with its unique box ticked (FLAGS.unique) cannot be added when the same effect is already on the same item or actor (rules/effect-unique.mjs). The check runs on the client that adds the effect, before it is created.
 */
import { uniqueConflict } from "../rules/index.mjs";
import { warn } from "../helpers/notify.mjs";

/** preCreateActiveEffect: refuse a second copy of a unique effect on the document that would hold it. Returns false to stop the creation. */
function refuseDuplicate(effect, data) {
  const parent = effect.parent;
  if (!parent?.effects) return true;
  const conflict = uniqueConflict(parent.effects.map(existing => existing.toObject()), { ...data, name: data.name ?? effect.name });
  if (!conflict) return true;
  warn("SCARMARK.Effect.alreadyThere", { target: parent.name, effect: conflict.name });
  return false;
}

/** Hook the check into effect creation (called when the module loads). */
export function registerEffectUnique() {
  Hooks.on("preCreateActiveEffect", refuseDuplicate);
}
