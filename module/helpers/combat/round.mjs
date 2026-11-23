/** Fatigue and bleeding applied when the combat tracker enters a new round. */

import { addFatigue } from "../dice.mjs";
import { FLAGS } from "../../constants.mjs";
import { L } from "./util.mjs";
import { conditionAftermath } from "./wounds.mjs";
import { esc } from "../escape.mjs";
import { speak, cardHtml, cardLine } from "../chat.mjs";
import { ROUND_FATIGUE, BLEEDING_WL_PER_ROUND, FATIGUE_ROUND_INTERVAL } from "../../config/index.mjs";

/**
 * Auto-apply combat Fatigue and bleeding. When the tracker advances INTO a round
 * that is a multiple of FATIGUE_ROUND_INTERVAL (5, 10, 15 ...), every non-defeated
 * combatant that has a Fatigue resource gains ROUND_FATIGUE Fatigue, and each of its wounds
 * with Heavy Bleeding gets BLEEDING_WL_PER_ROUND WL (bleeding kills over time; a
 * bandage - clearing the flag - stops it). A combatant bled down to Condition 0
 * is taken out (conditionAftermath). Wired to the `updateCombat` hook.
 *
 * Only the single active GM runs it (so it fires once, not once per client), and
 * a per-combat flag stops it re-firing for a round already handled - e.g. the GM
 * stepping a round back and forward across the boundary. Unlinked NPC tokens keep
 * their own synthetic actor, so we go through `combatant.actor` (never
 * game.actors) and dedupe by actor uuid in case two combatants share one actor.
 */
export async function applyCombatRoundFatigue(combat, changed) {
  if (game.users.activeGM?.id !== game.user.id) return;   // one executor only
  if (!("round" in changed)) return;                       // only on a round change

  const round = combat.round ?? 0;
  if (round <= 0 || round % FATIGUE_ROUND_INTERVAL !== 0) return;
  if (combat.getFlag(FLAGS.scope, FLAGS.lastFatigueRound) === round) return;  // already done
  await combat.setFlag(FLAGS.scope, FLAGS.lastFatigueRound, round);

  const seen = new Set();
  const names = [];
  const bled = [];     // "Name (+2 WL)"
  const bledActors = [];
  for (const c of combat.combatants) {
    if (c.isDefeated) continue;
    const actor = c.actor;
    if (!actor || !foundry.utils.hasProperty(actor, "system.resources.fatigue")) continue;
    if (seen.has(actor.uuid)) continue; // one linked actor on two combatants: once
    seen.add(actor.uuid);
    await addFatigue(actor, ROUND_FATIGUE);
    names.push(actor.name);

    const bleeding = actor.items.filter(i => (i.type === "injury") && i.system.heavyBleeding);
    if (bleeding.length) {
      await actor.updateEmbeddedDocuments("Item", bleeding.map(i => ({ _id: i.id, "system.woundLevel": (i.system.woundLevel ?? 0) + BLEEDING_WL_PER_ROUND })));
      bled.push(game.i18n.format("SCARMARK.CombatAuto.bleedingWl", { name: actor.name, n: bleeding.length }));
      bledActors.push(actor);
    }
  }
  if (!names.length) return;

  const body = cardLine(game.i18n.format("SCARMARK.CombatAuto.fatigueTick", { round, n: ROUND_FATIGUE }))
    + cardLine(`${names.map(esc).join(", ")} &middot; <b>+${ROUND_FATIGUE}</b> ${game.i18n.localize("SCARMARK.Combat.fatigue")}`)
    + (bled.length ? cardLine(`🩸 ${L("bleedingTick")}: ${bled.map(esc).join(", ")}`) : "");
  await speak(null, cardHtml({ title: L("fatigueRound"), body }), { alias: L("fatigueRound") });

  for (const actor of bledActors) await conditionAftermath(actor);
}
