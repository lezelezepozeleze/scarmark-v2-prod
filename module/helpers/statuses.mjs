/**
 * Scarmark custom status effects (COMBAT / Physical Statuses).
 *
 * Each entry is a Foundry status effect carrying Active Effect `changes` that
 * write into the actor's `system.mods.*` accumulators (see base-actor-schema),
 * so toggling a status on a token immediately shifts the derived skills / ASL /
 * DSL - the same pipeline the effect-key picker uses. Toggling is done from the
 * token HUD, or programmatically via `actor.toggleStatusEffect(id, {active})`.
 *
 * Only the mechanically clear-cut statuses are modelled here (Prone, Grappled,
 * Pinned Down, Entangled, Stunned). Movement halving (Prone/Entangled) is NOT
 * enforced - Foundry does not gate token movement on an effect - so it stays a
 * GM/table reminder. Blinded/Burning/Unconscious/Restrained/In Cover are left to
 * core Foundry or handled case by case.
 */

import { STATUS_PENALTIES, STATUS_SKILL_CATEGORIES } from "../config/index.mjs";

const ADD = 2; // CONST.ACTIVE_EFFECT_MODES.ADD (noted, not changed: later Foundry versions describe changes with a `type` instead of a numeric `mode`)
const ch = (key, value) => ({ key, mode: ADD, value: String(value) });

/**
 * "Combat and Esoterics: −N" - the standard status skill hit (STATUS_SKILL_CATEGORIES).
 * Esoterics = the Esoterics skill category plus psionic talents. The general Skill
 * category is intentionally untouched for now (D., 2026-11-20).
 * Lowering Combat skills lowers both ASL and DSL (weapon rolls read the combat
 * skill ESL), so this one spread covers attack + defense + skills at once.
 */
const skillPenalty = (n) => STATUS_SKILL_CATEGORIES.map(category => ch(`system.mods.skills.${category}`, n));

/** The five Scarmark statuses, in token-HUD order. */
export const SCARMARK_STATUSES = [
  {
    // Prone: skills −20; melee vs you +20; missile vs you −20; move ½ (manual).
    id: "prone",
    name: "SCARMARK.Status.prone",
    img: "icons/svg/falling.svg",
    changes: [
      ...skillPenalty(STATUS_PENALTIES.prone.skills),
      ch("system.mods.incomingMelee", STATUS_PENALTIES.prone.incomingMelee),
      ch("system.mods.incomingMissile", STATUS_PENALTIES.prone.incomingMissile)
    ]
  },
  {
    // Grappled: skills −20. No Dodge (procedural). Break free = an action.
    id: "grappled",
    name: "SCARMARK.Status.grappled",
    img: "icons/svg/net.svg",
    changes: skillPenalty(STATUS_PENALTIES.grappled.skills)
  },
  {
    // Pinned Down: skills −30; melee vs you +30; missile vs you −30.
    id: "pinnedDown",
    name: "SCARMARK.Status.pinnedDown",
    img: "icons/svg/statue.svg",
    changes: [
      ...skillPenalty(STATUS_PENALTIES.pinnedDown.skills),
      ch("system.mods.incomingMelee", STATUS_PENALTIES.pinnedDown.incomingMelee),
      ch("system.mods.incomingMissile", STATUS_PENALTIES.pinnedDown.incomingMissile)
    ]
  },
  {
    // Entangled: skills −30; move ½ (manual).
    id: "entangled",
    name: "SCARMARK.Status.entangled",
    img: "icons/svg/trap.svg",
    changes: skillPenalty(STATUS_PENALTIES.entangled.skills)
  },
  {
    // Stunned: defense −30, lose your action (procedural). mods.defense lowers
    // EVERY defense roll - Block, Dodge, Riposte and Counterattack, melee and missile -
    // and nothing else (skills stay untouched). Uses core's "stun" id so it
    // overrides Foundry's stock Stunned rather than duplicating it.
    id: "stun",
    name: "SCARMARK.Status.stunned",
    img: "icons/svg/daze.svg",
    changes: [
      ch("system.mods.defense", STATUS_PENALTIES.stun.defense)
    ]
  }
];

/**
 * Merge the Scarmark statuses into CONFIG.statusEffects (call once, at init).
 * An id that core already ships (e.g. "prone") is overwritten IN PLACE so it
 * keeps its slot and gains our changes; genuinely new ids are appended. Core's
 * other statuses (Dead, Unconscious, Blinded, Burning, ...) are left untouched.
 */
export function registerScarmarkStatusEffects() {
  const byId = new Map((CONFIG.statusEffects ?? []).map(s => [s.id, s]));
  for (const status of SCARMARK_STATUSES) {
    const existing = byId.get(status.id);
    if (existing) Object.assign(existing, status);
    else CONFIG.statusEffects.push(status);
  }
}
