/** Which tokens set a region behavior off, and whether a "once" behavior is used up. Pure. */
import { REGION_WHO, REGION_ONCE } from "../config/index.mjs";

/**
 * Whether the actor of a token is one the behavior is for.
 *
 * @param {string} who a key of REGION_WHO
 * @param {{type: string, hasPlayerOwner?: boolean}} actor
 */
export function whoMatches(who, actor) {
  const rule = REGION_WHO[who];
  if (!rule) return false;
  if (rule.owner === "player" && !actor.hasPlayerOwner) return false;
  if (rule.owner === "none" && actor.hasPlayerOwner) return false;
  return !rule.types || rule.types.includes(actor.type);
}

/** Whether a behavior has been set off already and is only for once. */
export const isSpent = (frequency, spent) => frequency === REGION_ONCE && Boolean(spent);
