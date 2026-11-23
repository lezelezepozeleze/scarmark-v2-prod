/** Worn armor of an actor: which pieces count as worn, which cover a location, the protection they give against an aspect and the head armor layer. */

import { protectionSum, coversLocation, effectiveStat } from "../../rules/index.mjs";

/**
 * Armor that is actually WORN: carried, and not packed in one of the actor's
 * containers (a spare helmet in a backpack doesn't protect or wear). Armor only:
 * missiles stay usable from a quiver and weapons from a scabbard/pack.
 */
export const isWornArmor = (actor, item) => item.type === "armor" && item.system.carried
  && !(item.system.container && actor.items.get(item.system.container));

/** The worn armor pieces covering a location (its type and side) that still protect.
 *  A piece protects while its durability is not 0 (Natural armor, QUALITY_PERMANENT, never
 *  decays and always protects the locations it covers). A piece covering the plain type covers
 *  both sides; one covering a sided key (leftArm) only that side. */
export const coveringArmor = (actor, locType, side = "") => actor.items
  .filter(a => isWornArmor(actor, a) && coversLocation(a.system.coverage, locType, side)
    && effectiveStat(a.system, "quality") !== 0);

/** Total worn-armor protection covering a location against an aspect. */
export const armorProtection = (actor, locType, aspect, side = "") => protectionSum(coveringArmor(actor, locType, side), aspect);

/** Rigidity of the best worn armor piece covering the Head: its layer (0 = none). */
export const headArmorLayer = (actor) => coveringArmor(actor, "head")
  .reduce((m, a) => Math.max(m, a.system.layer ?? 0), 0);
