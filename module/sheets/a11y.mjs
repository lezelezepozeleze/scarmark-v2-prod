/**
 * Keyboard and screen-reader access for the sheets, applied to the rendered HTML instead of edited into ~190 template spots:
 *  - a <label> that wraps nothing gets `for` pointing at the field it sits next to (the next field in its container);
 *  - an action link without an href (`<a data-action>`, the effect and consume icons) or a clickable portrait (`<img data-action>`) becomes a button for assistive tech: role, tabindex, an accessible name, and Enter / Space activate it. The name comes from the title, else from the icon (trash = Delete, portrait = Change image), so icon-only links need no markup change;
 *  - the effect toggle reports its on/off state with aria-pressed (read from its icon);
 *  - a field with no label gets the name of its row as aria-label (a skill level input is announced with the skill's name).
 * Idempotent: safe to call after every render.
 */

const CONTROLS = "input:not([type=hidden]), select, textarea";
const ACTION_LINKS = "a[data-action]:not([href]), img[data-action], a.effect-toggle:not([href]), a.effect-delete:not([href]), a.effect-save:not([href]), a.gear-consume:not([href])";
/** Elements that carry the name of the row a bare field belongs to. */
const ROW_NAME = ".col-name, .skill-name, .effect-name";

const DOCUMENT_POSITION_FOLLOWING = 4;   // Node.DOCUMENT_POSITION_FOLLOWING

let nextId = 0;

/** Give every unlabelled-by-wrapping <label> a `for` that points at its field. */
function linkLabels(root) {
  for (const label of root.querySelectorAll("label:not([for])")) {
    if (label.querySelector(CONTROLS)) continue;                       // it wraps its field already
    const container = label.parentElement;
    if (!container) continue;
    const control = [...container.querySelectorAll(CONTROLS)].find(c => !c.labels?.length && label.compareDocumentPosition(c) & DOCUMENT_POSITION_FOLLOWING);
    if (!control) continue;
    control.id ||= `sm-field-${++nextId}`;
    label.htmlFor = control.id;
  }
}

/** The accessible name of a link or image that has no text of its own, or "" when nothing says what it does. */
function actionName(link) {
  const given = link.getAttribute("title") || link.dataset.tooltip;
  if (given) return given;
  if (link.matches("img")) return game.i18n.localize("SCARMARK.ChangeImage");
  if (link.querySelector(".fa-trash")) return game.i18n.localize("SCARMARK.Delete");
  return "";
}

/** Make the action links reachable and described. */
function markActionLinks(root) {
  for (const link of root.querySelectorAll(ACTION_LINKS)) {
    link.setAttribute("role", "button");
    if (!link.hasAttribute("tabindex")) link.tabIndex = 0;
    // An image has alt text (the document name), but that names the picture, not the action.
    if ((link.matches("img") || !link.textContent.trim()) && !link.hasAttribute("aria-label")) {
      const name = actionName(link);
      if (name) link.setAttribute("aria-label", name);
    }
  }
  for (const toggle of root.querySelectorAll("a.effect-toggle")) {
    toggle.setAttribute("aria-pressed", String(!!toggle.querySelector(".fa-toggle-on")));
  }
}

/** Name every field that has neither a label nor a name of its own after the row it sits in. */
function nameBareFields(root) {
  for (const field of root.querySelectorAll(CONTROLS)) {
    if (field.labels?.length || field.hasAttribute("aria-label") || field.hasAttribute("aria-labelledby")) continue;
    const name = field.getAttribute("title") || field.closest("[data-item-id], [data-effect-id]")?.querySelector(ROW_NAME)?.textContent.trim();
    if (name) field.setAttribute("aria-label", name);
  }
}

/** Enter and Space click a focused button-like link (wire once per sheet root). */
export function wireButtonKeys(root) {
  root.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const link = event.target.closest?.('[role="button"]');
    if (!link || event.target !== link) return;
    event.preventDefault();
    link.click();
  });
}

/** Apply the label links and the button roles to a rendered sheet. */
export function enhanceAccessibility(root) {
  linkLabels(root);
  markActionLinks(root);
  nameBareFields(root);
}
