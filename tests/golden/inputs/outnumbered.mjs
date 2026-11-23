// Inputs for tests/golden/outnumbered.json (data/base-actor-schema.mjs outnumberedPenalty). Capture: npm run golden -- --capture outnumbered
export const cases = [
  ...[0, 1, 2, 3, 4, 10, -1, 2.5, 3.5, 1.9, "2", "3", null].map(n => ({ id: `outnumbered-${JSON.stringify(n)}`, input: { outnumbered: n } })),
  { id: "field-missing", input: {} },
  { id: "no-mods", input: { noMods: true } },
  { id: "no-actor", input: { noActor: true } }
];
