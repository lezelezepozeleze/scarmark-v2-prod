/**
 * Mouse clicks on the rows of an actor sheet.
 *
 *  - Click an item or effect row: open its sheet. A click counts only if it is a plain primary click: released within 400 ms and 6 px of where it started, not part of a double click, and not on a control (link, button, input, select, textarea, editable text, data-action element). For a stackable item the owner can double click, so the sheet opens 350 ms after the click and a second click cancels it.
 *  - Double click a stackable inventory row: split the stack in two (half, rounded up, stays). It waits 450 ms so a third click can turn it into a merge.
 *  - Triple click a stackable inventory row: merge every identical stack in the same container into this one.
 */
import { isStackable, splitStack, mergeStacks } from "../helpers/inventory.mjs";
import { splitQuantity } from "../rules/index.mjs";
import { CLICK_MAX_MS, CLICK_MAX_PX, OPEN_DELAY_MS, SPLIT_DELAY_MS } from "../config/index.mjs";

const CONTROLS = 'button, a, input, select, textarea, [contenteditable="true"], [data-action], .window-header';
/** Controls inside an inventory row: a click there is never a stack operation. */
const ROW_CONTROLS = "a, button, input, select, textarea, [contenteditable], .col-actions, .container-actions";
const INVENTORY_ROW = ".gear-entry[data-item-id], [data-sm-chest-id]";

const rowOf = (target) => (target instanceof Element ? target.closest("[data-item-id], [data-effect-id]") : null);

function onControl(target, row) {
  if (!(target instanceof Element)) return false;
  const control = target.closest(CONTROLS);
  return !!control && control !== row;
}

/**
 * Wire the click handling once on a sheet's root element.
 *
 * @param {ApplicationV2} app the actor sheet; it must offer `document` (the actor) and `_findEffect(id)`
 * @returns {() => void} cancels the pending open and split timers; call it when the sheet closes so a late timer cannot open a sheet or split a stack for a window that is gone
 */
export function wireRowClicks(app) {
  const root = app.element;
  let down = null;
  let openTimer = null;
  let splitTimer = null;

  const cancelOpen = () => { clearTimeout(openTimer); openTimer = null; };
  const cancelSplit = () => { clearTimeout(splitTimer); splitTimer = null; };

  /** The stackable inventory item under the pointer, when the user owns the actor. */
  const stackItemAt = (event) => {
    const target = event.target;
    if (!(target instanceof Element) || target.closest(ROW_CONTROLS) || !app.document.isOwner) return null;
    const row = target.closest(INVENTORY_ROW);
    const item = row && app.document.items.get(row.dataset.itemId ?? row.dataset.smChestId);
    return isStackable(item) ? item : null;
  };

  root.addEventListener("pointerdown", (event) => {
    cancelOpen();
    down = event.button === 0 && event.isPrimary
      ? { target: event.target, x: event.clientX, y: event.clientY, time: performance.now() }
      : null;
  }, true);

  root.addEventListener("pointerup", (event) => {
    if (down) Object.assign(down, { released: true, releaseTime: performance.now(), releaseX: event.clientX, releaseY: event.clientY });
  }, true);

  root.addEventListener("pointercancel", () => { down = null; }, true);
  root.addEventListener("dragstart", cancelSplit, true);

  root.addEventListener("dblclick", (event) => {
    if (!event.isTrusted || event.detail !== 2) return;
    const item = stackItemAt(event);
    if (!item || !splitQuantity(Number(item.system.quantity))) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    cancelOpen();
    cancelSplit();
    splitTimer = setTimeout(() => {
      splitTimer = null;
      if (app.document.items.has(item.id)) void splitStack(app.document, item.id);
    }, SPLIT_DELAY_MS);
  }, true);

  root.addEventListener("click", (event) => {
    if (event.isTrusted && event.detail === 3) {
      const item = stackItemAt(event);
      if (!item) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      cancelOpen();
      cancelSplit();
      void mergeStacks(app.document, item.id);
      return;
    }

    const start = down;
    down = null;
    if (!start?.released || event.defaultPrevented) return;
    if (event.detail > 1 || start.releaseTime - start.time > CLICK_MAX_MS) return;
    if (Math.hypot(start.releaseX - start.x, start.releaseY - start.y) > CLICK_MAX_PX) return;

    const row = rowOf(event.target);
    if (!row || row !== rowOf(start.target) || onControl(event.target, row)) return;

    const doc = app.document.items.get(row.dataset.itemId) ?? app._findEffect(row.dataset.effectId);
    if (typeof doc?.sheet?.render !== "function") return;
    event.preventDefault();
    if (doc.documentName === "Item" && isStackable(doc) && app.document.isOwner) {
      openTimer = setTimeout(() => {
        openTimer = null;
        doc.sheet.render(true);
      }, OPEN_DELAY_MS);
    } else {
      doc.sheet.render(true);
    }
  }, true);

  return () => { cancelOpen(); cancelSplit(); };
}
