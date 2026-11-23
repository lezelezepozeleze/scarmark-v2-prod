/** The templates of the Actions panel and of the windows that show the lines of one action. Kept apart so the editor window (action-editor.mjs) and the panel (action-panel.mjs) can both name them without importing each other. */
import { TEMPLATE_DIR } from "../../constants.mjs";

/** The template of the panel (a partial: put it in a sheet with `{{> ... panel=...}}`). It lists the actions by name only. */
export const ACTIONS_PANEL_TEMPLATE = `${TEMPLATE_DIR}common/actions-panel.hbs`;

/** The template of the lines of one action (a partial of the editor window, and the whole body of an action entry sheet). */
export const ACTION_FIELDS_TEMPLATE = `${TEMPLATE_DIR}common/action-fields.hbs`;

/** What the lines of one action need: list them in the `templates` of the sheet part that shows them. */
export const ACTION_FIELDS_TEMPLATES = [ACTION_FIELDS_TEMPLATE, `${TEMPLATE_DIR}common/roll-down.hbs`];

/** The template of the window that edits one action of a panel. */
export const ACTION_EDITOR_TEMPLATE = `${TEMPLATE_DIR}common/action-editor.hbs`;

/** Every template the editor window needs. */
export const ACTION_EDITOR_TEMPLATES = [ACTION_EDITOR_TEMPLATE, ...ACTION_FIELDS_TEMPLATES];

/** Every template the panel needs: list them all in the `templates` of the sheet part that includes the panel. The panel only lists names, so it is the one template. */
export const ACTIONS_PANEL_TEMPLATES = [ACTIONS_PANEL_TEMPLATE];
