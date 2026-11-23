/** Skill and weapon lookups: ESL, attack/defense skill levels, aspects, body parts and shields. */

import { COMBAT_SKILLS, ARMOR_BLOCK_SKILL } from "../../config/index.mjs";
import { rangedBlockShields, effectiveStat } from "../../rules/index.mjs";
import { outnumberedPenalty } from "../../data/base-actor-schema.mjs";
import { ALL_ASPECTS } from "./constants.mjs";

/**
 * The actor's skill item with this name (case-insensitive, exact otherwise).
 * @param {Actor} actor
 * @param {string} name  a skill name, already localized
 * @returns {Item|undefined}
 */
export function findSkillByName(actor, name) {
  return actor.items.find(i => i.type === "skill" && i.name.toLowerCase() === String(name).toLowerCase());
}

function combatSkillEsl(actor, key) {
  const label = COMBAT_SKILLS[key];
  if (!label) return 0;
  return findSkillByName(actor, game.i18n.localize(label))?.system.esl ?? 0;
}

/** A weapon's Attack Skill Level: the combat skill's ESL + the weapon's attack and specialization + the actor's melee attack modifier. */
export const weaponAsl = (actor, w) => combatSkillEsl(actor, w.system.associatedSkill) + effectiveStat(w.system, "attack") + effectiveStat(w.system, "specialization") + (actor.system.mods?.meleeAttack ?? 0);

/** A weapon's Defense Skill Level: the combat skill's ESL + the weapon's defense and specialization + the actor's melee defense modifier. */
export const weaponDsl = (actor, w) => combatSkillEsl(actor, w.system.associatedSkill) + effectiveStat(w.system, "defense") + effectiveStat(w.system, "specialization") + (actor.system.mods?.meleeDefense ?? 0);

/** The Defense Skill Level of blocking with a body location, no weapon: the combat skill's ESL + the actor's melee defense modifier. */
export const armorBlockDsl = (actor) => combatSkillEsl(actor, ARMOR_BLOCK_SKILL) + (actor.system.mods?.meleeDefense ?? 0);

/** A missile's ASL before range, aim, the dialog modifier and the target's status. Shown on the sheet and rolled in attack.mjs. */
export const missileAsl = (actor, m) => combatSkillEsl(actor, m.system.associatedSkill) + (m.system.specialization ?? 0) + (actor.system.mods?.missileAttack ?? 0);

/** Situational mod on EVERY defense roll of this actor: the generic defense mod
 *  (e.g. Stunned -30) minus the fixed Outnumbered penalty (2 = -20, 3+ = -30). */
export const defenseSituational = (actor) => (actor.system.mods?.defense ?? 0) - outnumberedPenalty(actor);

/** Aspects the weapon actually has (impact >= 0; -1 means "no such aspect"). */
export const availableAspects = (weapon) => ALL_ASPECTS.filter(a => (weapon.system.impact[a] ?? 0) >= 0);

/** The weapon's strongest available aspect. */
export function bestAspectKey(weapon) {
  const avail = availableAspects(weapon);
  if (!avail.length) return "blunt";
  return avail.reduce((best, a) => (effectiveStat(weapon.system, `impact.${a}`) > effectiveStat(weapon.system, `impact.${best}`) ? a : best), avail[0]);
}

/** WQ 0 (or less) is the "not breakable" sentinel: natural weapons / body parts. */
export const isBodyPart = (weapon) => !!weapon && (weapon.system?.quality ?? 0) <= 0;

/** A shield: by the isShield flag, or (fallback) a known shield name. */
export function isShield(weapon) {
  if (!weapon) return false;
  if (weapon.system.isShield) return true;
  const names = rangedBlockShields("low").map(n => n.toLowerCase());
  return names.includes(weapon.name.toLowerCase());
}

/** A placed token for this actor (prefer a controlled one). */
export function actorToken(actor) {
  return canvas.tokens?.controlled?.find(t => t.actor === actor)
    ?? canvas.tokens?.placeables?.find(t => t.actor === actor)
    ?? null;
}
