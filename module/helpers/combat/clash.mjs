/** Weapon clash on a Block result: WQ tests and the clash card. */

import { isShield, isBodyPart } from "./lookup.mjs";
import { L } from "./util.mjs";
import { postStrike } from "./strike.mjs";
import { updateCombatItem } from "./gm-update.mjs";
import { esc } from "../escape.mjs";
import { speak, cardHtml, cardLine } from "../chat.mjs";
import { locationKey, effectiveStat } from "../../rules/index.mjs";
import { WQ_TEST_FORMULA, WQ_BREAK_MARGIN, BODY_PART_STRIKE, SHIELD_MIN_WQ, SHIELD_WEAR_STEP, ARMOR_LOCATIONS } from "../../config/index.mjs";

/**
 * Roll 3d6 vs WQ. Roll >= WQ + WQ_BREAK_MARGIN destroys it. Otherwise a weapon
 * holds unharmed (no partial damage for weapons: gradual decay was a
 * death spiral), while a SHIELD that rolled above its WQ wears down (WQ -1),
 * so a battered shield grows likelier to break until an armorer restores it.
 */
async function weaponBreakTest(weapon) {
  const wq = effectiveStat(weapon.system, "quality") ?? 0;
  const roll = await new Roll(WQ_TEST_FORMULA).evaluate();
  return { roll, wq, broken: roll.total >= wq + WQ_BREAK_MARGIN, worn: isShield(weapon) && roll.total > wq };
}

/**
 * Weapon clash (Scarmark rule). Runs only on a Block result (isBlockResult:
 * a successful attack met by a block of the same level), when the weapons meet:
 *  - a body part is involved (WQ 0): no breakage. A Critical-Success block is a
 *    clean parry; otherwise the limb takes an automatic #2 blunt strike (2d6).
 *  - two real weapons: the lower-WQ one tests first (attacker first on a tie),
 *    see weaponBreakTest: hold / (shields only) wear WQ -1 / destroy.
 *    A destroyed weapon STOPS the cascade (the other does not test)
 *    and hands its owner's opponent an Attacker's / Defender's Opportunity.
 * Missiles carry no WQ, so a range block only tests the blocking shield, and the
 * caller runs it only when the blocked impact was >= 5.
 */
export async function resolveWeaponClash({ attacker, attackerWeapon, defender, defenderWeapon, blockLevel }) {
  const lines = [];
  const rolls = [];

  // --- body-part branch (fists / paws / claws) ------------------------
  if (isBodyPart(attackerWeapon) || isBodyPart(defenderWeapon)) {
    if (blockLevel === "cs") {
      lines.push(cardLine(`<i>${L("cleanParry")}</i>`));
      return postClashCard(attacker, lines, rolls);
    }
    // The limb that met the blow takes it; prefer the blocking limb.
    const defenderLimb = isBodyPart(defenderWeapon);
    const striker = defenderLimb ? attacker : defender;
    const victim = defenderLimb ? defender : attacker;
    lines.push(cardLine(game.i18n.format("SCARMARK.CombatAuto.pawStrike", { name: esc(victim.name) })));
    await postClashCard(attacker, lines, rolls);
    // The limb that met the blow is an arm: bias the strike to the arm chain
    // (canon locations flagged with a fumble risk).
    const armChain = (loc) => ARMOR_LOCATIONS[locationKey(loc.system.locationType)]?.risk?.fumble === true;
    // Impact bonus follows the striker's weapon skill (none for a blocked missile).
    const strikerWeapon = defenderLimb ? attackerWeapon : defenderWeapon;
    return postStrike(striker, victim, BODY_PART_STRIKE.aspect, BODY_PART_STRIKE.impact, BODY_PART_STRIKE.dice, { locationFilter: armChain, skill: strikerWeapon?.system.associatedSkill });
  }

  // --- real-weapon branch ---------------------------------------------
  const participants = [];
  if (attackerWeapon) participants.push({ weapon: attackerWeapon, opponent: defender });
  if (defenderWeapon) participants.push({ weapon: defenderWeapon, opponent: attacker });
  if (!participants.length) return;
  // Lower WQ first; the attacker (index 0) keeps priority on a tie (stable sort).
  participants.sort((a, b) => (effectiveStat(a.weapon.system, "quality") ?? 0) - (effectiveStat(b.weapon.system, "quality") ?? 0));

  const taFor = [];
  for (const p of participants) {
    const t = await weaponBreakTest(p.weapon);
    rolls.push(t.roll);
    lines.push(cardLine(`${game.i18n.format("SCARMARK.CombatAuto.wqTest", { name: esc(p.weapon.name), wq: t.wq })}: ${t.roll.total}`));
    if (t.broken) {
      await updateCombatItem(p.weapon, { "system.broken": true });
      lines.push(cardLine(game.i18n.format("SCARMARK.CombatAuto.wqBroke", { name: esc(p.weapon.name) }), "broken"));
      taFor.push(p.opponent);
      break; // only if the first survives does the other test
    }
    if (t.worn) {
      // Floor at 1: WQ 0 is the body-part sentinel and must never be reached by wear.
      const worn = Math.max(SHIELD_MIN_WQ, (p.weapon.system.quality ?? 0) - SHIELD_WEAR_STEP);
      await updateCombatItem(p.weapon, { "system.quality": worn });
      lines.push(cardLine(game.i18n.format("SCARMARK.CombatAuto.wqShieldWorn", { name: esc(p.weapon.name), wq: worn })));
    } else {
      lines.push(cardLine(`<i>${game.i18n.format("SCARMARK.CombatAuto.wqSurvived", { name: esc(p.weapon.name) })}</i>`));
    }
  }
  for (const who of taFor) {
    const key = who === attacker ? "brokenWeaponAttackersOpportunity" : "brokenWeaponDefendersOpportunity";
    lines.push(cardLine(game.i18n.format(`SCARMARK.CombatAuto.${key}`, { name: esc(who.name) }), "ta"));
  }
  return postClashCard(attacker, lines, rolls);
}

/** Post the clash card (nothing when there are no lines). */
async function postClashCard(speakerActor, lines, rolls) {
  if (!lines.length) return;
  await speak(speakerActor, cardHtml({ cls: "clash-card", title: L("weaponClash"), body: lines.join("") }), { rolls });
}
