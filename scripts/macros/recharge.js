/**
 * Scarmark — Recharge (requires Scarmark 1.0.42-beta or later)
 * HOW TO USE: reload the updated world, paste this entire file into a Script
 * macro, select one owned token (or use your assigned character), and Execute.
 * Choose Will, Spirit or Both; OK restores the selected stored capacities to
 * effective Will/Spirit, including current effects and penalties.
 * Confirm eight hours of rest at the table before restoring Will. This macro
 * does not advance time, remove Fatigue, or implement the Charge spell.
 */
(async () => {
  if (!game.scarmark?.rechargeCapacity) return ui.notifications.warn("Update Scarmark to 1.0.42-beta and reload the world (F5).");
  await game.scarmark.rechargeCapacity();
})();
