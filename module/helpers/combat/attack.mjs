/** Attack declaration: the melee and range attack dialogs and the public attack card that offers the defenses. Resolution of the chosen defense is resolve.mjs. */

import { fieldValue } from "../form-fields.mjs";
import { spendCapacity } from "../artifact-use.mjs";
import { readModifier } from "../modifier-prompt.mjs";
import { L, DialogV2 } from "./util.mjs";
import { speak, cardHtml, cardLine, cardPrompt, cardButtons } from "../chat.mjs";
import { weaponOptions, aspectOptions, aimPartFields, readAim, rewireAspect, rewireAim, missileOptions } from "./dialogs.mjs";
import { bestAspectKey, weaponAsl, missileAsl, actorToken } from "./lookup.mjs";
import { capTarget, rangeBand, aimKey, aimPartKey, aimPenalty } from "../../rules/index.mjs";
import { ARMOR_PIERCING_NAMES, DAMAGE_ASPECTS, RANGE_PENALTY } from "../../config/index.mjs";
import { esc, escAttr } from "../escape.mjs";

/** Card text for an aimed attack: the aim and part labels and the ASL penalty ("" for the default mid aim at no part in particular). */
const aimNoteText = (aim, part) => {
  const penalty = aimPenalty(aim, part);
  if (aim === "mid" && part === "general") return "";
  const where = part === "general" ? L("aim_" + aim) : `${L("aim_" + aim)}: ${L("part_" + part)}`;
  return ` &middot; ${where} ${penalty}`;
};

/** Card text for the attacker bonus or penalty from the target's status ("" when there is none). */
const vsNoteText = (vs) => (vs ? ` &middot; ${L("vsStatus")} ${vs > 0 ? "+" : "&minus;"}${Math.abs(vs)}` : "");

/** A measured distance for chat, in scene units: "4 m" (grid squares are whole metres). */
const fmtDistance = (d) => `${Math.round(d)}${canvas.scene?.grid?.units ? ` ${canvas.scene.grid.units}` : ""}`;

/** Run `declare` for the single controlled token's actor (the macros); warn when there is not exactly one. */
function fromControlledToken(declare) {
  const controlled = canvas.tokens?.controlled ?? [];
  if (controlled.length !== 1 || !controlled[0].actor) return ui.notifications.warn(L("selectOneToken"));
  return declare(controlled[0].actor);
}

/**
 * The single targeted token of an attack. Warns and returns null when the user has not targeted exactly one token, or when the target is the attacker itself.
 * @param {Actor} actor the attacker
 * @returns {Token|null}
 */
function singleTarget(actor) {
  const targets = Array.from(game.user.targets);
  if (targets.length !== 1) { ui.notifications.warn(L("needOneTarget")); return null; }
  const targetActor = targets[0].actor;
  if (!targetActor || targetActor === actor) { ui.notifications.warn(L("noSelfTarget")); return null; }
  return targets[0];
}

/**
 * Post the public attack card: who attacks whom, the one-line summary, and the defense buttons. The payload (`data`) rides on the card for resolve.mjs; melee cards also offer Riposte and Counterattack.
 * @param {object} o
 * @param {Actor}  o.actor        the attacker
 * @param {Actor}  o.targetActor
 * @param {object} o.data         the declared attack (data-combat payload)
 * @param {string} o.line         the summary line (HTML, already escaped)
 * @param {boolean} o.melee       also offer the strike-back defenses
 */
async function postAttackCard({ actor, targetActor, data, line, melee }) {
  const content = cardHtml({
    cls: "attack-card",
    attrs: `data-combat='${escAttr(JSON.stringify(data))}'`,
    title: `${esc(actor.name)} &rarr; ${esc(targetActor.name)}`,
    body: cardLine(line) + cardPrompt(L("chooseDefense"))
      + cardButtons(["ignore", "block", "dodge"].map(defense => `<button data-defense="${defense}">${L(defense)}</button>`).join(""))
      + (melee ? cardButtons(["riposte", "counterstrike"].map(defense => `<button data-defense="${defense}">${L(defense)}</button>`).join("")) : "")
  });
  await speak(actor, content);
}

/** Launch an attack from the currently controlled token (for the macro). */
export function initiateAttack() {
  return fromControlledToken(declareMeleeAttack);
}

/**
 * Melee attack: ask for weapon, aspect, aim and modifier, then post the attack card.
 * @param {Actor} actor the attacker
 * @param {string|null} [weaponId] weapon the dialog offers first (default: the actor's first unbroken weapon)
 */
