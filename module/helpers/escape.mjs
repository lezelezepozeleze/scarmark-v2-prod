/**
 * The one HTML escape for Scarmark chat cards, dialogs and attributes.
 *
 * Document and user text (actor, item, skill and injury names, notes) must go
 * through esc() before it is placed into a template string that becomes HTML.
 * null and undefined become "". Do NOT escape text that is stored in a document
 * (for example an injury's name): escape only where it is rendered as HTML.
 *
 * Handlebars.escapeExpression escapes & < > " ' ` and =, so the result is also
 * safe inside a single- or double-quoted attribute.
 */
export const esc = (value) => Handlebars.escapeExpression(value ?? "");

/**
 * Escape for the value of a single-quoted attribute that holds JSON
 * (data-combat='...', data-addwound='...'). Only & and ' need escaping there,
 * and the markup stays identical to what older chat messages already contain.
 */
export const escAttr = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/'/g, "&#39;");
