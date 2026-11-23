/** Wound Levels, injuries, vital wounds, mend rates and the Stun Test. Pure data. */

/** Wound Level range: the injury catalog knows 1 to MAX_WOUND_LEVEL; 0 means no wound. Amputation sets the highest level. */
export const MIN_WOUND_LEVEL = 1;
export const MAX_WOUND_LEVEL = 5;
export const AMPUTATION_WOUND_LEVEL = MAX_WOUND_LEVEL;

/**
 * Wound Levels an Armor Location can give at its impact thresholds (0 = no wound): 0 to MAX_WOUND_LEVEL.
 * Since 1.0.39 the location stores the Wound Level as a plain number. Macros may read it as SCARMARK.woundLevels.
 */
export const WOUND_LEVELS = Array.from({ length: MAX_WOUND_LEVEL + 1 }, (_, level) => level);

/**
 * Vital wounds: a Dire (WL 4) or Mortal (WL 5) wound to these
 * locations takes the victim out at once, whatever their Condition. "out" = knocked
 * out (Condition 0), "dying" = unconscious and dying without care. Humanoid
 * locations only for now (Head = the old Skull and Face, Belly = the old Abdomen and Groin).
 */
export const VITAL_WOUNDS = {
  head:  { 4: "out", 5: "dying" },
  neck:  { 4: "out", 5: "dying" },
  chest: { 4: "out", 5: "dying" },
  belly: { 4: "out", 5: "dying" }
};
/** Worse vital state wins: "" < "out" < "dying". */
export const VITAL_RANK = { "": 0, out: 1, dying: 2 };

export const VITAL_STATES = {
  out: "SCARMARK.Injury.vitalOut",
  dying: "SCARMARK.Injury.vitalDying"
};

/** The lowest Wound Level that can be vital, and the highest one the table has (the highest Wound Level). */
export const VITAL_MIN_LEVEL = 4;
export const VITAL_MAX_LEVEL = MAX_WOUND_LEVEL;

/**
 * Severity of a Wound Level: the first row whose `max` is at or above the level; anything higher is the top severity (mortal).
 * The labels are INJURY_SEVERITIES.
 */
export const SEVERITY_BY_LEVEL = [
  { max: 1, key: "light" },
  { max: 2, key: "heavy" },
  { max: 3, key: "severe" },
  { max: 4, key: "dire" }
];
export const SEVERITY_TOP = "mortal";

/**
 * Mend Rate (Healing Rate). 1-6 = H1..H6 (a Healing Roll every 5 days reduces Injury
 * Levels); 0 = MRN ("Mend Rate: Narrative") - no mechanical Healing Roll.
 */
export const MEND_RATE_MAX = 6;
export const MEND_RATES = Array.from({ length: MEND_RATE_MAX + 1 }, (_, rate) => rate);

/** Injury severity tiers (labels), one per Wound Level. */
export const INJURY_SEVERITIES = {
  light: "SCARMARK.Injury.severityLight",
  heavy: "SCARMARK.Injury.severityHeavy",
  severe: "SCARMARK.Injury.severitySevere",
  dire: "SCARMARK.Injury.severityDire",
  mortal: "SCARMARK.Injury.severityMortal"
};

/**
 * Injury catalog: aspect x Wound Level (MIN_WOUND_LEVEL to MAX_WOUND_LEVEL) -> { name, heavyBleeding, amputation }. Macros may read it as SCARMARK.injuryTypes.
 * The final Injury name is "<Location> <name>". `amputation` marks the type as capable
 * of amputation; it only amputates when the struck location also has the Amputate flag.
 */
export const INJURY_TYPES = {
  blunt: {
    1: { name: "Bruise",       heavyBleeding: false, amputation: false },
    2: { name: "Contusion",    heavyBleeding: false, amputation: false },
    3: { name: "Fracture",     heavyBleeding: false, amputation: false },
    4: { name: "Crush",        heavyBleeding: false, amputation: false },
    5: { name: "Mortal Crush", heavyBleeding: false, amputation: false }
  },
  edged: {
    1: { name: "Light Cut",    heavyBleeding: false, amputation: false },
    2: { name: "Heavy Cut",    heavyBleeding: false, amputation: false },
    3: { name: "Severe Cut",   heavyBleeding: true,  amputation: false },
    4: { name: "Dire Cut",     heavyBleeding: true,  amputation: true },
    5: { name: "Mortal Cut",   heavyBleeding: true,  amputation: true }
  },
  piercing: {
    1: { name: "Light Stab",    heavyBleeding: false, amputation: false },
    2: { name: "Heavy Stab",    heavyBleeding: false, amputation: false },
    3: { name: "Severe Stab",   heavyBleeding: true,  amputation: false },
    4: { name: "Dire Stab",     heavyBleeding: true,  amputation: false },
    5: { name: "Mortal Stab",   heavyBleeding: true,  amputation: false }
  },
  fire: {
    1: { name: "Light Burn",    heavyBleeding: false, amputation: false },
    2: { name: "Heavy Burn",    heavyBleeding: false, amputation: false },
    3: { name: "Severe Burn",   heavyBleeding: false, amputation: false },
    4: { name: "Dire Burn",     heavyBleeding: false, amputation: false },
    5: { name: "Mortal Burn",   heavyBleeding: false, amputation: false }
  }
};

/**
 * Stun Test. A wound of these levels to the Head calls for it. It is a
 * d100 against STUN_TARGET plus a bonus for the best piece of armor worn on the Head,
 * by layer (the highest threshold the layer reaches wins): layer 5 (rigid) +20,
 * layers 2-4 (soft, Padded and up) +10, otherwise 0. Fail = Stunned for one round.
 */
export const STUN_WOUND_LEVELS = [2, 3];
export const STUN_TARGET = 50;
export const STUN_ARMOR_BONUSES = [
  { minLayer: 5, bonus: 20 },
  { minLayer: 2, bonus: 10 }
];
export const STUNNED_DURATION = { value: 1, units: "rounds", expiry: "turnStart" };
