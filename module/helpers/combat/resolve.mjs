/** Resolution of a declared attack against the chosen defense (melee and range): the two d100 rolls, the result card, the strikes and the weapon clash. */

import { testBlock, speak, cardHtml, cardLine, cardBlock, cardSep } from "../chat.mjs";
import { rollD100 } from "../dice/shared.mjs";
import { defenseSituational, findSkillByName, weaponDsl, weaponAsl, armorBlockDsl } from "./lookup.mjs";
import { resolveOutcome, isBlockResult, blowBlocked, strikeDice, dodgeVsMissile, capTarget, effectiveStat } from "../../rules/index.mjs";
import { taLines, tieLines } from "./result-lines.mjs";
import { L, locationName } from "./util.mjs";
import { postStrike } from "./strike.mjs";
import { resolveWeaponClash } from "./clash.mjs";
import { esc } from "../escape.mjs";
import { BLOCK_CLASH_MIN_IMPACT, DODGE_SKILL, ARMOR_PIERCING_NAMES } from "../../config/index.mjs";

/**
 * Both sides of the exchange: roll the attacker against the declared ASL, build the defender's target for the chosen defense (capped) and roll it unless the defense is "ignore".
 *
 * @param {object} data       the declared attack (data-combat payload)
 * @param {string} defense    ignore | block | dodge | riposte | counterstrike
 * @param {object} defParams  the defense dialog's answer ({weaponId, aspect, modifier})
 * @param {(target: Actor, defWeapon: Item|null, mod: number) => number} defenseTarget  the uncapped defender target for this attack mode
 * @returns {Promise<object|null>} the actors, rolls, levels and defense weapon; null when an actor is gone
 */
async function rollExchange(data, defense, defParams, defenseTarget) {
  const attacker = fromUuidSync(data.attacker);
  const target = fromUuidSync(data.target);
  if (!attacker || !target) return null;

  const { roll: aRoll, level: aLevel } = await rollD100(data.asl);

  const mod = (defParams.modifier || 0) + defenseSituational(target);
  const defWeapon = defParams.weaponId ? target.items.get(defParams.weaponId) : null;
  const dTarget = capTarget(defenseTarget(target, defWeapon, mod));
  let dRoll = null, dLevel = null;
  if (defense !== "ignore") ({ roll: dRoll, level: dLevel } = await rollD100(dTarget));

  return { attacker, target, aRoll, aLevel, dRoll, dLevel, dTarget, defWeapon };
}

/** The result card: the attacker's test block, the defender's (or "ignore") and the extra lines (opportunities, ties, "no strike"). */
function resultCard(data, defense, x, extra) {
  const attacker = testBlock({ title: x.attacker.name, target: data.asl, roll: x.aRoll.total, level: x.aLevel });
  const defender = defense === "ignore"
    ? cardBlock(x.target.name, cardLine(L("ignore")))
    : testBlock({ title: `${x.target.name} - ${L(defense)}`, target: x.dTarget, roll: x.dRoll.total, level: x.dLevel });
  return cardHtml({ cls: "result-card", body: `${attacker}${cardSep}${defender}${extra.length ? `${cardSep}${extra.join("")}` : ""}` });
}

/** Post the result card with both rolls attached. */
const postResultCard = (x, content) => speak(x.attacker, content, { rolls: [x.aRoll, x.dRoll].filter(Boolean) });

/** A successful block puts the weapons in contact: run the clash (a missile has no weapon, so `attackerWeapon` is null for range). */
const clashOnBlock = (x, attackerWeapon) => resolveWeaponClash({
  attacker: x.attacker,
  attackerWeapon,
  defender: x.target,
  defenderWeapon: x.defWeapon,
  blockLevel: x.dLevel
});

/**
 * Resolve a declared missile attack against the defense the target chose: roll both sides, post the result card, strike when the shot lands and clash the blocking shield when a hard hit was blocked.
 * @param {object} data       the declared attack (data-combat payload of the attack card)
 * @param {string} defense    ignore | block | dodge
 * @param {object} [defParams] the defense dialog's answer ({weaponId, modifier})
 */
