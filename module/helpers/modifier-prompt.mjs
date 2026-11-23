/** The "Modifier" number field that most roll dialogs end with, and the one-field modifier prompt. Owns the markup of that field so every dialog reads it the same way. */
import { fieldNumber } from "./form-fields.mjs";

/**
 * HTML of the modifier form group (a number input named "modifier", starting at 0).
 * @param {object} [o]
 * @param {string} [o.label]      Already localized label; defaults to the test modifier label.
 * @param {number} [o.step]       Step of the number input.
 * @param {boolean} [o.autofocus] Focus the field when the dialog opens.
 * @returns {string}
 */
export const modifierField = ({ label = game.i18n.localize("SCARMARK.TestModifier"), step = 1, autofocus = false } = {}) =>
  `<div class="form-group"><label>${label}</label><input type="number" name="modifier" value="0" step="${step}"${autofocus ? " autofocus" : ""} /></div>`;

/** The modifier a dialog form holds: a number, 0 when empty or not a number. */
export const readModifier = (form) => fieldNumber(form, "modifier");

/**
 * Ask for a single situational modifier in a dialog.
 * @param {object} o
 * @param {string} o.title        Window title (plain text, not HTML).
 * @param {string} o.okLabel      Already localized label of the confirm button.
 * @param {string} [o.before]     HTML shown above the field (e.g. a read-only target).
 * @param {string} [o.label]      Label of the field (see modifierField).
 * @param {number} [o.step]       Step of the field.
 * @returns {Promise<number|null>} the modifier, or null when the dialog was closed
 */
export async function promptModifier({ title, okLabel, before = "", label, step }) {
  const result = await foundry.applications.api.DialogV2.prompt({
    window: { title },
    content: `${before}${modifierField({ label, step, autofocus: true })}`,
    ok: { label: okLabel, callback: (event, button) => readModifier(button.form) },
    rejectClose: false
  });
  return result ?? null;
}
