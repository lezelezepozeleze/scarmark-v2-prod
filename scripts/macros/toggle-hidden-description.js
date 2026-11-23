/**
 * Scarmark - Toggle hidden description (Script macro)
 * ---------------------------------------------------
 * A gear item stores a description that its sheet does not show. This macro switches it on or off for you (a client setting, so other players are not affected): while it is on, the Description editor of every gear item sheet appears under the Note. Off by default; run the macro again to hide it.
 *
 * HOW TO USE: create a Script macro, paste this in, execute. Open sheets update at once.
 */
(async () => {
  const SCOPE = "scarmark";
  const KEY = "showHiddenDescription";
  if ( !game.settings.settings.has(`${SCOPE}.${KEY}`) ) return ui.notifications.warn("Toggle hidden description: update Scarmark and reload the world (F5).");
  const show = !game.settings.get(SCOPE, KEY);
  await game.settings.set(SCOPE, KEY, show);
  ui.notifications.info(show ? "Hidden description: shown under the Note of gear items." : "Hidden description: hidden again.");
})();
