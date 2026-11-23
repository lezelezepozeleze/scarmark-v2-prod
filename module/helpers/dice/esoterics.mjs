/** Esoteric rolls: Invocations (Faith Points), Spells (Spirit Capacity, Fatigue) and Psionic talents (Fatigue), and the macro that picks a talent. */
import { fieldValue } from "../form-fields.mjs";
import { spendCapacity } from "../artifact-use.mjs";
import { invocationTarget, invocationFpCost, spellTarget, spellFatigue, psionicTarget, capTarget } from "../../rules/index.mjs";
import { testBlock, speak, cardHtml, cardLine, cardSep } from "../chat.mjs";
import { esc } from "../escape.mjs";
import { modifierField, readModifier } from "../modifier-prompt.mjs";
import { addFatigue, rollD100 } from "./shared.mjs";

/**
 * The skill an esoteric item (Invocation / Spell) rolls against. Matches the
 * item's Religion / Magic Type name case-insensitively among the actor's Esoterics
 * skills of that kind ("religion" or "arcane"); with no match (e.g. a common invocation
 * set to "All", or an empty field) the actor's ONLY skill of that kind is used.
 * @returns {{skill: Item|null, candidates: Item[]}}  candidates = all Esoterics skills of the kind
 */
export function findEsotericSkill(actor, kind, name) {
  const candidates = actor.items.filter(i => i.type === "skill" && i.system.category === "esoterics" && i.system.esotericKind === kind);
  const wanted = String(name ?? "").trim().toLowerCase();
  const exact = wanted ? candidates.find(s => s.name.toLowerCase() === wanted) : null;
  return { skill: exact ?? (candidates.length === 1 ? candidates[0] : null), candidates };
}

/** Resolve the esoteric skill, asking the user to pick one when it's ambiguous. */
async function pickEsotericSkill(actor, kind, name, title) {
  const { skill, candidates } = findEsotericSkill(actor, kind, name);
  if (skill || candidates.length < 2) return skill;
  const options = candidates.map(s => `<option value="${s.id}">${esc(game.i18n.format("SCARMARK.Esoterics.pickerOption", { name: s.name, esl: s.system.esl }))}</option>`).join("");
  const id = await foundry.applications.api.DialogV2.prompt({
    window: { title },
    content: `<div class="form-group"><label>${title}</label><select name="skill">${options}</select></div>`,
    ok: { label: game.i18n.localize("SCARMARK.Test"), callback: (e, b) => fieldValue(b.form, "skill") },
    rejectClose: false
  });
  return id ? actor.items.get(id) : null;
}

/** Post an esoteric roll (Invocation/Spell/Psionic): test block + effect lines. */
async function postEsotericRoll(actor, title, target, level, roll, extraLines) {
  const lines = extraLines.length ? `${cardSep}${extraLines.map(line => cardLine(line)).join("")}` : "";
  await speak(actor, cardHtml({ body: testBlock({ title, target, roll: roll.total, level }) + lines }), { rolls: [roll] });
}

/**
 * Roll an Invocation against its Religion skill's ESL, then auto-spend Faith
 * Points from that skill per the outcome:
 *   CS -> FP 0
 *   MS -> FP -Circle
 *   MF -> FP 0
 *   CF -> FP -Circle
 * No Fatigue: the god works the miracle, the invoker only pays FP (unlike magic
 * and psionics, which are the caster's own mental effort).
 * (Circle = the invocation's FP Cost.) The Religion skill is found by name, or -
 * for a common "All" invocation - the actor's own Religion skill (asked if several).
 * With fewer FP than the Circle the user confirms first (Pious Acts can start at 0).
 */
export async function rollInvocation(actor, invocationId) {
  if (!actor) return;
  const inv = actor.items.get(invocationId);
  if (!inv) return;

  const skill = await pickEsotericSkill(actor, "religion", inv.system.religion, game.i18n.localize("SCARMARK.Invocation.religion"));
  if (!skill) return ui.notifications.warn(game.i18n.localize("SCARMARK.Invocation.noReligion"));

  const circle = inv.system.circle;
  const faith = skill.system.faithPoints ?? 0;
  if (faith < circle) {
    const ok = await foundry.applications.api.DialogV2.confirm({
      window: { title: inv.name },
      content: `<p>${game.i18n.format("SCARMARK.Invocation.notEnoughFp", { fp: faith, circle, skill: esc(skill.name) })}</p>`,
      rejectClose: false
    });
    if (!ok) return;
  }
  // Circle also raises difficulty (invocationTarget).
  const target = capTarget(invocationTarget(skill.system.esl, circle));
  const { roll, level } = await rollD100(target);

  const fp = invocationFpCost(level, circle);

  const newFp = Math.max(0, faith - fp);
  if (fp) await skill.update({ "system.faithPoints": newFp });

  const extra = [];
  if (fp) extra.push(`${game.i18n.localize("SCARMARK.Skills.piety")} &minus;${fp} (${esc(skill.name)}: ${newFp})`);

  await postEsotericRoll(actor, inv.name, target, level, roll, extra);
}

