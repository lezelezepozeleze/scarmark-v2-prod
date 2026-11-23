// Inputs for tests/golden/actor-derived.json (data/base-actor-schema.mjs applyDerivedCombat through each actor type's data model).
// attributes = stored bases; attributeEffects / fatigueEffect / mods = Active Effect (Add) contributions; skillOverrides = Override effects on system.mods.skill.<name>.
// metricUnits: true = 1 weight unit per kg, false = 2 per kg, omitted = setting not registered.
// Capture: npm run golden -- --capture actor-derived
const STD = { str: 12, sta: 11, dex: 14, agl: 10, wil: 13, per: 9, pre: 8, int: 15, spi: 7 };
const attrs = (o = {}) => Object.fromEntries(Object.entries({ ...STD, ...o }).map(([k, v]) => [k, { base: v }]));
const noPre = (o = {}) => { const a = attrs(o); delete a.pre; return a; };

const gear = (weight, o = {}) => ({ type: "gear", name: o.name ?? `Gear ${weight}`, id: o.id, system: { weight, quantity: 1, value: 0, carried: true, container: "", ...o.system } });
const injury = (woundLevel, o = {}) => ({ type: "injury", name: o.name ?? `Wound ${woundLevel}`, system: { woundLevel, heavyBleeding: false, vital: "", mend: 0, ...o } });
const skill = (name, o = {}) => ({ type: "skill", name, system: { category: "physical", attribute1: "str", attribute2: "dex", attribute3: "agl", level: 30, sunsignBonuses: [], ...o } });
const psionic = (name, o = {}) => ({ type: "psionic", name, system: { attribute1: "spi", attribute2: "spi", attribute3: "wil", level: 20, sunsignBonuses: [], ...o } });

const ch = (o = {}) => ({ actorType: "character", attributes: attrs(), fatigue: 0, metricUnits: true, dobMonth: "", items: [], ...o });

