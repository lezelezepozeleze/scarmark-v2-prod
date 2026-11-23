// Inputs for tests/golden/strike.json (helpers/combat/strike.mjs postStrike: hit location, armor, armor piercing, impact bonus, wound level, amputation, vital wounds, armor wear, forced tests).
// strikeRoll = scripted total of the Nd6 strike roll; locationRandom / wearRandom = the Math.random values of the location pick and the 50/50 wear decision (omitted when the code does not draw one).
// Location data is the canonical SCARMARK.armorLocations entry at capture time, frozen into the fixture.
// Capture: npm run golden -- --capture strike
import { SCARMARK } from "../../../module/config.mjs";
import { seededRandom } from "../../support/random.mjs";

const loc = (type, name) => {
  const c = SCARMARK.armorLocations[type];
  return { name, system: { locationType: type, aim: { ...c.aim }, injury: { ...c.injury }, risk: { ...c.risk } } };
};
const piece = (o = {}) => ({
  name: o.name ?? "Helm", quality: 3, layer: 3, carried: true, quantity: 1, weight: 0, locations: ["head"],
  protection: { blunt: 4, edged: 5, piercing: 3, fire: 2 }, ...o
});
const HUMANOID = [
  loc("head", "Head"), loc("neck", "Neck"), loc("shoulder", "Left Shoulder"), loc("shoulder", "Right Shoulder"),
  loc("arm", "Left Arm"), loc("arm", "Right Arm"), loc("hand", "Left Hand"), loc("hand", "Right Hand"),
  loc("chest", "Chest"), loc("belly", "Belly"), loc("hip", "Left Hip"), loc("hip", "Right Hip"),
  loc("thigh", "Left Thigh"), loc("thigh", "Right Thigh"), loc("shin", "Left Shin"), loc("shin", "Right Shin")
];
const base = { aspect: "blunt", impact: 4, strikeDice: 2, strikeRoll: 7, aim: "mid", skill: "close", armorPiercing: false, locationRandom: 0.5 };
const one = (type, name, o = {}) => ({ ...base, locations: [loc(type, name)], ...o });

const cases = [];
const add = (id, input) => cases.push({ id, input });

// Wound level thresholds, core scale (head) and limb scale (arm): effective impact = impact + strikeRoll (no armor).
for (const eff of [0, 1, 4, 5, 8, 9, 12, 13, 16, 17, 25]) {
  const strikeRoll = Math.min(eff, 6);
  add(`threshold-core-head-eff-${eff}`, one("head", "Head", { impact: eff - strikeRoll, strikeRoll }));
  add(`threshold-limb-thigh-eff-${eff}`, one("thigh", "Left Thigh", { impact: eff - strikeRoll, strikeRoll }));
}
add("threshold-armor-exceeds-impact-floor-0", one("head", "Head", { impact: 1, strikeRoll: 2, armor: [piece({ protection: { blunt: 9, edged: 9, piercing: 9, fire: 9 } })], wearRandom: 0.9 }));

// Strike dice and aspects
add("strike-3d6-edged", one("chest", "Chest", { aspect: "edged", impact: 5, strikeDice: 3, strikeRoll: 11 }));
add("piercing-severe-heavy-bleeding", one("chest", "Chest", { aspect: "piercing", impact: 6, strikeRoll: 6 }));
add("fire-dire-chest-vital-out", one("chest", "Chest", { aspect: "fire", impact: 8, strikeRoll: 6 }));
add("blunt-mortal-head-vital-dying", one("head", "Head", { aspect: "blunt", impact: 12, strikeRoll: 6 }));

