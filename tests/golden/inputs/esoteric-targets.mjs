// Inputs for tests/golden/esoteric-targets.json. One entry per consumer of each target formula (see adapters.mjs):
// spell (esl - SCARMARK.spellLevelPenalty(level)) and invocation (esl - circle * 5): the roll (capped) and the sheet Esoterics tab (uncapped);
// shock (2 x Condition %): rollShock and the conditionAftermath Shock request card.
// Capture: npm run golden -- --capture esoteric-targets
const magic = (esl, name = "Arcana") => ({ name, category: "magic", esl });
const religion = (esl, name = "Solar Faith") => ({ name, category: "religion", esl });

const spellVariants = [
  ...[1, 2, 3, 4, 5, 6].map(level => [`esl-60-level-${level}`, { skill: magic(60), magicType: "Arcana", level }]),
  ["level-0", { skill: magic(60), magicType: "Arcana", level: 0 }],
  ["level-missing", { skill: magic(60), magicType: "Arcana" }],
  ["esl-120-level-1-above-cap", { skill: magic(120), magicType: "Arcana", level: 1 }],
  ["esl-100-level-2", { skill: magic(100), magicType: "Arcana", level: 2 }],
  ["esl-10-level-6-floor-0", { skill: magic(10), magicType: "Arcana", level: 6 }],
  ["esl-0-level-1", { skill: magic(0), magicType: "Arcana", level: 1 }],
  ["name-case-insensitive", { skill: magic(55), magicType: "  arcana ", level: 2 }],
  ["only-skill-of-category-used", { skill: magic(55), magicType: "Other School", level: 2 }],
  ["no-skill", { skill: null, magicType: "Arcana", level: 2 }]
];
const invocationVariants = [
  ...[1, 2, 3, 4, 5].map(circle => [`esl-60-circle-${circle}`, { skill: religion(60), religion: "Solar Faith", circle }]),
  ["circle-0", { skill: religion(60), religion: "Solar Faith", circle: 0 }],
  ["esl-110-circle-1-above-cap", { skill: religion(110), religion: "Solar Faith", circle: 1 }],
  ["esl-100-circle-1", { skill: religion(100), religion: "Solar Faith", circle: 1 }],
  ["esl-3-circle-1-floor-0", { skill: religion(3), religion: "Solar Faith", circle: 1 }],
  ["all-invocation-only-skill", { skill: religion(45), religion: "All", circle: 2 }],
  ["no-skill", { skill: null, religion: "Solar Faith", circle: 1 }]
];

const cases = [];
for (const consumer of ["spellRoll", "spellSheet"]) for (const [id, input] of spellVariants) cases.push({ id: `${consumer}-${id}`, input: { consumer, ...input } });
for (const consumer of ["invocationRoll", "invocationSheet"]) for (const [id, input] of invocationVariants) cases.push({ id: `${consumer}-${id}`, input: { consumer, ...input } });
for (const pct of [100, 60, 48, 47, 25, 24, 10, 1, 0, -5]) cases.push({ id: `shockRoll-pct-${pct}`, input: { consumer: "shockRoll", conditionPct: pct } });
cases.push({ id: "shockRoll-condition-missing", input: { consumer: "shockRoll" } });
for (const [pct, value] of [[25, 3], [24, 3], [10, 1], [1, 1], [26, 4], [50, 6], [100, 12]]) {
  cases.push({ id: `shockRequest-pct-${pct}`, input: { consumer: "shockRequest", conditionPct: pct, conditionValue: value } });
}
cases.push({ id: "shockRequest-condition-0-no-request", input: { consumer: "shockRequest", conditionPct: 0, conditionValue: 0 } });
cases.push({ id: "shockRequest-not-new-wound", input: { consumer: "shockRequest", conditionPct: 10, conditionValue: 1, newWound: false } });

export { cases };