/**
 * Cast a Spell against its Magic skill's ESL minus the Level penalty (Arcane
 * Rules: -5 per Level above 1, rules/esoterics.mjs spellLevelPenalty). Outcomes:
 *   CS / S -> the spell works, no Fatigue
 *   F      -> fizzles: +1 Fatigue, -1 rune charge
 *   CF     -> Misfire: +2 Fatigue, -1 rune charge, then Misfire d100 + Spirit test
 * Rune charges and the Misfire / Spirit tables stay at the table (card reminder).
 */
export async function rollSpell(actor, spellId) {
  if (!actor) return;
  const spell = actor.items.get(spellId);
  if (!spell) return;

  const skill = await pickEsotericSkill(actor, "arcane", spell.system.magicType, game.i18n.localize("SCARMARK.Spell.magicType"));
  if (!skill) return ui.notifications.warn(game.i18n.localize("SCARMARK.Spell.noMagic"));

  // Casting spends the spell's Class from Spirit Capacity (win or lose).
  const paid = await spendCapacity(actor, "spirit", spell.system.level);
  if (!paid.ok) return;

  const target = capTarget(spellTarget(skill.system.esl, spell.system.level));
  const { roll, level } = await rollD100(target);

  const fatigue = spellFatigue(level);
  await addFatigue(actor, fatigue);

  const extra = [`${paid.label} &minus;${spell.system.level} (${paid.before} &rarr; ${paid.after})`];
  if (fatigue) extra.push(`${game.i18n.localize("SCARMARK.Combat.fatigue")} +${fatigue}`);
  if (level === "mf") extra.push(game.i18n.localize("SCARMARK.Spell.fizzle"));
  if (level === "cf") extra.push(`<strong>${game.i18n.localize("SCARMARK.Spell.misfire")}</strong>`);
  await postEsotericRoll(actor, spell.name, target, level, roll, extra);
}

/**
 * Use a Psionic talent against its ESL; using it accrues the talent's Fatigue
 * value.
 * @param {Actor} actor
 * @param {string} psionicId  id of the psionic item
 * @param {number} [modifier] situational modifier added to the ESL
 */
export async function rollPsionic(actor, psionicId, modifier = 0) {
  if (!actor) return;
  const psi = actor.items.get(psionicId);
  if (!psi) return;

  const target = capTarget(psionicTarget(psi.system.esl ?? 0, modifier));
  const { roll, level } = await rollD100(target);

  const fatigue = psi.system.fatigue ?? 0;
  await addFatigue(actor, fatigue);

  const extra = [];
  if (modifier) extra.push(`${game.i18n.localize("SCARMARK.Esoterics.modifier")} ${modifier > 0 ? "+" : ""}${modifier}`);
  if (fatigue) extra.push(`${game.i18n.localize("SCARMARK.Combat.fatigue")} +${fatigue}`);
  // On a Critical Failure, surface the talent's Misfire backlash in the card.
  if (level === "cf" && psi.system.misfire) {
    const mf = await foundry.applications.ux.TextEditor.implementation.enrichHTML(psi.system.misfire, { relativeTo: psi });
    extra.push(`<strong>${game.i18n.localize("SCARMARK.Psionic.misfire")}:</strong> ${mf}`);
  }
  await postEsotericRoll(actor, psi.name, target, level, roll, extra);
}

/**
 * Macro entry point: pick one of the acting actor's Psionic Talents from a
 * dropdown, enter a Modifier, then roll it (via rollPsionic). The actor is the
 * single controlled token's actor, else the user's assigned character.
 * Exposed as game.scarmark.initiatePsionicTalent().
 */
export async function initiatePsionicTalent() {
  const controlled = canvas.tokens?.controlled ?? [];
  const actor = (controlled.length === 1 ? controlled[0].actor : null) ?? game.user.character;
  if (!actor) return ui.notifications.warn(game.i18n.localize("SCARMARK.Esoterics.noActor"));

  const psionics = actor.items.filter(i => i.type === "psionic");
  if (!psionics.length) return ui.notifications.warn(game.i18n.localize("SCARMARK.Esoterics.noPsionics"));

  const options = psionics
    .map(p => `<option value="${p.id}">${esc(game.i18n.format("SCARMARK.Esoterics.pickerOption", { name: p.name, esl: p.system.esl }))}</option>`)
    .join("");
  const result = await foundry.applications.api.DialogV2.prompt({
    window: { title: game.i18n.localize("SCARMARK.Esoterics.initiateTitle") },
    content: `
      <div class="form-group">
        <label>${game.i18n.localize("SCARMARK.Esoterics.pickTalent")}</label>
        <select name="psionic">${options}</select>
      </div>
      ${modifierField({ label: game.i18n.localize("SCARMARK.Esoterics.modifier"), step: 5 })}`,
    ok: {
      label: game.i18n.localize("SCARMARK.Esoterics.roll"),
      callback: (event, button) => ({
        id: fieldValue(button.form, "psionic"),
        mod: readModifier(button.form)
      })
    },
    rejectClose: false
  });
  if (result?.id) await rollPsionic(actor, result.id, result.mod);
}
