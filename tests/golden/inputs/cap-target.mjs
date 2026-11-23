// Inputs for tests/golden/cap-target.json (helpers/chat.mjs capTarget). Capture: npm run golden -- --capture cap-target
export const cases = [-20, -1, 0, 1, 50, 94, 95, 96, 100, 150, 94.5, 95.5].map(target => ({ id: `target-${target}`, input: { target } }));
