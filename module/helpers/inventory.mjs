/**
 * Inventory operations that change documents: a lock against overlapping changes, splitting and merging stacks, and moving items (with a container's contents) between actors.
 * The calculations behind them are pure and live in rules/inventory.mjs.
 */
import { fieldValue } from "./form-fields.mjs";
import { STACK_TYPES } from "../config/index.mjs";
import { splitQuantity, stackSignature, mergeCandidates, directChildren, buildTransferCopies } from "../rules/index.mjs";
import { localizer } from "./i18n.mjs";
import { esc } from "./escape.mjs";

const T = localizer("SCARMARK.Inventory");

/** UUIDs of the actors a change is running on (one change at a time per actor). */
const busy = new Set();

/**
 * Run `fn` while the given actors are locked. Throws when an actor is missing, the user is not its owner, or a change is already running on it (error.code "SCARMARK_BUSY").
 *
 * @param {Actor[]} actors
 * @param {() => Promise<*>} fn
 */
async function locked(actors, fn) {
  const requested = actors.filter(Boolean);
  if (!requested.length) throw new Error(T("noActor"));
  const unique = [...new Map(requested.map(actor => [actor.uuid, actor])).values()];
  if (!unique.every(actor => actor.isOwner)) throw new Error(T("needOwner"));
  const keys = unique.map(actor => actor.uuid);
  if (keys.some(key => busy.has(key))) {
    const error = new Error(T("busy"));
    error.code = "SCARMARK_BUSY";
    throw error;
  }
  keys.forEach(key => busy.add(key));
  try {
    return await fn();
  } finally {
    keys.forEach(key => busy.delete(key));
  }
}

/** Like `locked`, but reports an error to the user (a warning when busy) instead of throwing. */
export async function runLocked(actors, fn) {
  try {
    return await locked(actors, fn);
  } catch (error) {
    console.error("Scarmark | inventory", error);
    if (error?.code === "SCARMARK_BUSY") ui.notifications.warn(error.message);
    else ui.notifications.error(error?.message || T("failed"));
    return undefined;
  }
}

/** Can this item be stacked (is it in STACK_TYPES)? */
export const isStackable = (item) => STACK_TYPES.includes(item?.type);

/** Split a stack in two: half (rounded up) stays, the rest becomes a new item. Undoes the first step if creating the new item fails. */
export async function splitStack(actor, id) {
  await runLocked([actor], async () => {
    const item = actor.items.get(id);
    const quantity = Number(item?.system.quantity);
    const parts = item ? splitQuantity(quantity) : null;
    if (!parts) return;

    const copy = item.toObject();
    for (const key of ["_id", "_stats", "folder", "ownership"]) delete copy[key];
    copy.system.quantity = parts.moved;

    await item.update({ "system.quantity": parts.keep });
    try {
      await actor.createEmbeddedDocuments("Item", [copy]);
    } catch (error) {
      try {
        await item.update({ "system.quantity": quantity });
      } catch (rollback) {
        console.error("Scarmark | split rollback", rollback);
      }
      throw error;
    }
    ui.notifications.info(T("split", { name: item.name, keep: parts.keep, moved: parts.moved }));
  });
}

/** Merge every stack identical to this one (same name, container and properties; only the quantity differs) into this item. Repairs the quantity if deleting the others fails. */
export async function mergeStacks(actor, id) {
  await runLocked([actor], async () => {
    const item = actor.items.get(id);
    if (!item) return;

    const { peers, matches } = mergeCandidates(actor.items.contents, item, i => stackSignature(i.toObject()));
    if (matches.length < 2) {
      if (peers.length > 1) ui.notifications.warn(T("mergeDiffers"));
      return;
    }

    const total = matches.reduce((n, i) => n + Number(i.system.quantity), 0);
    if (!Number.isSafeInteger(total)) throw new Error(T("tooMany"));
    const others = matches.filter(i => i.id !== id);

    await item.update({ "system.quantity": total });
    try {
      await actor.deleteEmbeddedDocuments("Item", others.map(i => i.id));
      if (others.some(i => actor.items.has(i.id))) throw new Error(T("mergeLeft"));
    } catch (error) {
      const remaining = others.filter(i => actor.items.has(i.id));
      const repaired = total - remaining.reduce((n, i) => n + Number(i.system.quantity), 0);
      try {
        await item.update({ "system.quantity": repaired });
      } catch (rollback) {
        console.error("Scarmark | merge rollback", rollback);
      }
      throw error;
    }
    ui.notifications.info(T("merged", { name: item.name, count: matches.length, total }));
  });
}

/** The container item with this id on an actor, or null. */
export const getContainer = (actor, id) => {
  const item = actor?.items.get(id);
  return item?.type === "container" ? item : null;
};

/**
 * Move an item to another actor (or into a container of the same actor), taking a container's contents along.
 *
 * Between actors the copies are created first and checked, and only then are the originals deleted; if anything fails the copies (or the restored originals) are cleaned up again. A container cannot go into another container, so a moved container always lands at the top level.
 *
 * @param {Actor} source the actor that has the item now
 * @param {Actor} target the actor that gets it (may be the same actor)
 * @param {string} id the moved item's id on the source
 * @param {string} [place] id of the container on the target to put it in ("" for none)
 */
