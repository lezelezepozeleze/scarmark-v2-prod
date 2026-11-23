// Inputs for tests/golden/skill-base.json (Skill Base of skill and psionic items). Capture: npm run golden -- --capture skill-base
const attrs = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, { base: v }]));
const full = attrs({ str: 12, sta: 11, dex: 14, agl: 10, wil: 13, per: 9, pre: 8, int: 15, spi: 7 });

const variants = [
  ["normal", { attributes: full, skillAttributes: ["str", "dex", "agl"], level: 30 }],
  ["round-up", { attributes: attrs({ str: 12, dex: 13, agl: 13 }), skillAttributes: ["str", "dex", "agl"], level: 10 }],
  ["round-down", { attributes: attrs({ str: 12, dex: 12, agl: 13 }), skillAttributes: ["str", "dex", "agl"], level: 10 }],
  ["same-attribute-thrice", { attributes: full, skillAttributes: ["int", "int", "int"], level: 45 }],
  ["missing-attribute-counts-0", { attributes: attrs({ str: 12, sta: 11, dex: 14 }), skillAttributes: ["str", "dex", "pre"], level: 20 }],
  ["attribute-without-base", { attributes: { str: { base: 12 }, dex: {}, agl: { base: 10 } }, skillAttributes: ["str", "dex", "agl"], level: 20 }],
  ["all-zero", { attributes: attrs({ str: 0, dex: 0, agl: 0 }), skillAttributes: ["str", "dex", "agl"], level: 0 }],
  ["high-values", { attributes: attrs({ str: 30, dex: 29, agl: 31 }), skillAttributes: ["str", "dex", "agl"], level: 120 }],
  ["level-1", { attributes: full, skillAttributes: ["wil", "per", "spi"], level: 1 }],
  ["negative-level", { attributes: full, skillAttributes: ["wil", "per", "spi"], level: -5 }],
  ["missing-level", { attributes: full, skillAttributes: ["wil", "per", "spi"] }],
  ["not-embedded", { attributes: null, skillAttributes: ["str", "dex", "agl"], level: 25 }],
  ["negative-attribute", { attributes: attrs({ str: -3, dex: 6, agl: 6 }), skillAttributes: ["str", "dex", "agl"], level: 5 }]
];

export const cases = ["skill", "psionic"].flatMap(itemType =>
  variants.map(([id, input]) => ({ id: `${itemType}-${id}`, input: { itemType, ...input } })));
