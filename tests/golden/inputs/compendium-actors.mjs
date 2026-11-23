// Inputs for tests/golden/local/compendium-actors.json (local only, gitignored): every actor of the real actor compendiums with its embedded items and effects.
// Data: tests/golden/local/data/<pack-id>.json, frozen by tests/tools/import-compendium-fixtures.mjs (see there for the kept and stripped fields). The committed sample (tests/golden/compendium-actors-sample.json) is built from the local fixture by tests/tools/select-compendium-sample.mjs.
// Case id: "<pack-id>/<_id>/<name>". Capture: npm run golden -- --capture compendium-actors --local
import { compendiumCases } from "./compendium-data.mjs";

export const ACTOR_PACKS = ["scarmark.actors", "world.actors"];

export const cases = await compendiumCases(ACTOR_PACKS);