export async function containerTransfer(source, target, id, place = "") {
  const item = source?.items.get(id);
  if (!item) throw new Error(T("missingItem"));
  if (item.type === "container") place = "";
  if (place && !getContainer(target, place)) throw new Error(T("noTargetContainer"));

  if (source.uuid === target.uuid) {
    await item.update({ "system.container": place, "system.carried": true });
    return;
  }

  const snapshot = () => {
    const root = source.items.get(id);
    if (!root) return [];
    return [root, ...(root.type === "container" ? directChildren(source.items.contents, id) : [])].map(doc => doc.toObject());
  };

  const originals = snapshot();
  const before = JSON.stringify(originals);
  const { copies, ids } = buildTransferCopies(originals, id, place, new Set(target.items.map(doc => doc.id)), () => foundry.utils.randomID());
  const newIds = [...ids.values()];
  let deleting = false;

  try {
    await target.createEmbeddedDocuments("Item", copies, { keepId: true });

    const valid = copies.every(data => {
      const created = target.items.get(data._id);
      return created
        && created.type === data.type
        && created.name === data.name
        && created.system.container === data.system.container
        && Number(created.system.quantity ?? 1) === Number(data.system.quantity ?? 1);
    });
    if (!valid) throw new Error(T("targetIncomplete"));

    if (JSON.stringify(snapshot()) !== before || (place && !getContainer(target, place))) throw new Error(T("changedDuringMove"));

    deleting = true;
    await source.deleteEmbeddedDocuments("Item", originals.map(data => data._id));
    if (originals.some(data => source.items.has(data._id))) throw new Error(T("sourceNotRemoved"));
  } catch (error) {
    // The source is gone completely: the move is done.
    if (deleting && originals.every(data => !source.items.has(data._id))) return;

    try {
      if (deleting) {
        const missing = originals.filter(data => !source.items.has(data._id));
        if (missing.length) await source.createEmbeddedDocuments("Item", missing, { keepId: true });
        if (originals.some(data => !source.items.has(data._id))) throw new Error(T("sourceNotRestored"));
      }
      const created = newIds.filter(newId => target.items.has(newId));
      if (created.length) await target.deleteEmbeddedDocuments("Item", created);
      if (newIds.some(newId => target.items.has(newId))) throw new Error(T("copiesLeft"));
    } catch (rollbackError) {
      console.error("Scarmark | transfer needs a manual check", { error, rollbackError, source: source.uuid, target: target.uuid, originals, newIds });
      throw new Error(T("moveFailed"));
    }
    throw error;
  }
}

/**
 * preCreateItem: an item created on an actor must not point at a container that is not on that actor (it was dropped from a container of another actor). Moves made by containerTransfer (keepId) are left alone.
 */
export function clearStaleContainer(item, data, options) {
  const ref = item.system?.container;
  if (!ref || options?.keepId || item.parent?.documentName !== "Actor") return;
  if (item.parent.items.has(ref)) return;
  item.updateSource({ "system.container": "" });
}

/**
 * Re-order an item within one list: place `source` before or after `target` among the listed rows and renumber their `sort` (only the items whose number changes are written).
 *
 * @param {Actor} actor
 * @param {string} sourceId the dragged item
 * @param {string} targetId the row it was dropped on
 * @param {string[]} rowIds the item ids of the list, in displayed order (must include the source)
 * @param {boolean} below true to place it after the target row
 * @returns {Promise<Item[]>} the updated items (none when nothing changes)
 */
export async function reorderItems(actor, sourceId, targetId, rowIds, below) {
  const items = actor.items;
  const source = items.get(sourceId);
  if (!source || targetId === sourceId || !rowIds.includes(sourceId)) return [];

  const ordered = rowIds.map(id => items.get(id)).filter(i => i && i.id !== sourceId);
  let index = ordered.findIndex(i => i.id === targetId);
  if (below) index += 1;
  ordered.splice(index, 0, source);

  const density = CONST.SORT_INTEGER_DENSITY ?? 100000;
  const updates = ordered
    .map((item, i) => ({ _id: item.id, sort: (i + 1) * density }))
    .filter(u => items.get(u._id).sort !== u.sort);
  if (!updates.length) return [];
  return actor.updateEmbeddedDocuments("Item", updates);
}

/** After an item was dropped on `target` and created there: delete the original when it came from another actor (a drag between actors moves, a drop from the world or a compendium copies). */
export async function deleteMovedOriginal(target, item, created) {
  const source = item.parent;
  if (created && source?.documentName === "Actor" && source.uuid !== target.uuid) {
    await item.delete().catch(err => console.warn("Scarmark | could not remove moved item from source", err));
  }
}

/** Store an item into a container of the same actor, chosen via a dialog (there may be several). */
export async function storeIntoContainer(actor, item) {
  const containers = actor.items.filter(i => i.type === "container");
  if (!containers.length) {
    ui.notifications.warn(game.i18n.localize("SCARMARK.Container.noContainers"));
    return;
  }

  const options = containers
    .map(c => `<option value="${c.id}">${esc(c.name)}</option>`)
    .join("");
  const chosen = await foundry.applications.api.DialogV2.prompt({
    window: { title: game.i18n.localize("SCARMARK.Container.storeTitle") },
    content: `
      <div class="form-group">
        <label for="sm-store-container">${game.i18n.localize("SCARMARK.Container.storeInto")}</label>
        <select id="sm-store-container" name="container">${options}</select>
      </div>`,
    ok: {
      label: game.i18n.localize("SCARMARK.Container.store"),
      callback: (event, button) => fieldValue(button.form, "container")
    },
    rejectClose: false
  });
  if (chosen) item.update({ "system.container": chosen });
}

/**
 * Unpack: take an item out of its container, or empty a container (everything stored directly in it goes back to the inventory).
 * Items whose container no longer exists are taken out too.
 */
export async function unpackItem(actor, item) {
  if (item.type !== "container") return void item.update({ "system.container": "" });
  const stored = directChildren(actor.items.contents, item.id);
  if (stored.length) await actor.updateEmbeddedDocuments("Item", stored.map(i => ({ _id: i.id, "system.container": "" })));
}
