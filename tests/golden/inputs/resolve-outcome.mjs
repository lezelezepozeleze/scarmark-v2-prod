// Inputs for tests/golden/resolve-outcome.json (rules/outcome.mjs resolveOutcome). Capture: npm run golden -- --capture resolve-outcome
const LEVELS = ["cf", "mf", "ms", "cs"];
const DEFENSES = ["block", "dodge", "riposte", "counterstrike"];

const cases = [];
for (const a of LEVELS) cases.push({ id: `ignore-${a}`, input: { defense: "ignore", attackerLevel: a, defenderLevel: null } });
for (const defense of DEFENSES) {
  for (const a of LEVELS) {
    for (const d of LEVELS) {
      cases.push({ id: `${defense}-${a}-vs-${d}`, input: { defense, attackerLevel: a, defenderLevel: d, attackerRoll: 40, defenderRoll: 30 } });
    }
  }
}
// Ties of success level: higher roll wins a riposte, equal rolls are dead even; the other defenses ignore the rolls.
const ties = [["ms", 33, 27], ["ms", 27, 33], ["ms", 30, 30], ["cs", 45, 20], ["cs", 20, 45], ["cs", 25, 25], ["mf", 70, 60], ["cf", 100, 90]];
for (const defense of DEFENSES) {
  for (const [lvl, ar, dr] of ties) {
    cases.push({ id: `${defense}-tie-${lvl}-${ar}-vs-${dr}`, input: { defense, attackerLevel: lvl, defenderLevel: lvl, attackerRoll: ar, defenderRoll: dr } });
  }
}
// Rolls omitted (default 0 in resolveOutcome).
cases.push({ id: "riposte-tie-ms-rolls-omitted", input: { defense: "riposte", attackerLevel: "ms", defenderLevel: "ms" } });
cases.push({ id: "ignore-cs-defender-level-given", input: { defense: "ignore", attackerLevel: "cs", defenderLevel: "cf" } });

export { cases };
