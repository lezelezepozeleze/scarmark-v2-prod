/**
 * Outcome of an attack against a defense: who strikes and how many dice, who takes the Opportunity, and whether the block met the blow.
 *
 * Pure: no Foundry globals; the numbers come from module/config/ (combat.mjs RANK, STRIKE_DICE).
 */
import { RANK } from "../config/index.mjs";
import { strikeDice } from "./strike.mjs";

const isSuccess = (lvl) => lvl === "ms" || lvl === "cs";

/**
 * Who strikes and who takes the Opportunity. aRoll / dRoll (the raw d100s) only
 * matter for a Riposte, which breaks a tie of success levels on the numbers.
 *
 * @param {"cs"|"ms"|"mf"|"cf"} aLevel the attacker's outcome level
 * @param {"ignore"|"block"|"dodge"|"riposte"|"counterstrike"|string} defense the defense chosen ("ignore" = no defense roll, dLevel is then null)
 * @param {"cs"|"ms"|"mf"|"cf"|null} dLevel the defender's outcome level
 * @param {number} [aRoll] the attacker's raw d100 (Riposte tie-break)
 * @param {number} [dRoll] the defender's raw d100 (Riposte tie-break)
 * @returns {{attackerStrikes: boolean, defenderStrikes: boolean, strikeDice: number, defStrikeDice: number, ata: boolean, dta: boolean, tie: ({winner: (string|null), a: number, d: number}|null)}} strikeDice / defStrikeDice are the d6 each side rolls; ata / dta are the attacker's / defender's Opportunity; tie is set only for a Riposte on equal success levels
 */
export function resolveOutcome(aLevel, defense, dLevel, aRoll = 0, dRoll = 0) {
  const out = { attackerStrikes: false, defenderStrikes: false, strikeDice: 0, defStrikeDice: 0, ata: false, dta: false, tie: null };
  const aRank = RANK[aLevel];

  if (defense === "ignore") {
    if (isSuccess(aLevel)) { out.attackerStrikes = true; out.strikeDice = strikeDice(aLevel); }
  } else if (defense === "riposte") {
    // A Riposte parries and answers: the better result strikes, the other is
    // turned aside. On the same success level (MS/MS, CS/CS) the higher roll
    // wins - both rolled under their targets, and only the side with the higher
    // target can roll high and still succeed. An identical roll is parried with
    // no answer ("dead even"). Both failing: nothing. No weapon clash.
    const dRank = RANK[dLevel];
    let winner = null;
    if (aRank > dRank) winner = "attacker";
    else if (dRank > aRank) winner = "defender";
    else if (isSuccess(aLevel)) {
      if (aRoll > dRoll) winner = "attacker";
      else if (dRoll > aRoll) winner = "defender";
      out.tie = { winner, a: aRoll, d: dRoll };
    }
    if (winner === "attacker" && isSuccess(aLevel)) { out.attackerStrikes = true; out.strikeDice = strikeDice(aLevel); }
    if (winner === "defender" && isSuccess(dLevel)) { out.defenderStrikes = true; out.defStrikeDice = strikeDice(dLevel); }
  } else {
    const dRank = RANK[dLevel];
    // A Counterattack trades blows: on an equal success level BOTH strike (else
    // it would strictly dominate Block, since a weapon's Attack >= its Defense).
    const trade = defense === "counterstrike" && aRank === dRank;
    if (isSuccess(aLevel) && (aRank > dRank || trade)) { out.attackerStrikes = true; out.strikeDice = strikeDice(aLevel); }
    if (defense === "counterstrike" && isSuccess(dLevel) && dRank >= aRank) {
      out.defenderStrikes = true; out.defStrikeDice = strikeDice(dLevel);
    }
  }

  // Attacker's / Defender's Opportunity (formerly Tactical Advantage, ATA/DTA):
  // a Critical scores a "point" — a Critical Success to its own side, a Critical
  // Failure to the opponent. The side ahead on points takes the Opportunity
  // (ata / dta); equal points cancel. So CS-vs-CS and CF-vs-CF yield nothing, while a
  // CS-vs-CF stacks two points onto the favoured side (its CS + the opponent's
  // CF). dLevel is null on an "ignore" defence, so only the attacker can score.
  const ataPts = (aLevel === "cs" ? 1 : 0) + (dLevel === "cf" ? 1 : 0);
  const dtaPts = (dLevel === "cs" ? 1 : 0) + (aLevel === "cf" ? 1 : 0);
  out.ata = ataPts > dtaPts;
  out.dta = dtaPts > ataPts;
  return out;
}

/**
 * Did the block actually meet the blow? Only a SUCCESSFUL attack stopped by a
 * successful block of an equal level (MS/MS, CS/CS) puts the weapons in contact.
 * A failed attack (incl. a Missile Gone Wild) never reached the defender; an
 * attack that beat the block went through; a CS block against a mere MS attack
 * is a clean parry that deflects the blow without a hard impact.
 *
 * @param {"cs"|"ms"|"mf"|"cf"} aLevel
 * @param {"cs"|"ms"|"mf"|"cf"|null} dLevel
 * @returns {boolean}
 */
export const isBlockResult = (aLevel, dLevel) => blowBlocked(aLevel, dLevel) && RANK[aLevel] === RANK[dLevel];

/**
 * Did the block turn the blow aside? The attack succeeded and the block succeeded at least as well, so the attacker does not strike. Blocking with a body location, the blow is then not lost: it lands on the location the defender chose.
 *
 * @param {"cs"|"ms"|"mf"|"cf"} aLevel
 * @param {"cs"|"ms"|"mf"|"cf"|null} dLevel
 * @returns {boolean}
 */
export const blowBlocked = (aLevel, dLevel) => isSuccess(aLevel) && isSuccess(dLevel) && RANK[dLevel] >= RANK[aLevel];