export async function resolveRange(data, defense, defParams = {}) {
  const x = await rollExchange(data, defense, defParams, (target, defWeapon, mod) => {
    if (defense === "dodge") return dodgeVsMissile(findSkillByName(target, DODGE_SKILL)?.system.esl ?? 0, data.velocity) + mod; // a High-Velocity Missile halves Dodge
    if (defense === "block") return (defWeapon ? weaponDsl(target, defWeapon) : 0) + mod;
    return 0;
  });
  if (!x) return;
  const { attacker, target, aLevel, dLevel } = x;

  const outcome = resolveOutcome(aLevel, defense, dLevel);

  const extra = taLines(outcome, attacker, target);
  // Critical miss on a ranged attack = the shot goes wild. Flavour-only for now
  // (a mechanical consequence - a RollTable - is still to be designed).
  if (aLevel === "cf") extra.push(cardLine(L("missileGoneWild"), "broken"));
  if (!outcome.attackerStrikes) extra.push(cardLine(`<i>${L("noStrike")}</i>`));
  await postResultCard(x, resultCard(data, defense, x, extra));

  if (outcome.attackerStrikes) await postStrike(attacker, target, data.aspect, data.impact, outcome.strikeDice, { armorPiercing: data.armorPiercing, skill: data.skill, aim: data.aim, part: data.part });

  // A missile carries no WQ, so only the blocking shield tests: only when the
  // shot actually landed on it (a Block result) and hit hard enough (BLOCK_CLASH_MIN_IMPACT).
  if (defense === "block" && isBlockResult(aLevel, dLevel) && (data.impact ?? 0) >= BLOCK_CLASH_MIN_IMPACT) {
    await clashOnBlock(x, null);
  }
}

/**
 * Resolve a declared melee attack against the defense the target chose: roll both sides, post the result card, strike for whoever won (attacker, or the defender after a Riposte or Counterattack) and clash the weapons on a block.
 * @param {object} data       the declared attack (data-combat payload of the attack card)
 * @param {string} defense    ignore | block | dodge | riposte | counterstrike
 * @param {object} [defParams] the defense dialog's answer ({weaponId, armorLocationId, aspect, modifier}); a block with a body location turns a blow the block stopped onto that location
 */
export async function resolveMelee(data, defense, defParams = {}) {
  const x = await rollExchange(data, defense, defParams, (target, defWeapon, mod) => {
    if (defense === "dodge") return (findSkillByName(target, DODGE_SKILL)?.system.esl ?? 0) + mod;
    if (defense === "block") return (defWeapon ? weaponDsl(target, defWeapon) : (defParams.armorLocationId ? armorBlockDsl(target) : 0)) + mod;
    if (defense === "counterstrike" || defense === "riposte") return (defWeapon ? weaponAsl(target, defWeapon) : 0) + mod;
    return 0;
  });
  if (!x) return;
  const { attacker, target, aRoll, aLevel, dRoll, dLevel, defWeapon } = x;

  const outcome = resolveOutcome(aLevel, defense, dLevel, aRoll.total, dRoll?.total ?? 0);
  // Blocking with a body location: a blow the block turned aside is not lost, it lands on the location the defender chose as an ordinary strike (the worn armor there protects and wears as always).
  const armorLocation = defense === "block" && !defWeapon && defParams.armorLocationId ? target.items.get(defParams.armorLocationId) : null;
  const diverted = Boolean(armorLocation) && blowBlocked(aLevel, dLevel);

  const extra = [...tieLines(outcome), ...taLines(outcome, attacker, target)];
  if (diverted) extra.push(cardLine(esc(game.i18n.format("SCARMARK.CombatAuto.divertedTo", { location: locationName(armorLocation, armorLocation.system.locationType) }))));
  if (!outcome.attackerStrikes && !outcome.defenderStrikes && !diverted) extra.push(cardLine(`<i>${L("noStrike")}</i>`));
  await postResultCard(x, resultCard(data, defense, x, extra));

  const weapon = attacker.items.get(data.weapon);
  const strikeFromAttacker = (dice, options = {}) => postStrike(attacker, target, data.aspect, weapon ? effectiveStat(weapon.system, `impact.${data.aspect}`) : 0, dice, { armorPiercing: data.armorPiercing, skill: weapon?.system.associatedSkill, aim: data.aim, part: data.part, weapon, ...options });
  if (outcome.attackerStrikes) await strikeFromAttacker(outcome.strikeDice);
  else if (diverted) await strikeFromAttacker(strikeDice(aLevel), { locationFilter: (location) => location.id === armorLocation.id });
  if (outcome.defenderStrikes && defWeapon) {
    const a = defParams.aspect || "edged";
    await postStrike(target, attacker, a, effectiveStat(defWeapon.system, `impact.${a}`) ?? 0, outcome.defStrikeDice, { armorPiercing: ARMOR_PIERCING_NAMES.test(defWeapon.name), skill: defWeapon.system.associatedSkill, weapon: defWeapon });
  }

  // Only a Block result (the blow landed on the guard) puts the weapons in contact; armor has no weapon to clash.
  if (defense === "block" && !armorLocation && isBlockResult(aLevel, dLevel)) {
    await clashOnBlock(x, attacker.items.get(data.weapon));
  }
}