export async function declareMeleeAttack(actor, weaponId = null) {
  const targetToken = singleTarget(actor);
  if (!targetToken) return;
  const targetActor = targetToken.actor;

  const weapons = actor.items.filter(i => i.type === "weapon" && !i.system.broken);
  if (!weapons.length) return ui.notifications.warn(L("noWeapons"));
  const preselect = weaponId ?? weapons[0].id;
  const preWeapon = actor.items.get(preselect) ?? weapons[0];

  const opts = await DialogV2.prompt({
    window: { title: L("attack") },
    content: `
      <div class="form-group"><label>${L("weapon")}</label><select name="weapon">${weaponOptions(actor, preselect)}</select></div>
      <div class="form-group"><label>${L("aspect")}</label><select name="aspect">${aspectOptions(bestAspectKey(preWeapon), preWeapon)}</select></div>
      ${aimPartFields(true, targetActor)}`,
    render: (event, dialog) => { rewireAspect(dialog, actor); rewireAim(dialog, targetActor); },
    ok: {
      label: L("attack"),
      callback: (e, b) => ({
        weaponId: fieldValue(b.form, "weapon"),
        aspect: fieldValue(b.form, "aspect"),
        ...readAim(b.form, targetActor),
        modifier: readModifier(b.form)
      })
    },
    rejectClose: false
  });
  if (!opts) return;
  const weapon = actor.items.get(opts.weaponId);
  if (!weapon) return;

  const aim = aimKey(opts.aim);
  const part = aimPartKey(aim, opts.part);

  // Target status vs melee (Prone +20 / Pinned Down +30) folds into the attacker's ASL.
  const vsMelee = targetActor.system.mods?.incomingMelee ?? 0;
  const data = {
    mode: "melee",
    attacker: actor.uuid,
    target: targetActor.uuid,
    weapon: weapon.id,
    aspect: opts.aspect,
    armorPiercing: ARMOR_PIERCING_NAMES.test(weapon.name),
    aim,
    part,
    // Capped here (source) so the declaration card, the serialized payload and
    // the resolution card all share the effective target: ESL >= 100 still fails ~5%.
    asl: capTarget(weaponAsl(actor, weapon) + opts.modifier + vsMelee + aimPenalty(aim, part))
  };
  const line = `${esc(weapon.name)} &middot; ${game.i18n.localize(DAMAGE_ASPECTS[opts.aspect])} &middot; ASL <b>${data.asl}</b>${vsNoteText(vsMelee)}${aimNoteText(data.aim, data.part)}`;
  await postAttackCard({ actor, targetActor, data, line, melee: true });
}

/** Launch a range attack from the controlled token (for the macro). */
export function initiateRangeAttack() {
  return fromControlledToken(declareRangeAttack);
}

/**
 * Range attack: ask for missile, aim and modifier, check ammo and range, spend the ammo (or the Magic Missile's Spirit Capacity) and post the attack card.
 * @param {Actor} actor the attacker
 * @param {string|null} [missileId] missile the dialog offers first (default: the actor's first missile)
 */
export async function declareRangeAttack(actor, missileId = null) {
  const targetToken = singleTarget(actor);
  if (!targetToken) return;
  const targetActor = targetToken.actor;

  const attackerToken = actorToken(actor);
  if (!attackerToken) return ui.notifications.warn(L("needTokens"));

  const missiles = actor.items.filter(i => i.type === "missile");
  if (!missiles.length) return ui.notifications.warn(L("noMissiles"));

  const opts = await DialogV2.prompt({
    window: { title: L("rangeAttack") },
    content: `
      <div class="form-group"><label>${L("missile")}</label><select name="missile">${missileOptions(actor, missileId ?? missiles[0].id)}</select></div>
      ${aimPartFields(false, targetActor)}`,
    render: (event, dialog) => rewireAim(dialog, targetActor),
    ok: { label: L("rangeAttack"), callback: (e, b) => ({ missileId: fieldValue(b.form, "missile"), ...readAim(b.form, targetActor), modifier: readModifier(b.form) }) },
    rejectClose: false
  });
  if (!opts) return;
  const missile = actor.items.get(opts.missileId);
  if (!missile) return;

  const magic = !!missile.system.magic;
  if (!magic && (missile.system.quantity ?? 0) <= 0) return ui.notifications.warn(L("outOfAmmo"));

  const distance = canvas.grid.measurePath([attackerToken.center, targetToken.center]).distance;
  const band = rangeBand(missile.system.range, distance);
  if (!band) return ui.notifications.warn(`${L("outOfRange")} (${fmtDistance(distance)})`);

  // Fire: spend one unit of ammo, or (Magic Missile) the spell's Class from Spirit Capacity.
  if (magic) {
    const cost = missile.system.spellClass ?? 1;
    const paid = await spendCapacity(actor, "spirit", cost);
    if (!paid.ok) return;
    await speak(actor, cardHtml({ body: cardLine(`${esc(missile.name)}: ${paid.label} &minus;${cost} (${paid.before} &rarr; ${paid.after})`) }));
  } else {
    await missile.update({ "system.quantity": Math.max(0, (missile.system.quantity ?? 1) - 1) });
  }

  // Disarm is a melee call: a missile attack that somehow carries it aims at the zone in general instead.
  const aim = opts.aim === "disarm" ? "mid" : aimKey(opts.aim);
  const part = aimPartKey(aim, opts.part);
  // Target status vs missiles (Prone/Pinned Down: -20 / -30) folds into the ASL.
  const vsMissile = targetActor.system.mods?.incomingMissile ?? 0;
  const asl = capTarget(missileAsl(actor, missile) + RANGE_PENALTY[band] + opts.modifier + vsMissile + aimPenalty(aim, part));

  const data = {
    mode: "range",
    attacker: actor.uuid,
    target: targetActor.uuid,
    aspect: missile.system.aspect,
    impact: missile.system.impact[band] ?? 0,
    skill: missile.system.associatedSkill,
    velocity: missile.system.velocity,
    armorPiercing: ARMOR_PIERCING_NAMES.test(missile.name),
    aim,
    part,
    asl
  };
  const bandLabel = game.i18n.localize(`SCARMARK.Missile.${band}`);
  const line = `${esc(missile.name)} &middot; ${bandLabel} (${fmtDistance(distance)}) &middot; ${game.i18n.localize(DAMAGE_ASPECTS[missile.system.aspect])} ${data.impact} &middot; ASL <b>${asl}</b>${vsNoteText(vsMissile)}${aimNoteText(aim, part)}`;
  await postAttackCard({ actor, targetActor, data, line, melee: false });
}
