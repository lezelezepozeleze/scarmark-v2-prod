// Inputs for tests/golden/outcome-level.json (helpers/chat.mjs outcomeLevel: d100 roll vs target). Capture: npm run golden -- --capture outcome-level
import { seededRandom } from "../../support/random.mjs";

const fixed = [
  [1, 50], [5, 50], [49, 50], [50, 50], [51, 50], [55, 50], [100, 50], [99, 50],
  [1, 0], [5, 0], [100, 95], [95, 95], [96, 95], [100, 100], [100, 120], [1, -10], [5, -10], [3, 1], [1, 1]
];
// A seeded sweep (values are frozen in the fixture; the generator only picks them).
const rnd = seededRandom(1001);
const sweep = Array.from({ length: 20 }, () => [1 + Math.floor(rnd() * 100), Math.floor(rnd() * 120) - 10]);

export const cases = [...fixed, ...sweep].map(([roll, target], i) => ({ id: `${String(i).padStart(2, "0")}-roll-${roll}-vs-${target}`, input: { roll, target } }));
