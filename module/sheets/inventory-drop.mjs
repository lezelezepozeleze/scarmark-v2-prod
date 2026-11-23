/**
 * Drag and drop of inventory items between actor sheets and into containers.
 *
 *  - Dropping an item on a container block (Containers tab, chest list) stores it there.
 *  - A container moves to another actor with everything stored in it.
 *  - An item taken out of a container goes to the other actor at the top level.
 *  - On a Container actor, or when the dragged item comes from one, every drop in the inventory is a move.
 * The valid drop target is outlined while dragging. Everything else (sorting a list, items from the sidebar) keeps the sheet's default drop.
 */
import { INVENTORY_TYPES } from "../config/index.mjs";

/** UUID of the inventory item being dragged right now (set by the sheets, which know when a drag starts). */
let dragging = null;
let marked = null;

function clearMark() {
  marked?.classList.remove("sm-drop-target");
  marked = null;
}

/** Remember the inventory item that is being dragged (called when a row starts to drag). */
export function startDrag(item) {
  dragging = item.uuid;
}

/** Forget the drag (also called when the dragging sheet closes, so a stale UUID is never used by another sheet). */
export function endDrag() {
  clearMark();
  dragging = null;
}

/**
 * Where would dropping `item` on this sheet put it?
 *
 * @param {ApplicationV2} sheet the actor sheet the drop is on
 * @param {DragEvent} event
 * @param {Item} item the dragged item
 * @returns {{source: Actor, target: Actor, place: string, mark: Element}|null} null when the default drop applies
 */
export function inventoryDestination(sheet, event, item) {
  const target = sheet.document;
  const source = item?.parent;
  if (source?.documentName !== "Actor" || !source.isOwner || !target.isOwner) return null;
  if (!INVENTORY_TYPES.includes(item.type)) return null;

  const zone = event.target.closest?.(".tab.gear, .tab.containers");
  if (!zone || !sheet.element.contains(zone)) return null;

  const block = event.target.closest("[data-box-id], .container-block[data-item-id]");
  const targetId = block?.dataset.boxId ?? block?.dataset.itemId;
  const place = item.type === "container" ? "" : (target.items.get(targetId)?.type === "container" ? targetId : "");

  const chest = target.type === "container";
  const fromChest = source.type === "container";
  const fromContainer = !!item.system?.container && source.uuid !== target.uuid;
  if (!chest && !fromChest && !fromContainer && (!place || !zone.matches(".tab.containers"))) return null;

  return { source, target, place, mark: place && block ? block : zone };
}

/** Wire the drag-over outline and the end of a drag once on a sheet's root element. */
export function wireInventoryDrop(sheet) {
  const root = sheet.element;
  root.addEventListener("dragover", (event) => {
    clearMark();
    if (!dragging) return;
    const item = fromUuidSync(dragging);
    const dest = item && inventoryDestination(sheet, event, item);
    if (!dest) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    marked = dest.mark;
    marked.classList.add("sm-drop-target");
  }, true);
  root.addEventListener("dragend", endDrag, true);
  root.addEventListener("drop", clearMark, true);
}
