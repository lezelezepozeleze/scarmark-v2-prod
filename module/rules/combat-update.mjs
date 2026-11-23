/** What a client may change of a combat item that is not its own: the GM does it for them (helpers/combat/gm-update.mjs), and only these fields, cleaned. Pure. */

/**
 * The changes the GM-side handler accepts: `system.broken` (as a boolean), and `system.quality` (a whole number). Anything else is dropped.
 *
 * @param {object} [changes] the update the client asked for
 * @returns {object} the changes to apply, empty when nothing is allowed
 */
export function allowedCombatChanges(changes) {
  const allowed = {};
  if ("system.broken" in (changes ?? {})) allowed["system.broken"] = !!changes["system.broken"];
  if ("system.quality" in (changes ?? {})) {
    const quality = Math.trunc(Number(changes["system.quality"]));
    if (Number.isFinite(quality)) allowed["system.quality"] = quality;
  }
  return allowed;
}
