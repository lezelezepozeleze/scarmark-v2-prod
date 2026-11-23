/** Tests forced by wounds: Stun Test, Fumble and Stumble (the rolls, their cards and the statuses they apply). */

import { outcomeLabel, testCard, cardLine, cardSep, speak } from "../chat.mjs";
import { capTarget, isFailure } from "../../rules/index.mjs";
import { L } from "./util.mjs";
import { headArmorLayer } from "./armor.mjs";
import { promptModifier } from "../modifier-prompt.mjs";
import { rollD100 } from "../dice/shared.mjs";
import { stunProtectionBonus } from "../../rules/index.mjs";
import { FUMBLE_STUMBLE_MULTIPLIER, STUN_TARGET, STUNNED_DURATION } from "../../config/index.mjs";

/**
 * Apply a status effect with a duration (the status itself carries none). If the
 * status is already active it is left as it is.
 * @param {Actor}  actor
 * @param {string} statusId
 * @param {object} duration  ActiveEffect duration, e.g. STUNNED_DURATION from config/wounds.mjs.
 */
async function applyTimedStatus(actor, statusId, duration) {
  const had = actor.effects.some(e => (e.statuses.size === 1) && e.statuses.has(statusId));
  const effect = await actor.toggleStatusEffect(statusId, { active: true });
  if (!had && effect?.update) await effect.update({ duration });
}

/** Ask for the Stun Test's situational modifier; null when the dialog was closed. */
const askStunModifier = (victim) => promptModifier({
  title: `${victim.name} - ${L("stunTest")}`,
  okLabel: game.i18n.localize("SCARMARK.Roll"),
  step: 5
});

/**
 * Apply what a Stun Test result does: a failure stuns for one round, a critical failure knocks the victim out.
 * @returns {Promise<string>} the card line saying what was applied (HTML; "" when the result applies nothing)
 */
async function applyStunResult(victim, level) {
  try {
    if (level === "mf") {
      await applyTimedStatus(victim, "stun", STUNNED_DURATION);
      return game.i18n.format("SCARMARK.CombatAuto.stun.applied", { status: game.i18n.localize("SCARMARK.Status.stunned") });
    }
    if (level === "cf") {
      await victim.toggleStatusEffect("unconscious", { active: true });
      return game.i18n.format("SCARMARK.CombatAuto.stun.applied", { status: game.i18n.localize("SCARMARK.CombatAuto.stun.unconscious") });
    }
  }
  catch (err) {
    console.warn("Scarmark | could not apply the Stun Test status", err);
    return `<i>${game.i18n.localize("SCARMARK.CombatAuto.stun.notApplied")}</i>`;
  }
  return "";
}

/** The Stun Test card: cause, target with its parts, roll, outcome and what was applied. */
function stunCard({ victim, cause, target, bonus, modifier, roll, level, applied }) {
  const sum = [`${STUN_TARGET}`];
  if (bonus) sum.push(`+ ${bonus} ${game.i18n.localize("SCARMARK.CombatAuto.stun.protection")}`);
  if (modifier) sum.push(`${modifier > 0 ? "+" : "&minus;"} ${Math.abs(modifier)}`);
  const causeLabel = game.i18n.localize(cause === "electric" ? "SCARMARK.CombatAuto.stun.electric" : "SCARMARK.CombatAuto.stun.blow");
  return testCard({
    title: `${victim.name} - ${L("stunTest")}`,
    target: `${target}${sum.length > 1 ? ` (${sum.join(" ")})` : ""}`,
    roll: roll.total,
    level,
    before: cardLine(causeLabel),
    after: `${cardSep}${cardLine(game.i18n.localize(`SCARMARK.CombatAuto.stun.${level}`))}${applied ? cardLine(applied) : ""}`
  });
}

/**
 * Stun Test. Offered on the card of a Heavy or Severe wound to the Head
 * and rolled by the victim's owner, or from the Stun Test macro (also for an electric
 * shock). d100 against 50 plus the head protection (only for a blow to the head: the
 * best worn piece covering the Head, layer 5 rigid +20, layers 2-4 soft +10) plus a
 * situational modifier (asked in a dialog when not given).
 *   CS  you saw stars: next round you act first (by hand)
 *   S   you withstood it
 *   F   Stunned for one round (defense -30; you lose the action, by hand)
 *   CF  Unconscious
 * @param {Actor}  victim
 * @param {object} [o]
 * @param {"blow"|"electric"} [o.cause="blow"]
 * @param {number} [o.modifier]  Situational modifier; asked in a dialog when omitted.
 */
export async function rollStunTest(victim, { cause = "blow", modifier } = {}) {
  if (!victim) return;
  if (modifier === undefined) {
    modifier = await askStunModifier(victim);
    if (modifier === null) return;
  }

  const layer = (cause === "blow") ? headArmorLayer(victim) : 0;
  const bonus = stunProtectionBonus(layer);
  const target = capTarget(Math.max(0, STUN_TARGET + bonus + modifier));
  const { roll, level } = await rollD100(target);
  const applied = await applyStunResult(victim, level);

  await speak(victim, stunCard({ victim, cause, target, bonus, modifier, roll, level, applied }), { rolls: [roll] });
}

/**
 * Forced Fumble / Stumble test, auto-offered by a triggering wound (see
 * postStrike) and rolled by the victim's owner from the strike card:
 *  - Fumble  = DEX x5. On F/CF the weapon may be dropped (left to player + GM,
 *              per the rules, so no status is applied automatically).
 *  - Stumble = AGL x5. On F/CF the victim is knocked down -> Prone status.
 */
export async function rollFumbleStumble(victim, kind) {
  if (!victim) return;
  const attrKey = kind === "fumble" ? "dex" : "agl";
  const target = capTarget((victim.system.attributes?.[attrKey]?.effective ?? 0) * FUMBLE_STUMBLE_MULTIPLIER);
  const { roll, level } = await rollD100(target);
  const failed = isFailure(level);

  const resultKey = kind === "fumble"
    ? (failed ? "fumbleDropped" : "fumbleHeld")
    : (failed ? "stumbleFell" : "stumbleStayed");

  await speak(victim, testCard({
    title: `${victim.name} - ${L(kind === "fumble" ? "fumbleTest" : "stumbleTest")}`,
    target,
    roll: roll.total,
    label: `${outcomeLabel(level)} &middot; ${L(resultKey)}`,
    cls: `outcome-${level}`
  }), { rolls: [roll] });

  // Stumble knock-down: apply Prone (the clicker owns the victim, so this is
  // permitted; unlinked token actors resolve through their own synthetic actor).
  if (kind === "stumble" && failed) {
    try { await victim.toggleStatusEffect("prone", { active: true }); }
    catch (err) { console.warn("Scarmark | could not apply Prone after Stumble", err); }
  }
}
