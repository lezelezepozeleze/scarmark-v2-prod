// Inputs for tests/golden/local/compendium-items.json (local only, gitignored): every item of the real item compendiums, prepared standalone (no owning actor).
// Data: tests/golden/local/data/<pack-id>.json, frozen by tests/tools/import-compendium-fixtures.mjs (see there for the kept and stripped fields). The committed sample (tests/golden/compendium-items-sample.json) is built from the local fixture by tests/tools/select-compendium-sample.mjs.
// Case id: "<pack-id>/<_id>/<name>". Capture: npm run golden -- --capture compendium-items --local
import { compendiumCases } from "./compendium-data.mjs";

export const ITEM_PACKS = [
  "scarmark.alchemy", "scarmark.arcane", "scarmark.armor", "scarmark.armor-locations", "scarmark.currencies", "scarmark.diseases",
  "scarmark.gear", "scarmark.gear-funny", "scarmark.invocations", "scarmark.poisonings", "scarmark.psionic-talents",
  "scarmark.racial-traits", "scarmark.services", "scarmark.skills", "scarmark.valuables", "scarmark.weapons"
];

export const cases = await compendiumCases(ITEM_PACKS);
