// Item sheet fixtures: the context of each item sheet part, built from the item's data model (its initial values) and the real sheet class.
import { SCARMARK } from "../../module/config.mjs";

// Globals the item sheets read while preparing their context: CONFIG.SCARMARK and the text enricher (it returns the text unchanged).
globalThis.CONFIG = { ...(globalThis.CONFIG ?? {}), SCARMARK };
globalThis.foundry.applications.ux = { TextEditor: { implementation: { enrichHTML: async (text) => text ?? "" } } };

const TYPES = {
  trait: ["item-trait", "item-trait-sheet"],
  gear: ["item-gear", "item-gear-sheet"],
  skill: ["item-skill", "item-skill-sheet"],
  weapon: ["item-weapon", "item-weapon-sheet"],
  missile: ["item-missile", "item-missile-sheet"],
  armorLocation: ["item-armor-location", "item-armor-location-sheet"],
  armor: ["item-armor", "item-armor-sheet"],
  container: ["item-container", "item-container-sheet"],
  injury: ["item-injury", "item-injury-sheet"],
  invocation: ["item-invocation", "item-invocation-sheet"],
  spell: ["item-spell", "item-spell-sheet"],
  psionic: ["item-psionic", "item-psionic-sheet"]
};

/** The value a field starts with: SchemaFields recurse, a SetField is a Set, an ArrayField an array. */
function initialOf(field) {
  const name = field.constructor.name;
  if (name === "SchemaField") return Object.fromEntries(Object.entries(field.args[0]).map(([key, child]) => [key, initialOf(child)]));
  if (name === "SetField") return new Set();
  if (name === "ArrayField") return [];
  return field.options?.initial;
}

/** "full" turns every flag on, numbers up and text into a name with markup, so each branch of a template renders. */
function fill(value, variant) {
  if (variant === "empty") return value;
  if (value instanceof Set) return new Set(["head", "chest"]);
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fill(v, variant)]));
  if (typeof value === "boolean") return true;
  if (typeof value === "number") return value + 1;
  if (typeof value === "string" && value === "") return "<b>text</b>";
  return value;
}

export async function loadItemSheets() {
  const out = {};
  for (const [type, [dataFile, sheetFile]] of Object.entries(TYPES)) {
    const { default: Data } = await import(`../../module/data/${dataFile}.mjs`);
    const { default: Sheet } = await import(`../../module/sheets/${sheetFile}.mjs`);
    out[type] = { Data, Sheet };
  }
  return out;
}

export async function buildItemContext(Data, Sheet, type, variant, partId) {
  const schema = Data.defineSchema();
  const system = Object.fromEntries(Object.entries(schema).map(([key, field]) => [key, fill(initialOf(field), variant)]));
  if (type === "armor" && variant === "full") system.coverage = [{ type: "head", side: "", condition: 0 }, { type: "arm", side: "left", condition: 2 }, { type: "shoulder", side: "", condition: 0 }];
  const parent = variant === "full"
    ? { documentName: "Actor", items: [{ id: "box", type: "container", name: "Backpack" }, { id: "i1", type, name: "Self" }] }
    : null;
  const document = { id: "i1", type, name: variant === "full" ? "Item <name>" : "", img: "icons/item.svg", system, effects: [], parent, uuid: "Item.i1" };
  const sheet = new Sheet({ document });
  const context = await sheet._prepareContext({});
  context.document = document;
  context.tab = { id: partId, active: variant === "full" };
  context.config = SCARMARK;
  return context;
}
