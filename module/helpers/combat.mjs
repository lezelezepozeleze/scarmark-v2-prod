/**
 * Entry points of the combat automation for the rest of the system (the sheets, scarmark.mjs, maneuvers and the combat helper); everything else is imported from combat/ directly.
 *
 * Scarmark melee combat automation (GM-driven).
 *
 * Attacker clicks a weapon on the Combat tab -> an attack dialog (Weapon Aspect
 * + Modifier) -> a PUBLIC chat card offering the five reactions. Whoever
 * controls the defender clicks a reaction -> a per-reaction dialog collects its
 * options (weapon / aspect / modifier) -> resolveMelee rolls both sides and, on
 * a hit, posts a strike card with an "Add Wound" button that creates the Injury.
 */

export { coveringArmor } from "./combat/armor.mjs";
export { registerScarmarkQueries } from "./combat/gm-update.mjs";
export { rollInjury } from "./combat/strike.mjs";
export { rollStunTest } from "./combat/forced-tests.mjs";
export { initiateAttack, declareMeleeAttack, initiateRangeAttack, declareRangeAttack } from "./combat/attack.mjs";
export { wireCombatCard } from "./combat/chat-wiring.mjs";
export { applyCombatRoundFatigue } from "./combat/round.mjs";
export { registerScarmarkCombatant } from "./combat/combatant.mjs";
