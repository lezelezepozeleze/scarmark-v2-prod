// Records the defineSchema() of every actor and item data model (field class, options, nested fields, key order) so a refactor of the schema code can prove it built the same schema. Needs the Foundry stub, whose field classes keep their options.
//
// Capture the current schemas:   npm run schema:capture
// The comparison runs under "npm test" (tests/schema.test.mjs). The fixture tests/schema/schemas.json is only rewritten by a deliberate capture, never to make a failing comparison pass.
import { writeFileSync } from "node:fs";
import { URL, fileURLToPath } from "node:url";

export const MODELS = {
  "actor.character": "../../module/data/actor-character.mjs",
  "actor.creature": "../../module/data/actor-creature.mjs",
  "actor.npc": "../../module/data/actor-npc.mjs",
  "actor.animal": "../../module/data/actor-animal.mjs",
  "actor.container": "../../module/data/actor-container.mjs",
  "item.trait": "../../module/data/item-trait.mjs",
  "item.skill": "../../module/data/item-skill.mjs",
  "item.gear": "../../module/data/item-gear.mjs",
  "item.weapon": "../../module/data/item-weapon.mjs",
  "item.missile": "../../module/data/item-missile.mjs",
  "item.armorLocation": "../../module/data/item-armor-location.mjs",
  "item.armor": "../../module/data/item-armor.mjs",
  "item.container": "../../module/data/item-container.mjs",
  "item.injury": "../../module/data/item-injury.mjs",
  "item.invocation": "../../module/data/item-invocation.mjs",
  "item.spell": "../../module/data/item-spell.mjs",
  "item.psionic": "../../module/data/item-psionic.mjs",
  "item.action": "../../module/data/item-action.mjs"
};

const isField = (v) => v && typeof v === "object" && Array.isArray(v.args) && v.options !== undefined;

/** One field as plain data: class name, its options (functions shown as "[function]"), and for SchemaField / ArrayField / SetField the nested fields. */
export function describeField(field) {
  const out = { type: field.constructor.name };
  const options = {};
  for (const [key, value] of Object.entries(field.options ?? {})) {
    if (isField(value)) continue;
    options[key] = typeof value === "function" ? "[function]" : value;
  }
  out.options = options;
  const [first] = field.args;
  if (isField(first)) out.element = describeField(first);
  else if (first && typeof first === "object" && Object.values(first).some(isField)) out.fields = describeSchema(first);
  return out;
}

/** A schema object (key -> field) as plain data, key order kept. */
export function describeSchema(schema) {
  return Object.fromEntries(Object.entries(schema).map(([key, field]) => [key, describeField(field)]));
}

/** Every model's schema, as plain JSON-safe data. */
export async function describeAllModels() {
  const out = {};
  for (const [name, path] of Object.entries(MODELS)) {
    const Model = (await import(new URL(path, import.meta.url))).default;
    out[name] = describeSchema(Model.defineSchema());
  }
  return out;
}

if (process.argv.includes("--capture")) {
  const file = fileURLToPath(new URL("../schema/schemas.json", import.meta.url));
  writeFileSync(file, `${JSON.stringify(await describeAllModels(), null, 2)}\n`);
  console.log(`schema: wrote ${file}`);
}
