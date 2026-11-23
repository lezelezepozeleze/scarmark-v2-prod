/** What a new actor starts with. Pure data. */

// Default Armor Location body plans, added automatically to a brand-new Actor (see DEFAULT_LOCATION_PLANS).
// Each entry is [display name, canonical locationType key]. Two-sided parts are listed twice (Right/Left) sharing one locationType - rollStrikeLocation splits the aim weight across the pair at strike time.
// Humanoid: 16 locations of 10 types (since 1.0.39).
const HUMANOID_LOCATIONS = [
  ["Head", "head"], ["Neck", "neck"],
  ["Right Shoulder", "shoulder"], ["Left Shoulder", "shoulder"],
  ["Right Arm", "arm"], ["Left Arm", "arm"],
  ["Right Hand", "hand"], ["Left Hand", "hand"],
  ["Chest", "chest"], ["Belly", "belly"],
  ["Right Hip", "hip"], ["Left Hip", "hip"],
  ["Right Thigh", "thigh"], ["Left Thigh", "thigh"],
  ["Right Shin", "shin"], ["Left Shin", "shin"]
];

// Quadruped: 9 locations.
const QUADRUPED_LOCATIONS = [
  ["Creature Head", "creatureHead"], ["Creature Neck", "creatureNeck"],
  ["Creature Chest", "creatureChest"], ["Creature Belly", "creatureBelly"],
  ["Creature Right Fore Leg", "creatureForeLeg"], ["Creature Left Fore Leg", "creatureForeLeg"],
  ["Creature Right Hind Leg", "creatureHindLeg"], ["Creature Left Hind Leg", "creatureHindLeg"],
  ["Tail", "tail"]
];

/** [name, type] -> [name, type, side]: the side is the word Left or Right in the name ("" for a location with no side). */
const withSide = ([name, type]) => [name, type, name.match(/\b(Left|Right)\b/)?.[1].toLowerCase() ?? ""];

/** The default hit locations per actor type: [name, locationType, side] entries. */
export const DEFAULT_LOCATION_PLANS = {
  character: HUMANOID_LOCATIONS.map(withSide),
  npc: HUMANOID_LOCATIONS.map(withSide),
  creature: HUMANOID_LOCATIONS.map(withSide),
  animal: QUADRUPED_LOCATIONS.map(withSide)
};

/** The skills the rules look up by name: Dodge (defense rolls, the Combat tab) and Initiative (the combat tracker). They use the Skills compendium spelling; matching is case-insensitive. */
export const DODGE_SKILL = "Dodge";
export const INITIATIVE_SKILL = "Initiative";

// Characters and NPCs; creatures get their own list below. Skills were reduced in 1.0.52 (D. 2026-11-20): most former skills are now an attribute roll with a multiplier, so only combat, Vitality, Stealth and Physician stay as defaults.
const HUMANOID_SKILLS = [
  "Vitality", "Stealth",
  "Close Combat", DODGE_SKILL, INITIATIVE_SKILL, "Ranged Combat", "Unarmed Combat",
  "Physician"
];

/**
 * Base skills copied from the Skills compendium onto a new actor, per actor type, in display order. Names use the compendium spelling; matching is normalized (case, whitespace, dash variants).
 * MOBILITY is gone: movement per round = AGL metres, a former Mobility roll is an AGL x 3 attribute test. AWARENESS and AWARENESS - PASSIVE are gone too (1.0.36): the Awareness / Passive Awareness macros test PER x 5 / x 3.
 */
export const BASE_SKILLS = {
  character: HUMANOID_SKILLS,
  npc: HUMANOID_SKILLS,
  creature: [
    "Vitality", "Stealth",
    DODGE_SKILL, INITIATIVE_SKILL, "Close Combat",
    "Ranged Combat", "Unarmed Combat"
  ],
  animal: [
    "Vitality", "Stealth",
    DODGE_SKILL, INITIATIVE_SKILL, "Ranged Combat",
    "Unarmed Combat"
  ]
};
