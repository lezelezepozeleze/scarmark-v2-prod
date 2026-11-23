/**
 * View models for the container lists: the Containers section of the Gear tab and the chest list of a Container actor. Pure: no Foundry globals, so the Node tests can feed it plain objects.
 */
import { chestLayout, containerFill, itemWeight } from "../rules/index.mjs";
import { formatNumber } from "./format.mjs";

const DEFAULT_IMG = "icons/svg/item-bag.svg";

/** Lower-case text used to match the search box. */
const searchText = (item) => `${item.name ?? ""} ${item.system?.notes ?? ""}`.trim().toLocaleLowerCase();

/** "used / capacity" with "?" when the container has no capacity. */
export const fillText = (fill) => `${formatNumber(fill.used)} / ${fill.capacity === null ? "?" : formatNumber(fill.capacity)}`;

function baseRow(item) {
  return {
    id: item.id,
    name: item.name,
    img: item.img || DEFAULT_IMG,
    quantity: item.system?.quantity ?? 1,
    notes: item.system?.notes ?? "",
    carried: !!item.system?.carried,
    search: searchText(item)
  };
}

/** The rows of the Containers section on the Gear tab: every container with its weight and how full it is. */
export function containerRows(items) {
  return items.filter(i => i.type === "container").sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)).map(box => {
    const fill = containerFill(items, box);
    return { ...baseRow(box), weight: formatNumber(itemWeight(box)), capacity: fillText(fill), over: fill.over };
  });
}

/**
 * The chest list of a Container actor: a group per container (the container row, then the items stored in it) and a last group for items whose container is gone.
 * The weights and capacities carry their unit ("kg"); an item inside a container has no capacity ("-").
 *
 * @returns {{groups: {box: object|null, children: object[]}[]}}
 */
export function chestGroups(items) {
  const { boxes, orphans } = chestLayout(items);
  const childRow = (item) => ({ ...baseRow(item), weight: `${formatNumber(itemWeight(item))} kg`, capacity: "-", over: false, isBox: false });
  const groups = boxes.map(({ box, children }) => {
    const fill = containerFill(items, box);
    return {
      box: { ...baseRow(box), weight: `${formatNumber(itemWeight(box))} kg`, capacity: `${fillText(fill)} kg`, over: fill.over, isBox: true },
      children: children.map(childRow)
    };
  });
  if (orphans.length) groups.push({ box: null, children: orphans.map(childRow) });
  return { groups };
}