// Armor and armor piercing
add("armor-subtracted", one("head", "Head", { aspect: "edged", impact: 8, strikeRoll: 6, armor: [piece()], wearRandom: 0.9 }));
add("ap-piercing-halves-5-to-2", one("head", "Head", { aspect: "piercing", impact: 8, strikeRoll: 6, armorPiercing: true, armor: [piece({ protection: { piercing: 5 } })], wearRandom: 0.9 }));
add("ap-piercing-halves-7-to-3", one("head", "Head", { aspect: "piercing", impact: 8, strikeRoll: 6, armorPiercing: true, armor: [piece({ protection: { piercing: 7 } })], wearRandom: 0.9 }));
add("ap-piercing-halves-1-to-0", one("head", "Head", { aspect: "piercing", impact: 8, strikeRoll: 6, armorPiercing: true, armor: [piece({ protection: { piercing: 1 } })], wearRandom: 0.9 }));
add("ap-flag-on-edged-no-halving", one("head", "Head", { aspect: "edged", impact: 8, strikeRoll: 6, armorPiercing: true, armor: [piece({ protection: { edged: 7 } })], wearRandom: 0.9 }));
add("ap-flag-off-piercing-full-armor", one("head", "Head", { aspect: "piercing", impact: 8, strikeRoll: 6, armorPiercing: false, armor: [piece({ protection: { piercing: 7 } })], wearRandom: 0.9 }));
add("armor-destroyed-and-natural", one("head", "Head", { impact: 8, strikeRoll: 6, armor: [piece({ quality: 0 }), piece({ name: "Hide", quality: -1, layer: 0, protection: { blunt: 2 } })] }));
add("armor-packed-in-container", one("head", "Head", { impact: 8, strikeRoll: 6, container: true, armor: [piece({ container: "bag" })] }));

// Attacker Impact modifier (Close / Unarmed only)
add("impact-bonus-close", one("chest", "Chest", { impact: 4, strikeRoll: 6, skill: "close", attackerMods: { impact: 3 } }));
add("impact-bonus-unarmed", one("chest", "Chest", { impact: 4, strikeRoll: 6, skill: "unarmed", attackerMods: { impact: 3 } }));
add("impact-malus-close", one("chest", "Chest", { impact: 4, strikeRoll: 6, skill: "close", attackerMods: { impact: -2 } }));
add("impact-bonus-ignored-ranged", one("chest", "Chest", { impact: 4, strikeRoll: 6, skill: "ranged", attackerMods: { impact: 3 } }));
add("impact-bonus-ignored-arcane", one("chest", "Chest", { impact: 4, strikeRoll: 6, skill: "arcane", attackerMods: { impact: 3 } }));
add("impact-bonus-no-mods", one("chest", "Chest", { impact: 4, strikeRoll: 6, skill: "close" }));

// Amputation, vital wounds, forced tests
add("edged-dire-arm-amputates", one("arm", "Left Arm", { aspect: "edged", impact: 12, strikeRoll: 6 }));
add("edged-severe-arm-no-amputation-fumble", one("arm", "Left Arm", { aspect: "edged", impact: 7, strikeRoll: 6 }));
add("edged-heavy-arm-no-fumble", one("arm", "Left Arm", { aspect: "edged", impact: 3, strikeRoll: 6 }));
add("edged-dire-neck-amputates-dying", one("neck", "Neck", { aspect: "edged", impact: 7, strikeRoll: 6 }));
add("edged-dire-chest-no-amputate-flag", one("chest", "Chest", { aspect: "edged", impact: 7, strikeRoll: 6 }));
add("piercing-dire-arm-no-amputation-type", one("arm", "Left Arm", { aspect: "piercing", impact: 12, strikeRoll: 6 }));
add("hand-light-fumble", one("hand", "Right Hand", { impact: 0, strikeRoll: 2 }));
add("shin-light-stumble", one("shin", "Left Shin", { impact: 0, strikeRoll: 2 }));
add("head-light-no-stun", one("head", "Head", { impact: 0, strikeRoll: 2 }));
add("head-heavy-stun", one("head", "Head", { impact: 3, strikeRoll: 2 }));
add("legacy-location-type-forearm", ({ ...base, aspect: "edged", impact: 7, strikeRoll: 6, locations: [{ name: "Forearm", system: { locationType: "forearm", aim: { high: 30, medium: 10, low: 0 }, injury: { t1: 1, t5: 1, t9: 2, t13: 3, t17: 4 }, risk: { fumble: true, stumble: false, amputate: true } } }] }));
add("location-injury-entries-missing", ({ ...base, impact: 6, strikeRoll: 6, locations: [{ name: "Odd", system: { locationType: "head", aim: { medium: 10 }, injury: {}, risk: {} } }] }));

