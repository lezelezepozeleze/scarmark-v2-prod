/** Hit locations: canonical armor-location definitions, legacy keys, forced-test locations. Pure data. */

/**
 * Canonical Armor Location definitions (10 humanoid types). Picking a
 * Location Type pre-fills a location's aim weights, wound levels and risk flags from
 * here (the values stay editable afterwards). This is how we avoid "custom" locations.
 *
 * Weights are the Mid hit chance x 10 for the WHOLE type (both sides together; a
 * two-sided pair splits it at strike time): Head 10 %, Neck 4, Shoulder 10, Arm 12,
 * Hand 6, Chest 16, Belly 12, Hip 6, Thigh 12, Shin 12 (the fatal share is 42 %).
 * High zone: the upper locations count triple and the lower ones zero; Low zone the
 * other way round; the trunk is the same in every zone. Combat strikes always aim
 * Mid; only the Injury roll uses the zones.
 *
 * Two wound scales, by Effective Impact (see INJURY_THRESHOLDS) -> Wound Level:
 *   core (head, neck, shoulder, chest, belly, hip, creature body): 1 2 3 4 5
 *   limb (arm, hand, thigh, shin, wing, tentacle, tail, creature legs): 1 1 2 3 4
 * A limb never reaches WL 5 by impact alone; only severing (an Edge wound on a
 * location with the Amputate flag) makes WL 5.
 */
const UPPER = "upper", MID = "mid", LOWER = "lower";
const WOUND_SCALES = {
  core: [1, 2, 3, 4, 5],
  limb: [1, 1, 2, 3, 4]
};
// [key, mediumWeight, region, woundScale, armChain, legChain, amputate]
// armChain / legChain are the `risk.fumble` / `risk.stumble` flags: they mark the arm and
// leg chains (a blocked limb strike is aimed at the arm chain) and are NOT the test sets below.
const LOCATIONS = [
  ["head",              100, UPPER, "core", false, false, false],
  ["neck",               40, UPPER, "core", false, false, true],
  ["shoulder",          100, UPPER, "core", true,  false, false],
  ["arm",               120, UPPER, "limb", true,  false, true],
  ["hand",               60, UPPER, "limb", true,  false, true],
  ["chest",             160, MID,   "core", false, false, false],
  ["belly",             120, MID,   "core", false, false, false],
  ["hip",                60, LOWER, "core", false, true,  false],
  ["thigh",             120, LOWER, "limb", false, true,  true],
  ["shin",              120, LOWER, "limb", false, true,  true],
  ["wing",               20, UPPER, "limb", true,  false, true],
  ["tentacle",           20, UPPER, "limb", true,  false, true],
  ["tail",               20, LOWER, "limb", false, true,  true],
  ["creatureHead",      130, UPPER, "core", false, false, false],
  ["creatureNeck",       90, UPPER, "core", false, false, true],
  ["creatureForeLeg",    80, LOWER, "limb", false, true,  true],
  ["creatureHindLeg",    80, LOWER, "limb", false, true,  true],
  ["creatureChest",     250, MID,   "core", false, false, false],
  ["creatureBelly",     250, MID,   "core", false, false, false]
];
export const ARMOR_LOCATIONS = {};
for (const [key, w, region, scale, armChain, legChain, amputate] of LOCATIONS) {
  const high = region === UPPER ? w * 3 : region === LOWER ? 0 : w;
  const low = region === LOWER ? w * 3 : region === UPPER ? 0 : w;
  const [t1, t5, t9, t13, t17] = WOUND_SCALES[scale];
  ARMOR_LOCATIONS[key] = {
    label: `SCARMARK.ArmorLocation.type.${key}`,
    aim: { high, medium: w, low },
    injury: { t1, t5, t9, t13, t17 },
    risk: { fumble: armChain, stumble: legChain, amputate }
  };
}

/**
 * Effective Impact needed for each injury threshold of an Armor Location
 * (injury.t1 ... injury.t17). Highest threshold reached wins.
 */
export const INJURY_THRESHOLDS = [
  { key: "t17", impact: 17 },
  { key: "t13", impact: 13 },
  { key: "t9", impact: 9 },
  { key: "t5", impact: 5 },
  { key: "t1", impact: 1 }
];

/**
 * The location types of before 1.0.39 (humanoid) and 1.0.40 (creature Thorax and Abdomen
 * became Chest and Belly) and the type each one became. Types not listed
 * did not change. Old records are NOT rewritten when they load (the old migrate-hit-locations.js macro, now only in git history, needed the old keys); the code reads an old key as its new one through locationKey and covers (rules/locations.mjs).
 */
export const LEGACY_LOCATION_MAP = {
  skull: "head", face: "head",
  upperArm: "arm", elbow: "arm", forearm: "arm",
  thorax: "chest",
  abdomen: "belly", groin: "belly",
  knee: "shin", calf: "shin", foot: "shin",
  creatureThorax: "creatureChest", creatureAbdomen: "creatureBelly"
};

/**
 * Locations whose WOUND forces an automatic combat test, with the lowest Wound Level
 * that forces it (Fumble F3):
 *  - Fumble  (drop the weapon)      : Hand, any wound; Arm, from Severe (WL 3)
 *  - Stumble (fall Prone on a fail) : Thigh and Shin, any wound
 * Keyed by locationType. Deliberately NOT the same as the `risk.fumble` / `risk.stumble`
 * chain flags above.
 */
export const FUMBLE_TEST_LOCATIONS = { hand: 1, arm: 3 };
export const STUMBLE_TEST_LOCATIONS = { thigh: 1, shin: 1 };

/** The two sides of a location that exists on the left and on the right. */
export const LOCATION_SIDES = ["left", "right"];

/**
 * The location types that exist on the left and on the right. A piece of armor covers one of them with an entry { type, side } (side "left" or "right"), or both sides with an entry whose side is "".
 */
export const SIDED_TYPES = ["shoulder", "arm", "hand", "hip", "thigh", "shin", "wing", "creatureForeLeg", "creatureHindLeg"];

/**
 * The keys armor used to cover one side before the coverage entries existed (a Set of keys, "leftArm"): key -> { type, side }. Only the migration of old armor reads it (rules/locations.mjs legacyCoverage).
 */
export const LEGACY_SIDED_KEYS = {
  leftShoulder: { type: "shoulder", side: "left" },
  rightShoulder: { type: "shoulder", side: "right" },
  leftArm: { type: "arm", side: "left" },
  rightArm: { type: "arm", side: "right" },
  leftHand: { type: "hand", side: "left" },
  rightHand: { type: "hand", side: "right" },
  leftHip: { type: "hip", side: "left" },
  rightHip: { type: "hip", side: "right" },
  leftThigh: { type: "thigh", side: "left" },
  rightThigh: { type: "thigh", side: "right" },
  leftShin: { type: "shin", side: "left" },
  rightShin: { type: "shin", side: "right" },
  leftWing: { type: "wing", side: "left" },
  rightWing: { type: "wing", side: "right" },
  creatureLeftForeLeg: { type: "creatureForeLeg", side: "left" },
  creatureRightForeLeg: { type: "creatureForeLeg", side: "right" },
  creatureLeftHindLeg: { type: "creatureHindLeg", side: "left" },
  creatureRightHindLeg: { type: "creatureHindLeg", side: "right" }
};
