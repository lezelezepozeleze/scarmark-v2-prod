/** Sets derived from the combat config values. The values themselves live in module/config/ (import them from config/index.mjs); only what is computed from them is kept here. */

import { DAMAGE_ASPECTS, IMPACT_SKILLS as IMPACT_SKILL_KEYS } from "../../config/index.mjs";

/** Every damage aspect key, in damageAspects order (blunt, edged, piercing, fire). */
export const ALL_ASPECTS = Object.keys(DAMAGE_ASPECTS);

/** Combat skills whose strikes take the attacker's Impact modifier (system.mods.impact), as a Set. The rule itself is rules/strike-helpers.mjs impactBonusFor. */
export const IMPACT_SKILLS = new Set(IMPACT_SKILL_KEYS);