export const cases = [
  { id: "character-baseline", input: ch() },
  { id: "character-baseline-with-skills", input: ch({ items: [skill("Climbing"), skill("Lore", { category: "craft", attribute1: "int", attribute2: "per", attribute3: "wil", level: 25 })] }) },

  // Fatigue
  { id: "fatigue-1-no-penalty", input: ch({ fatigue: 1, items: [skill("Climbing")] }) },
  { id: "fatigue-2-penalty-1", input: ch({ fatigue: 2, items: [skill("Climbing")] }) },
  { id: "fatigue-5-penalty-2", input: ch({ fatigue: 5, items: [skill("Climbing")] }) },
  { id: "fatigue-30-floors-attributes", input: ch({ fatigue: 30, items: [skill("Climbing")] }) },
  { id: "fatigue-negative", input: ch({ fatigue: -3 }) },
  { id: "fatigue-missing", input: ch({ fatigue: undefined }) },
  { id: "fatigue-from-effect", input: ch({ fatigue: 1, fatigueEffect: 3, items: [skill("Climbing")] }) },

  // Endurance
  { id: "endurance-rounding", input: ch({ attributes: attrs({ str: 10, sta: 10, wil: 11 }) }) },
  { id: "endurance-mod-plus-2", input: ch({ mods: { endurance: 2 } }) },
  { id: "endurance-mod-floor-0", input: ch({ mods: { endurance: -100 } }) },
  { id: "endurance-attribute-effect", input: ch({ attributeEffects: { str: 3, wil: -2 }, items: [skill("Climbing"), skill("Willpower", { attribute1: "wil", attribute2: "wil", attribute3: "int" })] }) },

  // Load / encumbrance
  { id: "load-at-capacity-metric", input: ch({ items: [gear(23)] }) },
  { id: "load-20pct-over-exact", input: ch({ attributes: attrs({ str: 13, sta: 12 }), items: [gear(30)] }) },
  { id: "load-30pct-over", input: ch({ items: [gear(30)] }) },
  { id: "load-max-steps-and-over-max", input: ch({ items: [gear(100)], fatigue: 0 }) },
  { id: "load-legacy-units-2-per-kg", input: ch({ metricUnits: false, items: [gear(46), gear(10)] }) },
  { id: "load-setting-unregistered", input: ch({ metricUnits: undefined, items: [gear(46), gear(10)] }) },
  { id: "load-fractional-kg", input: ch({ items: [gear(0.1), gear(0.2), gear(23.7)] }) },
  { id: "load-capacity-0-no-load", input: ch({ attributes: attrs({ str: 0, sta: 0 }) }) },
  { id: "load-capacity-0-with-load", input: ch({ attributes: attrs({ str: 0, sta: 0 }), items: [gear(1)] }) },
  { id: "load-capacity-uses-effects-not-penalties", input: ch({ fatigue: 6, attributeEffects: { str: 5 }, items: [gear(28)] }) },
  { id: "load-categories", input: ch({ items: [
    { type: "weapon", name: "Sword", system: { weight: 2, quantity: 1, value: 0, carried: true, container: "" } },
    { type: "missile", name: "Arrows", system: { weight: 0.1, quantity: 20, value: 0, carried: true, container: "" } },
    { type: "armor", name: "Mail", system: { weight: 12, quantity: 1, value: 0, carried: true, container: "", locations: ["chest"] } },
    { type: "container", id: "pack", name: "Pack", system: { weight: 1.5, quantity: 1, value: 0, carried: true, maxCapacity: 30 } },
    gear(3, { name: "Rope", system: { container: "pack" } })
  ] }) },
  { id: "load-container-dropped", input: ch({ items: [
    { type: "container", id: "pack", name: "Pack", system: { weight: 1.5, quantity: 1, value: 0, carried: false, maxCapacity: 30 } },
    gear(10, { name: "Tent", system: { container: "pack" } }),
    gear(2, { name: "Torch" })
  ] }) },
  { id: "load-container-id-missing", input: ch({ items: [gear(10, { name: "Tent", system: { container: "gone" } })] }) },
  { id: "load-not-carried", input: ch({ items: [gear(10, { system: { carried: false } }), gear(5, { system: { quantity: 3 } })] }) },

  // Condition and bands
  { id: "condition-wl-3", input: ch({ items: [injury(3)] }) },
  { id: "condition-band-wounded-at-50pct", input: ch({ attributes: attrs({ str: 12, sta: 12, wil: 12 }), items: [injury(6), skill("Climbing")] }) },
  { id: "condition-band-critical-at-25pct", input: ch({ attributes: attrs({ str: 12, sta: 12, wil: 12 }), items: [injury(5), injury(4), skill("Climbing")] }) },
  { id: "condition-just-above-25pct", input: ch({ attributes: attrs({ str: 12, sta: 12, wil: 12 }), items: [injury(8)] }) },
  { id: "condition-0-out", input: ch({ attributes: attrs({ str: 12, sta: 12, wil: 12 }), items: [injury(5), injury(5), injury(5)] }) },
  { id: "condition-vital-out", input: ch({ items: [injury(4, { vital: "out" })] }) },
  { id: "condition-vital-dying-beats-out", input: ch({ items: [injury(4, { vital: "out" }), injury(5, { vital: "dying", heavyBleeding: true })] }) },
  { id: "condition-heavy-bleed-count", input: ch({ items: [injury(2, { heavyBleeding: true }), injury(3, { heavyBleeding: true }), injury(1)] }) },
  { id: "condition-mods-injury", input: ch({ items: [injury(2)], mods: { injury: 3 } }) },
  { id: "condition-mods-injury-negative-floor", input: ch({ items: [injury(2)], mods: { injury: -5 } }) },
  { id: "condition-endurance-0", input: ch({ attributes: attrs({ str: 0, sta: 0, wil: 0 }) }) },
  { id: "condition-wound-level-missing", input: ch({ items: [{ type: "injury", name: "Odd", system: { mend: 0 } }] }) },

  // Skills: zodiac, mods, SB delta, overrides
  { id: "skill-zodiac-bonus", input: ch({ dobMonth: "jan", items: [skill("Climbing", { sunsignBonuses: [{ sunsign: "capricornus", bonus: 5 }, { sunsign: "aries", bonus: 9 }] })] }) },
  { id: "skill-zodiac-other-sign", input: ch({ dobMonth: "apr", items: [skill("Climbing", { sunsignBonuses: [{ sunsign: "capricornus", bonus: 5 }] })] }) },
  { id: "skill-zodiac-blank-entry", input: ch({ dobMonth: "", items: [skill("Climbing", { sunsignBonuses: [{ sunsign: "", bonus: 4 }] })] }) },
  { id: "skill-category-mod", input: ch({ mods: { skills: { physical: 3, craft: -4 } }, items: [skill("Climbing"), skill("Lore", { category: "craft" })] }) },
  { id: "skill-named-mod-case-insensitive", input: ch({ mods: { skill: { "CLIMBING": 4, "lore": 2 } }, items: [skill("Climbing"), skill("Lore", { category: "craft" })] }) },
  { id: "skill-sb-delta-effect", input: ch({ attributeEffects: { str: 3 }, items: [skill("Climbing")] }) },
  { id: "skill-sb-delta-rounding", input: ch({ attributeEffects: { str: 1 }, items: [skill("Climbing")] }) },
  { id: "skill-sb-delta-negative-to-floor", input: ch({ fatigue: 40, items: [skill("Climbing", { level: 5 })] }) },
  { id: "skill-level-0", input: ch({ items: [skill("Climbing", { level: 0 })] }) },
  { id: "skill-level-missing", input: ch({ items: [skill("Climbing", { level: undefined })] }) },
  { id: "skill-unknown-category", input: ch({ items: [skill("Odd", { category: "weird" })] }) },
  { id: "skill-override", input: ch({ items: [skill("Vitality", { level: 20 })], skillOverrides: [{ skill: "Vitality", value: 50, priority: 50 }] }) },
  { id: "skill-override-priority-highest-wins", input: ch({ items: [skill("Vitality")], skillOverrides: [{ skill: "Vitality", value: 70, priority: 60 }, { skill: "vitality", value: 40, priority: 10 }] }) },
  { id: "skill-override-priority-missing-is-50", input: ch({ items: [skill("Vitality")], skillOverrides: [{ skill: "Vitality", value: 70 }, { skill: "Vitality", value: 40, priority: 49 }] }) },
  { id: "skill-override-negative-floor", input: ch({ items: [skill("Vitality")], skillOverrides: [{ skill: "Vitality", value: -10, priority: 50 }] }) },
  { id: "skill-override-not-a-number-ignored", input: ch({ items: [skill("Vitality")], skillOverrides: [{ skill: "Vitality", value: "abc", priority: 50 }] }) },
  { id: "skill-add-type-not-an-override", input: ch({ items: [skill("Vitality")], skillOverrides: [{ type: "add", skill: "Vitality", value: 70, priority: 50 }] }) },
  { id: "psionic-mod-and-sb-delta", input: ch({ mods: { skills: { psionic: 6, physical: 3 } }, attributeEffects: { spi: 3 }, items: [psionic("Telepathy")] }) },
  { id: "psionic-zodiac", input: ch({ dobMonth: "feb", items: [psionic("Telepathy", { sunsignBonuses: [{ sunsign: "aquarius", bonus: 3 }] })] }) },

  // Wound band penalty on DEX / AGL, load on AGL, all combined
  { id: "combined-fatigue-load-wounds", input: ch({ fatigue: 4, attributeEffects: { dex: 2 }, items: [gear(30), injury(8), skill("Climbing"), skill("Juggling", { attribute1: "dex", attribute2: "dex", attribute3: "per" })] }) },

  // Attribute edge cases
  { id: "attribute-missing-agl", input: ch({ attributes: (() => { const a = attrs(); delete a.agl; return a; })(), items: [skill("Climbing")] }) },
  { id: "attribute-stray-legacy-key", input: ch({ attributes: { ...attrs(), eye: { base: 12 } } }) },
  { id: "attribute-all-zero", input: ch({ attributes: attrs({ str: 0, sta: 0, dex: 0, agl: 0, wil: 0, per: 0, pre: 0, int: 0, spi: 0 }), items: [skill("Climbing")] }) },
  { id: "attribute-high", input: ch({ attributes: attrs({ str: 30, sta: 30, dex: 30, agl: 30, wil: 30 }), items: [skill("Climbing", { level: 90 })] }) },
  { id: "resources-missing", input: ch({ noResources: true }) },

  // Other actor types
  { id: "npc-baseline", input: { ...ch({ items: [skill("Climbing", { sunsignBonuses: [{ sunsign: "capricornus", bonus: 5 }] })] }), actorType: "npc", dobMonth: undefined } },
  { id: "creature-baseline", input: { actorType: "creature", attributes: noPre(), fatigue: 0, metricUnits: true, items: [skill("Climbing"), skill("Charm", { category: "communication", attribute1: "pre", attribute2: "int", attribute3: "wil" })] } },
  { id: "creature-skill-on-presence-no-sb-delta", input: { actorType: "creature", attributes: noPre(), fatigue: 4, metricUnits: true, items: [skill("Charm", { category: "communication", attribute1: "pre", attribute2: "int", attribute3: "wil" })] } },
  { id: "creature-wounded-loaded", input: { actorType: "creature", attributes: noPre({ str: 20, sta: 18, wil: 10 }), fatigue: 2, metricUnits: false, items: [gear(90), injury(10), skill("Bite", { category: "combat" })] } },
  { id: "animal-baseline", input: { actorType: "animal", attributes: noPre({ str: 16, sta: 14, agl: 15 }), fatigue: 3, metricUnits: true, items: [gear(40), injury(4), skill("Running", { attribute1: "agl", attribute2: "sta", attribute3: "sta" })] } }
];
