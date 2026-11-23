/** The result-card lines for the Attacker's and Defender's Opportunity and for a tied Riposte. Only the card text lives here; the outcome itself (resolveOutcome, isBlockResult) is pure and lives in rules/outcome.mjs (not to be confused with this file's old name). */

import { L } from "./util.mjs";
import { esc } from "../escape.mjs";
import { cardLine, cardButtons } from "../chat.mjs";

/**
 * Result-card lines for an Attacker's / Defender's Opportunity: the announcement
 * plus an "Initiate ..." button. ata and dta are mutually exclusive, so at most
 * one shows. The button launches a classic attack from the clicker's controlled
 * token (wired in wireCombatCard), so the winner selects their token, targets
 * the foe, and clicks to strike. (data-ta values kept for older chat messages.)
 */
export function taLines(outcome, attacker, target) {
  if (outcome.ata) return [
    cardLine(`${esc(attacker.name)} &mdash; ${L("attackersOpportunity")}`, "ta"),
    cardButtons(`<button data-ta="ata">${L("initiateAttackersOpportunity")}</button>`)
  ];
  if (outcome.dta) return [
    cardLine(`${esc(target.name)} &mdash; ${L("defendersOpportunity")}`, "ta"),
    cardButtons(`<button data-ta="dta">${L("initiateDefendersOpportunity")}</button>`)
  ];
  return [];
}

/** Riposte on an equal success level: say which roll won the tie, or that it was dead even. */
export function tieLines(outcome) {
  const t = outcome.tie;
  if (!t) return [];
  const key = t.winner === "defender" ? "riposteTieDefender" : t.winner === "attacker" ? "riposteTieAttacker" : "riposteTieEven";
  return [cardLine(game.i18n.format(`SCARMARK.CombatAuto.${key}`, { a: t.a, d: t.d }))];
}
