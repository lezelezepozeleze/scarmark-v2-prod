/** Combat values: shields, armor wear and piercing, outnumbered steps, strike dice, aim and range penalties, clash and round values. Pure data. */

/**
 * Shields (by weapon-item name) allowed to Block a missile. Round/Kite/Heater/
 * Pavise block any velocity; the Buckler adds only against Low-Velocity missiles.
 */
export const RANGED_BLOCK_SHIELDS = {
  always: ["Round Shield", "Kite Shield", "Heater Shield", "Pavise"],
  lowVelocityOnly: ["Buckler"]
};

/**
 * Armor-Piercing detection by NAME (no per-item flag): a weapon/missile whose
 * name matches this pattern HALVES the struck location's Point (piercing) armor
 * on a piercing strike. Extend the alternation to add more AP keywords.
 */
export const ARMOR_PIERCING_NAMES = /bodkin/i;

/**
 * Outnumbered (defense only): the penalty for a number of attackers. Checked in order, the first match wins.
 * `orMore` steps match that many attackers or more; the others need exactly that number (so 2.5 matches nothing).
 */
export const OUTNUMBERED_STEPS = [
  { attackers: 3, orMore: true, penalty: 30 },
  { attackers: 2, orMore: false, penalty: 20 }
];

/** d6 a successful strike rolls: a Critical Success rolls CRITICAL, any other success NORMAL. */
export const STRIKE_DICE = { critical: 3, normal: 2 };

/** Shock Roll target = SHOCK_TARGET_FACTOR x Condition %, capped at ESL_CAP. */
export const SHOCK_TARGET_FACTOR = 2;

/** A hit that lands on worn armor wears one piece with this chance (0.5 = half of all hits). */
export const ARMOR_WEAR_CHANCE = 0.5;

/** An Armor-Piercing strike divides the struck location's Point armor by this (rounded down). */
export const ARMOR_PIERCING_DIVISOR = 2;

/** A High-Velocity Missile divides the defender's Dodge by this (rounded down). */
export const HIGH_VELOCITY_DODGE_DIVISOR = 2;

/** Combat round upkeep: Fatigue every actor gains, and Wound Levels a heavily bleeding injury gains. */
export const ROUND_FATIGUE = 1;
export const BLEEDING_WL_PER_ROUND = 1;

/** Success-level rank, lowest to highest: used to compare an attack roll with a defense roll. */
export const RANK = { cf: 0, mf: 1, ms: 2, cs: 3 };

/** Combat skills whose strikes take the attacker's Impact modifier (system.mods.impact). */
export const IMPACT_SKILLS = ["close", "unarmed"];

/** How far a 3d6 WQ test must overshoot WQ to destroy the item outright. */
export const WQ_BREAK_MARGIN = 4;

/**
 * Aimed strike options. `zone` is the zone used for the location roll and `penalty` the ASL penalty of aiming at the zone in general.
 * `general` (default true) offers "aim at the zone, roll the location"; a zone with general: false offers only its parts.
 * `parts` are the specific body parts the attacker can call in that zone: `types` are the location types that can be struck (one is picked by weight), `side` ("left" or "right", omit for any) narrows a sided type, and `penalty` is the TOTAL ASL penalty of that call (it replaces the zone penalty, it is not added to it).
 * The first part of a zone is the default one (Disarm starts on the right hand). A part whose location the target does not have (a creature has no "chest") falls back to the zone roll.
 */
export const AIM = {
  mid: {
    zone: "medium", penalty: 0,
    parts: {
      torso: { types: ["chest", "belly"], penalty: -15 },
      leftArm: { types: ["arm"], side: "left", penalty: -15 },
      rightArm: { types: ["arm"], side: "right", penalty: -15 },
      leftHand: { types: ["hand"], side: "left", penalty: -15 },
      rightHand: { types: ["hand"], side: "right", penalty: -15 }
    }
  },
  high: {
    zone: "high", penalty: -10,
    parts: {
      head: { types: ["head"], penalty: -15 },
      neck: { types: ["neck"], penalty: -15 },
      leftShoulder: { types: ["shoulder"], side: "left", penalty: -15 },
      rightShoulder: { types: ["shoulder"], side: "right", penalty: -15 }
    }
  },
  low: { zone: "low", penalty: -10, parts: {} },
  disarm: {
    zone: "medium", penalty: -20, general: false,
    parts: {
      rightHand: { types: ["hand"], side: "right", penalty: -20 },
      leftHand: { types: ["hand"], side: "left", penalty: -20 }
    }
  }
};

/** ASL penalty by range band of a missile attack. */
export const RANGE_PENALTY = { short: 0, medium: -10, long: -20, extreme: -40 };

/** Scarmark: 1 round ~ 1 minute, +ROUND_FATIGUE Fatigue per this many rounds of combat. */
export const FATIGUE_ROUND_INTERVAL = 5;

/** Weapon clash and break test (helpers/combat/clash.mjs). */
export const WQ_TEST_FORMULA = "3d6";
/** A blocked missile only makes the shield test when it hit with at least this Impact. */
export const BLOCK_CLASH_MIN_IMPACT = 5;

/** The combat skill a block with a body location (no weapon) rolls against: its ESL plus the actor's melee defense modifier, without the Defense and specialization of a weapon (helpers/combat/lookup.mjs armorBlockDsl). */
export const ARMOR_BLOCK_SKILL = "close";
/** A shield that rolled above its WQ loses this much WQ, never below SHIELD_MIN_WQ (0 is the body-part sentinel). */
export const SHIELD_WEAR_STEP = 1;
export const SHIELD_MIN_WQ = 1;
/** The strike a body part makes when it meets a blow: always Blunt, Impact 0, this many dice. */
export const BODY_PART_STRIKE = { aspect: "blunt", impact: 0, dice: STRIKE_DICE.normal };

/** The aim zone a strike location is rolled in when nothing else is chosen (and the fallback when a location has no weight for the chosen zone). */
export const DEFAULT_AIM_ZONE = "medium";
