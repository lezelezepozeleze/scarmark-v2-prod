/** The notice the helpers give the user: one line, in a toast only they see (a chat card everybody reads is helpers/chat.mjs). */

/** Warn the user: a lang key, formatted with `data` when given. */
export const warn = (key, data) => ui.notifications.warn(data ? game.i18n.format(key, data) : game.i18n.localize(key));

/** An action of the user threw: log it and tell the user in a toast (`key` is a lang key whose {error} is the message of the error). */
export function fail(what, key, error) {
  console.error(`Scarmark | ${what} failed`, error);
  ui.notifications.error(game.i18n.format(key, { error: error.message }));
}
