// Inputs for tests/golden/defense-target.json (helpers/combat/resolve.mjs defense targets: high-velocity Dodge halving, Block DSL, situational mods, cap).
// attackRoll / defenseRoll are the scripted d100 totals. Capture: npm run golden -- --capture defense-target
const base = { attack: "range", asl: 40, attackRoll: 50, defenseRoll: 50, velocity: "low" };
const v = (o) => ({ ...base, ...o });

export const cases = [
  { id: "range-dodge-low-60", input: v({ defense: "dodge", dodgeEsl: 60 }) },
  { id: "range-dodge-high-60-halved", input: v({ defense: "dodge", dodgeEsl: 60, velocity: "high" }) },
  { id: "range-dodge-high-61-floor", input: v({ defense: "dodge", dodgeEsl: 61, velocity: "high" }) },
  { id: "range-dodge-high-1", input: v({ defense: "dodge", dodgeEsl: 1, velocity: "high" }) },
  { id: "range-dodge-high-0", input: v({ defense: "dodge", dodgeEsl: 0, velocity: "high" }) },
  { id: "range-dodge-no-skill", input: v({ defense: "dodge" }) },
  { id: "range-dodge-velocity-missing", input: v({ defense: "dodge", dodgeEsl: 60, velocity: undefined }) },
  { id: "range-dodge-high-modifier-after-halving", input: v({ defense: "dodge", dodgeEsl: 60, velocity: "high", modifier: 10 }) },
  { id: "range-dodge-high-outnumbered-2", input: v({ defense: "dodge", dodgeEsl: 60, velocity: "high", outnumbered: 2 }) },
  { id: "range-dodge-outnumbered-3-stunned", input: v({ defense: "dodge", dodgeEsl: 70, outnumbered: 3, defenseMod: -30 }) },
  { id: "range-dodge-negative-target", input: v({ defense: "dodge", dodgeEsl: 10, defenseMod: -30 }) },
  { id: "range-dodge-low-200-capped", input: v({ defense: "dodge", dodgeEsl: 200 }) },
  { id: "range-dodge-high-200-capped", input: v({ defense: "dodge", dodgeEsl: 200, velocity: "high" }) },
  { id: "range-dodge-high-191-halved-under-cap", input: v({ defense: "dodge", dodgeEsl: 191, velocity: "high" }) },
  { id: "range-block-shield", input: v({ defense: "block", blockWeapon: { defense: 10, closeCombatEsl: 40 } }) },
  { id: "range-block-shield-high-velocity-not-halved", input: v({ defense: "block", velocity: "high", blockWeapon: { defense: 10, closeCombatEsl: 40 } }) },
  { id: "range-block-no-weapon", input: v({ defense: "block", modifier: 5 }) },
  { id: "range-ignore", input: v({ defense: "ignore" }) },
  { id: "range-attack-hits-dodge-fails", input: v({ defense: "dodge", dodgeEsl: 30, asl: 70, attackRoll: 22, defenseRoll: 64 }) },
  { id: "melee-dodge-high-velocity-ignored", input: v({ attack: "melee", defense: "dodge", dodgeEsl: 60, velocity: "high" }) },
  { id: "melee-dodge-outnumbered-2", input: v({ attack: "melee", defense: "dodge", dodgeEsl: 60, outnumbered: 2 }) }
];
