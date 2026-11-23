/**
 * Inventory calculations: item totals (weight and value x quantity), the carried weight by category (gearSummary), item weights, container capacity and contents, the chest layout, stack split and merge, and the copies a transfer between actors creates.
 *
 * Pure: no Foundry globals. "Items" are plain objects shaped like the Foundry documents they stand for ({id, type, name, sort, system}), so the Node tests can feed them directly.
 */
import { STACK_TYPES } from "../config/index.mjs";

/**
 * Gear totals: an item's weight and value are per unit, the totals multiply them by the quantity.
 *
 * @param {number} weight per-unit weight
 * @param {number} value per-unit value
 * @param {number} quantity
 * @returns {{totalWeight: number, totalValue: number}}
 */
export function itemTotals(weight, value, quantity) {
  return { totalWeight: weight * quantity, totalValue: value * quantity };
}

/**
 * Builds the "does this item count as carried?" check of an actor. An item does when it is carried itself and the container it is stored in (if any) is carried too, so storing a container drops its whole contents' weight. An item whose container is missing counts as carried; a missing `carried` flag counts as not carried.
 *
 * @param {(id: string) => object|undefined} getContainer looks an item up by id (an actor's items collection get)
 * @returns {(item: object) => boolean}
 */
export const gearIsCarried = (getContainer) => (item) => {
  if (!item.system.carried) return false;
  const containerId = item.system.container;
  if (!containerId) return true;
  const container = getContainer(containerId);
  return container ? container.system.carried : true;
};

/**
 * Carried weight by category: the derived totalWeight (own stack weight) of every carried item, summed per category. Weapons, missiles and armor each have their own sum; gear and containers are "miscGear".
 *
 * @param {{filter: Function}} items the actor's items (an array or a collection with filter)
 * @param {(item: object) => boolean} isCarried see gearIsCarried
 * @returns {{weapon: number, missile: number, armor: number, miscGear: number, total: number}} in the stored weight unit
 */
export function gearSummary(items, isCarried) {
  const sumOwn = (types) => items
    .filter(i => types.includes(i.type) && isCarried(i))
    .reduce((sum, i) => sum + (i.system.totalWeight ?? 0), 0);

  const weapon = sumOwn(["weapon"]);
  const missile = sumOwn(["missile"]);
  const armor = sumOwn(["armor"]);
  const miscGear = sumOwn(["gear", "container"]);
  const total = weapon + missile + armor + miscGear;
  return { weapon, missile, armor, miscGear, total };
}

/**
 * Weight stored in a container and whether it is over the container's capacity: the ACTOR SHEET version (Gear and Containers tabs, the container item sheet's Stored tab).
 *
 * DIFFERS from containerFill below (KNOWN OPEN DECISION, do not unify without a decision): this one sums the contents' derived `totalWeight` and is over only when strictly above the capacity (`>`, no tolerance). containerFill sums ownWeight of the direct children and tolerates float noise (`> capacity + 1e-9`); the chest / inventory view and the item tooltip use that one.
 *
 * Pure: no Foundry globals. `contents` are the items stored in the container (their derived totalWeight, see itemTotals); a missing totalWeight counts as 0.
 *
 * @param {Array<{system: {totalWeight?: number}}>} contents
 * @param {number} maxCapacity the container's maximum stored weight
 * @returns {{contentWeight: number, overCapacity: boolean}}
 */
export function containerLoad(contents, maxCapacity) {
  const contentWeight = contents.reduce((sum, i) => sum + (i.system.totalWeight ?? 0), 0);
  return { contentWeight, overCapacity: contentWeight > maxCapacity };
}

/** Weight of an item's own stack: per-unit weight x quantity, never negative; 0 when either is not a number. */
export function ownWeight(item) {
  const weight = Number(item?.system?.weight ?? 0);
  const quantity = Number(item?.system?.quantity ?? 1);
  return Number.isFinite(weight) && Number.isFinite(quantity) ? Math.max(0, weight) * Math.max(0, quantity) : 0;
}

/** Weight shown for an item: its derived totalWeight when that is a number, else its own stack weight. */
export function itemWeight(item) {
  if (!item) return 0;
  const raw = item.system?.totalWeight;
  const value = Number(raw);
  return raw != null && raw !== "" && Number.isFinite(value) ? value : ownWeight(item);
}

/** A container's capacity, or null when it has none set (empty, not a number or negative). */
export function containerCapacity(box) {
  const raw = box?.system?.maxCapacity;
  const value = Number(raw);
  return raw == null || raw === "" || !Number.isFinite(value) || value < 0 ? null : value;
}

/** The items stored directly in a container (not the container itself). */
export const directChildren = (items, id) => (id ? items.filter(i => i.id !== id && i.system?.container === id) : []);

