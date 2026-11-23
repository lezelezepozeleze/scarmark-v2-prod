/** The window that edits one action of an Actions panel: its name and the lines of the action. The panel lists the actions by name only (like the Effects tab); a click on the name opens this window, the way an effect opens its sheet. */
import { ACTION_EDITOR_TEMPLATE, ACTION_EDITOR_TEMPLATES } from "./action-templates.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/** The window itself. It knows nothing about where the actions are stored: the panel hands it `prepare` (the row to show, or null when the action is gone) and `save` (the flat form fields to store). */
class ActionEditor extends HandlebarsApplicationMixin(ApplicationV2) {

  static DEFAULT_OPTIONS = {
    tag: "form",
    classes: ["scarmark", "sheet", "action-editor"],
    position: { width: 420, height: "auto" },
    window: { resizable: true, icon: "fa-solid fa-bolt" },
    form: { handler: ActionEditor.#onSubmit, submitOnChange: true, closeOnSubmit: false }
  };

  static PARTS = { body: { template: ACTION_EDITOR_TEMPLATE, templates: ACTION_EDITOR_TEMPLATES } };

  /** @param {{prepare: () => Promise<object|null>, save: (fields: object) => Promise<void>}} callbacks */
  constructor({ prepare, save, ...options }) {
    super(options);
    this.prepare = prepare;
    this.save = save;
    this.row = null;
  }

  /** @override */
  get title() {
    return this.row?.label ?? "";
  }

  /** @override */
  async _prepareContext() {
    this.row = await this.prepare();
    return { row: this.row };
  }

  /** @override An action that was deleted while the window was open: nothing left to edit. */
  _onRender() {
    if (!this.row) this.close();
  }

  /** Store the fields, then draw the window again (the lines follow the kind and the trigger picked). */
  static async #onSubmit(event, form, formData) {
    await this.save(foundry.utils.flattenObject(formData.object));
    this.render();
  }
}

/**
 * Open the window of one action, or bring it to the front when it is open already.
 *
 * @param {object} options
 * @param {foundry.abstract.Document} options.document the document that holds the list
 * @param {string} options.actionId the id of the action (stable when others are deleted, unlike its index)
 * @param {() => Promise<object|null>} options.prepare the row of the action (the panel view model), or null when it is gone
 * @param {(fields: object) => Promise<void>} options.save stores the flat form fields
 */
export function openActionEditor({ document, actionId, prepare, save }) {
  const id = `scarmark-action-${document.uuid}-${actionId}`.replace(/[^\w-]/g, "-");
  const open = foundry.applications.instances.get(id);
  if (open) return open.bringToFront();
  return new ActionEditor({ id, prepare, save }).render({ force: true });
}
