/**
 * Penalties of the Scarmark status effects (helpers/statuses.mjs builds the Active Effect changes from them).
 *  skills:          added to the combat, esoterics and psionic skill mods (the general Skill category is left alone for now, D. 2026-11-20)
 *  incomingMelee:   added to the ASL of melee attacks AGAINST the actor
 *  incomingMissile: added to the ASL of missile attacks AGAINST the actor
 *  defense:         added to every Block, Dodge, Riposte and Counterattack roll
 */
export const STATUS_PENALTIES = {
  prone: { skills: -20, incomingMelee: 20, incomingMissile: -20 },
  grappled: { skills: -20 },
  pinnedDown: { skills: -30, incomingMelee: 30, incomingMissile: -30 },
  entangled: { skills: -30 },
  stun: { defense: -30 }
};

/** The skill categories a status effect's skill penalty applies to (the general Skill category is left alone, D. 2026-11-20). */
export const STATUS_SKILL_CATEGORIES = ["combat", "esoterics", "psionic"];
