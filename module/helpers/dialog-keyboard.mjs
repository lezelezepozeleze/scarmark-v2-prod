/**
 * Keyboard control of dialogs: the arrow keys move between the buttons and items of the dialog, the focus follows the mouse, and a new dialog focuses its first control (the Cancel button when the dialog is destructive, the first item of the combat helper).
 * Fields that use the arrow keys themselves (selects, text inputs, lists, menus) are left alone.
 */
import { DIALOG_FOCUS_DELAY_MS } from "../config/index.mjs";

/** CSS selector of a dialog window (also used by maneuvers.mjs to find the dialog a roll opens). */
export const DIALOG_SELECTOR = ".application.dialog,.application.dialog-v2,.window-app.dialog,[role=dialog]";
const FOCUSABLE_SELECTOR = "button:not(:disabled),a[href],[role=button][tabindex],input:not(:disabled):not([type=hidden]),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex='-1'])";
const NATIVE_NAVIGATION_SELECTOR = "select,textarea,[contenteditable],[role=combobox],[role=listbox],[role=menu],[role=grid],[role=tree],[role=tablist],input:not([type=button]):not([type=submit]):not([type=reset])";
const DESTRUCTIVE_SELECTOR = "[data-action=delete],[data-action=all],[data-action=remove]";

/** Is the element shown (laid out, not hidden by CSS or an inert/aria-hidden ancestor)? */
const visible = (element) => element instanceof HTMLElement
  && element.getClientRects().length > 0
  && getComputedStyle(element).visibility !== "hidden"
  && !element.closest("[hidden],[inert],[aria-hidden=true]");

/** The visible controls of a dialog, in document order. */
const controls = (root) => [...root.querySelectorAll(FOCUSABLE_SELECTOR)].filter(visible);

/** Center point [x, y] of an element on screen. */
const center = (element) => {
  const rect = element.getBoundingClientRect();
  return [rect.left + rect.width / 2, rect.top + rect.height / 2];
};

/** The control closest to `active` in the arrow key's direction (the cross-axis distance counts triple), or null. */
function nearest(list, active, key) {
  const [x, y] = center(active);
  const vertical = /Up|Down/.test(key);
  const sign = /Down|Right/.test(key) ? 1 : -1;
  return list
    .filter(element => element !== active)
    .map(element => {
      const [ex, ey] = center(element);
      const main = (vertical ? ey - y : ex - x) * sign;
      return { element, main, score: main + Math.abs(vertical ? ex - x : ey - y) * 3 };
    })
    .filter(candidate => candidate.main > 4)
    .sort((a, b) => a.score - b.score)[0]?.element ?? null;
}

/** From an item of the combat helper grid: sideways to the nearest item of another column, up or down within the column, and past the column's end to the nearest control outside the grid. */
function moveFromGridItem(grid, items, group, list, active, key) {
  const vertical = /Up|Down/.test(key);
  const down = key === "ArrowDown";
  if (!vertical) return nearest(items.filter(element => !group.contains(element)), active, key);

  const column = items.filter(element => group.contains(element));
  const next = column[column.indexOf(active) + (down ? 1 : -1)];
  if (next) return next;

  // Past the end of the column: the nearest control outside the grid in that direction.
  const rect = grid.getBoundingClientRect();
  return list
    .filter(element => !grid.contains(element))
    .filter(element => {
      const box = element.getBoundingClientRect();
      return down ? box.top >= rect.bottom - 2 : box.bottom <= rect.top + 2;
    })
    .sort((a, b) => (center(a)[1] - center(b)[1]) * (down ? 1 : -1))[0] ?? null;
}

/** Is the grid in the direction of the vertical arrow key from `active` (a control above it for Down, below it for Up)? */
function gridInDirection(grid, active, key) {
  const rect = grid.getBoundingClientRect();
  const box = active.getBoundingClientRect();
  return key === "ArrowDown" ? box.bottom <= rect.top + 2 : box.top >= rect.bottom - 2;
}

