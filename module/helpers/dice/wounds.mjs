/** Wound rolls: Shock Roll, Mend Rate Roll and the free "other damage" roll. */
import { fieldNumber, fieldValue } from "../form-fields.mjs";
import { FLAGS } from "../../constants.mjs";
import { shockTarget, mendWoundLevelDelta, mendTarget, capTarget } from "../../rules/index.mjs";
import { SHOCK_FALLBACK_PCT, ESL_CAP, DAMAGE_ASPECTS } from "../../config/index.mjs";
import { outcomeLabel, testCard, speak } from "../chat.mjs";
import { promptModifier } from "../modifier-prompt.mjs";
import { rollD100 } from "./shared.mjs";

/**
 * Shock Roll: d100 against 2 x Condition % (capped at 95), so
 * Condition 25 % is 50 / 50 and every point closer to 0 makes it harder.
 * Endurance decides WHEN you get to the edge (the size of the Condition pool),
 * not how long you last there. The strike card asks for it after each new
 * wound once Condition is at 25 % or less; the Combat tab's Shock button rolls
 * the same test (also for poison, overdose ...). Outcomes:
 *   CS -> grit your teeth: no more Shock Rolls this combat (flag per combat)
 *   S  -> fights on
 *   F  -> out of the fight: falls Prone, no attack and no active defense, conscious
 *   CF -> unconscious
 */
export async function rollShock(actor) {
  if (!actor) return;
  const pct = actor.system.condition?.pct ?? SHOCK_FALLBACK_PCT;
  const target = shockTarget(pct, ESL_CAP);
  const { roll, level } = await rollD100(target);
  const resultKey = { cs: "shockGrit", ms: "shockStands", mf: "shockDowned", cf: "shockUnconscious" }[level];

  await speak(actor, testCard({
    title: `${actor.name} - ${game.i18n.localize("SCARMARK.Combat.shockTitle")} (${game.i18n.localize("SCARMARK.Condition")} ${pct} %)`,
    target,
    roll: roll.total,
    label: `${outcomeLabel(level)} &middot; ${game.i18n.localize(`SCARMARK.Combat.${resultKey}`)}`,
    cls: `outcome-${level}`
  }), { rolls: [roll] });

  try {
    if (level === "mf") await actor.toggleStatusEffect("prone", { active: true });
    else if (level === "cf") await actor.toggleStatusEffect("unconscious", { active: true });
    else if ((level === "cs") && game.combat) await actor.setFlag(FLAGS.scope, FLAGS.shockGrit, game.combat.id);
  } catch (err) {
    console.warn("Scarmark | could not apply the Shock Roll result", err);
  }
}

/**
 * Mend Rate Roll. Fired from an injury's Mend value.
 * Target is FIXED = Endurance x current Mend Rate; the dialog only offers a
 * situational Modifier. d100 <= target succeeds. Outcome adjusts Wound Level:
 * CS -2, MS -1, MF 0, CF +1. When WL reaches 0 the wound is healed (item removed).
 * MRN (Mend 0) = narrative, no mechanical roll.
 *
 * @param {Actor} actor   The owner (needs Endurance).
 * @param {Item}  injury  The injury item being healed.
 */
export async function rollMendRate(actor, injury) {
  if (!injury) return;
  if (!actor) return ui.notifications.warn(game.i18n.localize("SCARMARK.Injury.mendNeedsActor"));
  const mend = injury.system.mend ?? 0;
  if (mend <= 0) return ui.notifications.info(game.i18n.localize("SCARMARK.Injury.mendMRN"));

  const endurance = actor.system.endurance ?? 0;
  const base = mendTarget(endurance, mend);
  const title = `${injury.name} - ${game.i18n.localize("SCARMARK.Injury.mendRoll")}`;

  const modifier = await promptModifier({
    title,
    okLabel: game.i18n.localize("SCARMARK.Test"),
    before: `<div class="form-group"><label>${game.i18n.localize("SCARMARK.Target")}</label><input type="number" value="${base}" disabled /></div>`
  });
  if (modifier === null) return;

  const target = capTarget(base + modifier); // ESL >= 100 still fails ~5%
  const { roll, level } = await rollD100(target);
  const delta = mendWoundLevelDelta(level);
  const oldWL = injury.system.woundLevel ?? 0;
  const newWL = Math.max(0, oldWL + delta);

  let resultText;
  if (newWL <= 0) {
    resultText = game.i18n.localize("SCARMARK.Injury.healed");
    await injury.delete();
  } else {
    resultText = game.i18n.format("SCARMARK.Injury.wlChange", { from: oldWL, to: newWL });
    if (newWL !== oldWL) await injury.update({ "system.woundLevel": newWL });
  }

  await speak(actor, testCard({ title, target, roll: roll.total, level, label: `${outcomeLabel(level)} &middot; ${resultText}` }), { rolls: [roll] });
}

/**
 * "Other Weapon Damage" roll: a free damage roll (Num d6 + additional impact),
 * tagged with a chosen aspect, posted to chat.
 */
export async function rollOtherDamage(actor) {
  const aspectOptions = Object.entries(DAMAGE_ASPECTS)
    .map(([key, label]) => `<option value="${key}">${game.i18n.localize(label)}</option>`)
    .join("") + `<option value="other">${game.i18n.localize("SCARMARK.Combat.aspectOther")}</option>`;

  const result = await foundry.applications.api.DialogV2.prompt({
    window: { title: game.i18n.localize("SCARMARK.Combat.damageTitle") },
    content: `
      <div class="form-group">
        <label>${game.i18n.localize("SCARMARK.Combat.numDice")}</label>
        <input type="number" name="dice" value="1" min="1" step="1" autofocus />
      </div>
      <div class="form-group">
        <label>${game.i18n.localize("SCARMARK.Combat.aspect")}</label>
        <select name="aspect">${aspectOptions}</select>
      </div>
      <div class="form-group">
        <label>${game.i18n.localize("SCARMARK.Combat.additionalImpact")}</label>
        <input type="number" name="impact" value="${actor?.system?.mods?.impact ?? 0}" step="1" />
      </div>`,
    ok: {
      label: game.i18n.localize("SCARMARK.Combat.roll"),
      callback: (event, button) => ({
        dice: fieldNumber(button.form, "dice", 1),
        aspect: fieldValue(button.form, "aspect"),
        impact: fieldNumber(button.form, "impact", 0)
      })
    },
    rejectClose: false
  });
  if (!result) return;

  const dice = Math.max(1, Math.trunc(result.dice));   // Foundry rejects "1.5d6"
  const impact = Math.trunc(result.impact);
  const roll = await new Roll(`${dice}d6 ${impact < 0 ? "-" : "+"} ${Math.abs(impact)}`).evaluate();
  const aspectLabel = result.aspect === "other"
    ? game.i18n.localize("SCARMARK.Combat.aspectOther")
    : game.i18n.localize(DAMAGE_ASPECTS[result.aspect]);
  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: `${game.i18n.localize("SCARMARK.Combat.damageTitle")} - ${aspectLabel}`
  });
}
