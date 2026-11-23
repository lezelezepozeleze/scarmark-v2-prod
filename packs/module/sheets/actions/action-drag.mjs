/** Drag and drop of the actions of an Actions panel. An action row drags out as a copy of its action; dropping that, or an entry of the action compendium (an Action item from a compendium or the Items directory), on a panel adds a copy of the action to its list. The panel is wired after every render by the sheets that hold it (ActionsPanelMixin). */
import { ACTION_ENTRY_TYPE } from "../../config/index.mjs";
import { actionsFromEntry } from "../../rules/index.mjs";
import { copyLibraryActions } from "../../helpers/action-library.mjs";

/** The `type` of the drag data of an action row (Foundry's own types are Item, ActiveEffect...). */
export const ACTION_DRAG_TYPE = "ScarmarkAction";

/** Where a drag came from: the document and the data path of the list. Dropping on the list it came from does nothing. */
const sourceOf = (document, path) => `${document.uuid}#${path}`;

/** The drag data of one action row. */
export const actionDragData = (document, path, action) => ({ type: ACTION_DRAG_TYPE, source: sourceOf(document, path), action });

/** The drag data of an event, or null when it is not JSON (a file, a link, text). */
function dragDataOf(event) {
  try {
    return JSON.parse(event.dataTransfer.getData("text/plain"));
  } catch {
    return null;
  }
}

/** Is this drag something the panel takes: one of its own rows, or an entry of the action compendium? (An item of another type falls through to the sheet's own drop.) */
function takesDrop(data) {
  if (data?.type === ACTION_DRAG_TYPE) return true;
  return data?.type === "Item" && !!data.uuid && fromUuidSync(data.uuid)?.type === ACTION_ENTRY_TYPE;
}

/** The new actions a drop brings (fresh ids), or null when there is nothing to add. */
async function droppedActions(data, document, path) {
  if (data.type === ACTION_DRAG_TYPE) {
    if (data.source === sourceOf(document, path) || !data.action) return null;
    return actionsFromEntry([data.action], data.action.name, () => foundry.utils.randomID());
  }
  return copyLibraryActions(data.uuid);
}

/**
 * Make the action rows of every panel on a sheet draggable and the panels drop targets (an editable sheet only takes drops).
 *
 * @param {ApplicationV2} sheet a sheet with the ActionsPanelMixin, rendered
 * @param {(document: foundry.abstract.Document, path: string) => object[]} storedActions a copy of the stored actions of a list
 */
export function wireActionsDrag(sheet, storedActions) {
  const document = sheet.document;
  for (const panel of sheet.element.querySelectorAll(".actions-panel[data-actions-path]")) {
    const list = panel.querySelector(".actions-list");
    if (!list) continue;
    const path = panel.dataset.actionsPath;
    for (const row of list.querySelectorAll("li[data-index]")) {
      row.setAttribute("draggable", "true");
      row.addEventListener("dragstart", (event) => {
        const action = storedActions(document, path)[Number(row.dataset.index)];
        if (!action) return event.preventDefault();
        event.dataTransfer.setData("text/plain", JSON.stringify(actionDragData(document, path, action)));
        event.dataTransfer.effectAllowed = "copy";
      });
    }
    if (!sheet.isEditable) continue;
    panel.addEventListener("dragover", (event) => {
      event.preventDefault();
      panel.classList.add("sm-drop-target");
    });
    panel.addEventListener("dragleave", (event) => {
      if (!panel.contains(event.relatedTarget)) panel.classList.remove("sm-drop-target");
    });
    panel.addEventListener("drop", async (event) => {
      panel.classList.remove("sm-drop-target");
      const data = dragDataOf(event);
      if (!takesDrop(data)) return;
      // Decided before the first await: the sheet's own drop handler must not see it.
      event.preventDefault();
      event.stopPropagation();
      const copies = await droppedActions(data, document, path);
      if (copies?.length) await document.update({ [path]: [...storedActions(document, path), ...copies] });
    });
  }
}