// Armor wear (50/50 decision, highest layer with AQ >= 1 wears)
add("wear-roll-0.49-worn", one("head", "Head", { impact: 8, strikeRoll: 6, armor: [piece()], wearRandom: 0.49 }));
add("wear-roll-0.5-spared", one("head", "Head", { impact: 8, strikeRoll: 6, armor: [piece()], wearRandom: 0.5 }));
add("wear-roll-0-worn", one("head", "Head", { impact: 8, strikeRoll: 6, armor: [piece()], wearRandom: 0 }));
add("wear-aq-1-destroyed", one("head", "Head", { impact: 8, strikeRoll: 6, armor: [piece({ quality: 1 })], wearRandom: 0.2 }));
add("wear-highest-layer", one("head", "Head", { impact: 8, strikeRoll: 6, armor: [piece({ name: "Coif", layer: 4 }), piece({ name: "Cap", layer: 2 }), piece({ name: "Plate Helm", layer: 5, quality: 0 })], wearRandom: 0.2 }));
add("wear-natural-never", one("head", "Head", { impact: 8, strikeRoll: 6, armor: [piece({ name: "Hide", quality: -1 })] }));
add("wear-on-armor-stopped-hit", one("head", "Head", { impact: 0, strikeRoll: 2, armor: [piece()], wearRandom: 0.1 }));
add("wear-armor-not-covering", one("chest", "Chest", { impact: 8, strikeRoll: 6, armor: [piece()] }));

// Hit location selection (weights split across same-type items; zone by aim; disarm = the called hand)
const rnd = seededRandom(7);
const sweep = [0, 0.0001, 0.999999, ...Array.from({ length: 12 }, () => Math.round(rnd() * 1e6) / 1e6)];
for (const r of sweep) add(`location-mid-r-${r}`, { ...base, impact: 0, strikeRoll: 2, locations: HUMANOID, locationRandom: r });
for (const r of [0.05, 0.3, 0.6, 0.95]) {
  add(`location-high-r-${r}`, { ...base, impact: 0, strikeRoll: 2, aim: "high", locations: HUMANOID, locationRandom: r });
  add(`location-low-r-${r}`, { ...base, impact: 0, strikeRoll: 2, aim: "low", locations: HUMANOID, locationRandom: r });
  // Disarm names a hand (approved change: it used to pick either hand by weight).
  add(`location-disarm-left-r-${r}`, { ...base, impact: 0, strikeRoll: 2, aim: "disarm", part: "leftHand", locations: HUMANOID, locationRandom: r });
  add(`location-disarm-right-r-${r}`, { ...base, impact: 0, strikeRoll: 2, aim: "disarm", part: "rightHand", locations: HUMANOID, locationRandom: r });
}
add("location-disarm-no-hands-keeps-all", { ...base, impact: 0, strikeRoll: 2, aim: "disarm", locations: [loc("head", "Head"), loc("chest", "Chest")], locationRandom: 0.7 });
add("location-unknown-aim-falls-back-mid", { ...base, impact: 0, strikeRoll: 2, aim: "sideways", locations: [loc("head", "Head"), loc("chest", "Chest")], locationRandom: 0.7 });
add("location-zero-total-weight-first", { ...base, impact: 0, strikeRoll: 2, aim: "high", locations: [loc("shin", "Left Shin"), loc("thigh", "Left Thigh")], locationRandom: undefined });
add("no-locations", { ...base, locations: [], locationRandom: undefined });

export { cases };