/** Entering the grid from above or below: the end item of the column nearest to the active control. */
function enterGrid(grid, items, active, key) {
  const down = key === "ArrowDown";
  return [...grid.querySelectorAll(".smch-group")]
    .map(column => {
      const buttons = items.filter(element => column.contains(element));
      return down ? buttons[0] : buttons.at(-1);
    })
    .filter(Boolean)
    .sort((a, b) => Math.abs(center(a)[0] - center(active)[0]) - Math.abs(center(b)[0] - center(active)[0]))[0] ?? null;
}

/** The control an arrow key moves to from `active`, with the combat helper's columns of items handled as a grid. */
function move(root, active, key) {
  const list = controls(root);
  if (!list.length) return null;
  if (!list.includes(active)) return list[0];

  const grid = root.querySelector(".smch");
  const group = active.closest(".smch-group");
  const vertical = /Up|Down/.test(key);

  if (grid) {
    const items = [...grid.querySelectorAll(".smch-item")].filter(visible);
    if (group && items.includes(active)) return moveFromGridItem(grid, items, group, list, active, key);
    if (vertical && !grid.contains(active) && gridInDirection(grid, active, key)) return enterGrid(grid, items, active, key);
  }
  return moveFree(list, active, key);
}

/** Outside the grid logic: vertical moves stay in the same column of controls, sideways moves go to the nearest control. */
function moveFree(list, active, key) {
  if (/Up|Down/.test(key)) {
    const x = center(active)[0];
    const width = active.getBoundingClientRect().width;
    return nearest(
      list.filter(element => Math.abs(center(element)[0] - x) < Math.max(24, Math.min(width, element.getBoundingClientRect().width) / 2)),
      active,
      key
    );
  }
  return nearest(list, active, key);
}

/** Focus the right control of a new dialog: Cancel when another button deletes, the first combat helper item, else the autofocus or first control. */
function focusFirst(root) {
  if (!visible(root)) return;
  const list = controls(root);
  const active = document.activeElement;
  const destructive = list.some(element => element.matches(DESTRUCTIVE_SELECTOR));
  const next = (destructive && list.find(element => element.matches("[data-action=cancel]")))
    || (root.querySelector(".smch") && !active?.matches?.(".smch-item") && list.find(element => element.matches(".smch-item")))
    || (!root.contains(active) && (list.find(element => element.autofocus) || list[0]));
  next?.focus({ preventScroll: true });
}

/** Focus the right control once the dialog has settled (a short delay after it renders). */
const focusLater = (root) => setTimeout(() => { if (root.isConnected) focusFirst(root); }, DIALOG_FOCUS_DELAY_MS);

let registered = false;

/** Set up the dialog keyboard once (the ready hook). */
export function registerDialogKeyboard() {
  if (registered) return;
  registered = true;

  Hooks.on("renderApplicationV2", (app) => {
    const root = app?.element;
    if (root instanceof HTMLElement && root.matches(DIALOG_SELECTOR)) focusLater(root);
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey
      || !/^Arrow(Up|Down|Left|Right)$/.test(event.key) || !(event.target instanceof Element)
    ) return;

    const root = event.target.closest(DIALOG_SELECTOR) ?? [...document.querySelectorAll(DIALOG_SELECTOR)].filter(visible).at(-1);
    if (!root || event.target.closest(NATIVE_NAVIGATION_SELECTOR)) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    const next = move(root, document.activeElement, event.key);
    if (!next) return;
    next.focus({ preventScroll: true });
    next.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, true);

  let mouseX;
  let mouseY;
  document.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" || event.buttons || (event.clientX === mouseX && event.clientY === mouseY)) return;
    mouseX = event.clientX;
    mouseY = event.clientY;
    const target = document.elementFromPoint(mouseX, mouseY);
    const root = target?.closest(DIALOG_SELECTOR);
    const button = target?.closest("button,a[href],[role=button]");
    if (root && button && controls(root).includes(button) && button !== document.activeElement) button.focus({ preventScroll: true });
  }, true);

  for (const root of document.querySelectorAll(DIALOG_SELECTOR)) focusLater(root);
}