/** Weight of everything stored directly in a container. */
export const contentsWeight = (items, id) => directChildren(items, id).reduce((sum, i) => sum + ownWeight(i), 0);

/**
 * How full a container is: the CHEST VIEW and TOOLTIP version (view/inventory-view.mjs, view/item-tooltip.mjs).
 *
 * DIFFERS from containerLoad above (KNOWN OPEN DECISION, do not unify without a decision): this one sums ownWeight of the items stored directly in the container (per-unit weight x quantity, never negative) and is over only when more than the capacity plus 1e-9 (float tolerance). containerLoad sums derived totalWeight and uses a strict `>`; the actor sheet tabs use that one.
 *
 * @param {object[]} items all the actor's items
 * @param {object} box the container item
 * @returns {{used: number, capacity: number|null, over: boolean}} over = more stored than the capacity (a container without a capacity is never over)
 */
export function containerFill(items, box) {
  const used = contentsWeight(items, box.id);
  const capacity = containerCapacity(box);
  return { used, capacity, over: capacity !== null && used > capacity + 1e-9 };
}

/**
 * The chest layout: every container with the non-container items stored in it, in the containers' sort order, plus the "orphans" (items whose container no longer exists).
 *
 * @returns {{boxes: {box: object, children: object[]}[], orphans: object[]}}
 */
export function chestLayout(items) {
  const boxes = items.filter(i => i.type === "container").sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  const ids = new Set(boxes.map(b => b.id));
  return {
    boxes: boxes.map(box => ({ box, children: directChildren(items, box.id).filter(i => i.type !== "container") })),
    orphans: items.filter(i => i.type !== "container" && i.system?.container && !ids.has(i.system.container))
  };
}

/** Can this quantity be split in two? Returns the stack that stays and the stack that moves, or null (needs a whole number of at least 2). */
export function splitQuantity(quantity) {
  if (!Number.isSafeInteger(quantity) || quantity < 2) return null;
  const keep = Math.ceil(quantity / 2);
  return { keep, moved: quantity - keep };
}

const IGNORED_KEYS = new Set(["_id", "_stats", "sort", "origin"]);
const QUANTITY_KEYS = ["quantity", "totalWeight", "totalValue"];

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).filter(k => !IGNORED_KEYS.has(k)).sort().map(k => [k, canonical(value[k])]));
}

/**
 * A string that is equal for two item data objects that are the same except for their quantity (and sort order, ids and origin).
 *
 * @param {object} data an item's source data (item.toObject())
 */
export function stackSignature({ name, type, img, effects, flags, system: raw }) {
  const system = { ...raw };
  for (const key of QUANTITY_KEYS) delete system[key];
  return JSON.stringify(canonical({ name, type, img, system, effects: effects ?? [], flags: flags ?? {} }));
}

/**
 * The stacks that merge with an item: stackable items with the same name in the same container and a positive whole quantity ("peers"), of which the ones whose signature is identical ("matches").
 *
 * @param {object[]} items all the actor's items
 * @param {object} item the item that was clicked
 * @param {(item: object) => string} signatureOf the signature of an item (stackSignature of its source data)
 * @returns {{peers: object[], matches: object[]}}
 */
export function mergeCandidates(items, item, signatureOf) {
  const peers = items.filter(i =>
    STACK_TYPES.includes(i.type)
    && i.name === item.name
    && (i.system.container ?? "") === (item.system.container ?? "")
    && Number.isSafeInteger(Number(i.system.quantity))
    && Number(i.system.quantity) > 0);
  const signature = signatureOf(item);
  return { peers, matches: peers.filter(i => signatureOf(i) === signature) };
}

/**
 * The item data to create on the target actor for a transfer: the moved item and, for a container, everything stored directly in it. Every copy gets a fresh id that is not taken on the target, a container reference remapped to the new ids (the moved item itself goes into `place`), carried = true, and no folder, ownership or stats.
 *
 * @param {object[]} originals source data of the moved item (first) and its contents
 * @param {string} rootId id of the moved item
 * @param {string} place id of the container on the target the moved item goes into ("" for none)
 * @param {Set<string>} taken ids already used on the target
 * @param {() => string} randomId id generator
 * @returns {{copies: object[], ids: Map<string, string>}} ids maps source id -> new id
 */
export function buildTransferCopies(originals, rootId, place, taken, randomId) {
  const used = new Set(taken);
  const ids = new Map();
  for (const data of originals) {
    let next;
    do { next = randomId(); } while (used.has(next));
    used.add(next);
    ids.set(data._id, next);
  }
  const copies = originals.map(original => {
    const data = structuredClone(original);
    data._id = ids.get(original._id);
    delete data._stats;
    delete data.folder;
    delete data.ownership;
    data.system.container = original._id === rootId ? place : (ids.get(original.system.container) ?? "");
    data.system.carried = true;
    return data;
  });
  return { copies, ids };
}

