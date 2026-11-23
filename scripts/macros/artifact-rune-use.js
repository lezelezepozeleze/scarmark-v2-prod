/**
 * Scarmark — Artifact/Rune Use (requires Scarmark 1.0.42-beta or later)
 * HOW TO USE: reload the updated world, paste this entire file into a Script
 * macro, select one owned token (or use your assigned character), and Execute.
 * Choose a carried, attuned artifact/rune and confirm with OK.
 * Spends Class from Will Capacity for artifacts or Spirit Capacity for runes.
 * Rune takes precedence if both flags are checked. Insufficient capacity blocks
 * use. This records a use only; resolve attacks and magical effects separately.
 */
(async () => {
  if (!game.scarmark?.artifactRuneUse) return ui.notifications.warn("Update Scarmark to 1.0.42-beta and reload the world (F5).");
  await game.scarmark.artifactRuneUse();
})();
