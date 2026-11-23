/**
 * Delete expired timed Active Effects. Foundry stops applying an expired effect (bonus drops) but never removes it, so it lingers in the Effects tab.
 *
 * Expiry is computed from the RAW source (`_source.start.time` + duration), NOT from Foundry's prepared `duration.remaining` - the latter needs `game.time.calendar` (which Simple Calendar doesn't set), so it reads "Unknown"/null. This way expiry works under any time module.
 */
import { FLAGS } from "../constants.mjs";
import { durationSeconds, effectFlags } from "../rules/index.mjs";

/** Has this effect run out at this world time? Permanent effects and combat (rounds/turns) durations are left to Foundry. */
export function scarmarkEffectExpired(effect, worldTime) {
  const stamp = effectFlags(effect)[FLAGS.expireWorldTime];
  if (Number.isFinite(stamp)) return stamp <= worldTime;                 // Consume stamp
  const src = effect._source ?? {};
  const start = src.start?.time;
  const seconds = durationSeconds(src.duration);
  if (Number.isFinite(start) && seconds !== null) return (start + seconds) <= worldTime;
  return false;
}

/** Delete the expired timed effects of every actor and item (only on the active GM's client). */
function sweepScarmarkEffects() {
  if (game.users.activeGM?.id !== game.user.id || !game.time) return;   // only the active GM sweeps (two GMs would delete the same effects)
  let worldTime;
  try { worldTime = game.time.worldTime; } catch { return; }
  // World actors PLUS the unlinked token actors of every scene - an unlinked token's effects live on its own synthetic actor, not on a game.actors entry. (The ones on other scenes need their scene's token documents; the canvas only holds the viewed scene.)
  const actors = new Set(game.actors);
  for (const scene of game.scenes) for (const token of scene.tokens) if (!token.actorLink && token.actor) actors.add(token.actor);
  for (const token of canvas.tokens?.placeables ?? []) if (token.actor) actors.add(token.actor);
  // The effects of actors, and the ones on their items and on world items (timed modifiers of a weapon or armor).
  const holders = new Set(actors);
  for (const actor of actors) for (const item of actor.items) holders.add(item);
  for (const item of game.items) holders.add(item);
  for (const holder of holders) {
    const expired = holder.effects.filter(e => scarmarkEffectExpired(e, worldTime)).map(e => e.id);
    if (expired.length) holder.deleteEmbeddedDocuments("ActiveEffect", expired).catch(err =>
      console.warn("Scarmark | effect-expiry delete failed", err));
  }
}

// Debounced so overlapping triggers (updateWorldTime + Simple Calendar's hook, or SmallTime's animation ticks) collapse into ONE sweep - otherwise two sweeps both try to delete the same effect and the second errors "does not exist".
let debouncedSweep = null;

/** Sweep on every core world-time change (called when the module loads). */
export function registerEffectExpiry() {
  debouncedSweep = foundry.utils.debounce(sweepScarmarkEffects, 250);
  Hooks.on("updateWorldTime", debouncedSweep);
}

/** The ready hook: also sweep on Simple Calendar's own date change (not every calendar drives updateWorldTime), and once now in case effects expired while nothing was firing. */
export function startEffectExpiry() {
  const scHook = globalThis.SimpleCalendar?.Hooks?.DateTimeChange;
  if (scHook && debouncedSweep) Hooks.on(scHook, debouncedSweep);
  sweepScarmarkEffects();
}
