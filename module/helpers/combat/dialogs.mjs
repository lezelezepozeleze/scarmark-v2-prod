/** Dialog building blocks: option lists, aim filter, aspect rewiring and the defense dialog. */

import { fieldValue, hasField } from "../form-fields.mjs";
import { availableAspects, bestAspectKey, isShield, isBodyPart } from "./lookup.mjs";
import { ALL_ASPECTS } from "./constants.mjs";
import { DAMAGE_ASPECTS, AIM } from "../../config/index.mjs";
import { modifierField, readModifier } from "../modifier-prompt.mjs";
import { L, DialogV2, locationName } from "./util.mjs";
import { esc } from "../escape.mjs";
import { aimKey, aimPartKeys, aimPartKey, aimPenalty, matchesAimPart, locationSide, rangedBlockShields } from "../../rules/index.mjs";

/** <option> list of the actor's melee weapons (broken ones excluded). */
export function weaponOptions(actor, selectedId) {
  return actor.items.filter(i => i.type === "weapon" && !i.system.broken)
    .map(w => `<option value="${w.id}"${w.id === selectedId ? " selected" : ""}>${esc(w.name)}</option>`)
    .join("");
}

/** Aspect <option>s. If a weapon is given, only its available aspects (>= 0). */
export function aspectOptions(selected, weapon) {
  const keys = weapon ? availableAspects(weapon) : ALL_ASPECTS;
  return keys
    .map(k => `<option value="${k}"${k === selected ? " selected" : ""}>${game.i18n.localize(DAMAGE_ASPECTS[k])}</option>`)
    .join("");
}

/** In an attack/counterattack dialog, rebuild the aspect dropdown when the
 *  chosen weapon changes, so -1 (absent) aspects are never offered. */
export function rewireAspect(dialog, actor) {
  const root = dialog?.element ?? dialog;
  const weaponSel = root?.querySelector?.('select[name="weapon"]');
  const aspectSel = root?.querySelector?.('select[name="aspect"]');
  if (!weaponSel || !aspectSel) return;
  weaponSel.addEventListener("change", () => {
    const w = actor.items.get(weaponSel.value);
    if (w) aspectSel.innerHTML = aspectOptions(bestAspectKey(w), w);
  });
}

/** <option> list of the actor's body locations (a blank one first): the places a block without a weapon can turn a blow onto. */
function armorLocationOptions(actor) {
  return `<option value=""></option>` + actor.items.filter(i => i.type === "armorLocation")
    .map(l => `<option value="${l.id}">${esc(locationName(l, l.system.locationType))}</option>`)
    .join("");
}

/** In a block dialog, choosing a body location blanks the weapon and choosing a weapon blanks the body location: a block uses one or the other. */
function rewireBlockChoice(dialog) {
  const root = dialog?.element ?? dialog;
  const weaponSel = root?.querySelector?.('select[name="weapon"]');
  const armorSel = root?.querySelector?.('select[name="armor"]');
  if (!weaponSel || !armorSel) return;
  weaponSel.addEventListener("change", () => { if (weaponSel.value) armorSel.value = ""; });
  armorSel.addEventListener("change", () => { if (armorSel.value) weaponSel.value = ""; });
}

/**
 * <option> list of the aims one can choose (mid, high, low, and disarm for melee), only those the target has something to aim at.
 * @param {boolean} [melee]  offer Disarm too
 * @param {{type: string, side: string}[]|null} [locations]  the target's hit locations (null = no restriction)
 * @returns {string} HTML; "" when the target offers no aim
 */
export function aimOptions(melee = true, locations = null) {
  // Disarm is a melee call, and every aim is offered only when the target has something to aim at.
  const keys = (melee ? ["mid", "high", "low", "disarm"] : ["mid", "high", "low"]).filter(k => aimPartKeys(k, locations).length);
  // The penalty in the label is AIM's, so the dialog and the config cannot disagree.
  const label = (k) => (AIM[k].penalty
    ? game.i18n.format("SCARMARK.CombatAuto.aimOption", { name: L("aim_" + k), penalty: AIM[k].penalty })
    : game.i18n.format("SCARMARK.CombatAuto.aimOptionNone", { name: L("aim_" + k) }));
  return keys.map(k => `<option value="${k}">${label(k)}</option>`).join("");
}

/** The hit locations a target has, as the aim rules read them ([{ type, side }]). */
export const targetLocations = (actor) => actor.items
  .filter(i => i.type === "armorLocation")
  .map(i => ({ type: i.system.locationType, side: locationSide(i) }));

/** <option> list of the parts one can aim at in a zone ("General" and the called parts of config AIM), each with its total penalty. */
export function aimPartOptions(aim, selected = null, locations = null) {
  const chosen = aimPartKey(aim, selected, locations);
  return aimPartKeys(aim, locations)
    .map(k => {
      const penalty = aimPenalty(aim, k);
      const name = L("part_" + k);
      const label = penalty
        ? game.i18n.format("SCARMARK.CombatAuto.aimOption", { name, penalty })
        : game.i18n.format("SCARMARK.CombatAuto.aimOptionNone", { name });
      return `<option value="${k}"${k === chosen ? " selected" : ""}>${label}</option>`;
    })
    .join("");
}

/** The aim part of an attack dialog: the target and part selects, and the read-only field that shows the aim's penalty (the manual "modifier" field stays separate). Offers only what the target has. */
export function aimPartFields(melee, targetActor) {
  const locations = targetLocations(targetActor);
  const aim = aimKey(/value="(\w+)"/.exec(aimOptions(melee, locations))?.[1]);
  return `
      <div class="form-group"><label>${L("aim")}</label><select name="aim">${aimOptions(melee, locations)}</select></div>
      <div class="form-group"><label>${L("aimPart")}</label><select name="part">${aimPartOptions(aim, null, locations)}</select></div>
      <div class="form-group"><label>${L("modifier")}</label>
        <div class="form-fields">
          <input type="number" name="aimModifier" value="${aimPenalty(aim, aimPartKey(aim, null, locations))}" readonly tabindex="-1" title="${L("aimModifierHint")}" />
          <input type="number" name="modifier" value="0" step="1" title="${L("modifierHint")}" />
        </div></div>`;
}

/** Read the aim and part a dialog returned: an unknown aim is mid, an unknown part the first part offered. */
export function readAim(form, targetActor) {
  const aim = aimKey(fieldValue(form, "aim"));
  return { aim, part: aimPartKey(aim, fieldValue(form, "part"), targetLocations(targetActor)) };
}

/** In an attack dialog, offer the parts of the chosen aim the target has and show the penalty of the chosen part. */
export function rewireAim(dialog, targetActor) {
  const root = dialog?.element ?? dialog;
  const aimSel = root?.querySelector?.('select[name="aim"]');
  const partSel = root?.querySelector?.('select[name="part"]');
  const shown = root?.querySelector?.('input[name="aimModifier"]');
  if (!aimSel || !partSel) return;
  const locations = targetLocations(targetActor);
  const showPenalty = () => { if (shown) shown.value = String(aimPenalty(aimKey(aimSel.value), partSel.value)); };
  aimSel.addEventListener("change", () => { partSel.innerHTML = aimPartOptions(aimKey(aimSel.value), null, locations); showPenalty(); });
  partSel.addEventListener("change", showPenalty);
  showPenalty();
}

/** Narrow the struck location to the part the attacker called ("general" and a part the target has no location for leave the zone roll alone). */
export function aimFilter(aim, part) {
  const chosen = aimPartKey(aim, part); // Disarm with no part named (an old card) takes its first hand
  return chosen === "general" || !chosen ? null : (l => matchesAimPart(aim, chosen, l.system.locationType, locationSide(l)));
}

/** <option> list of the actor's missiles. */
export function missileOptions(actor, selectedId) {
  return actor.items.filter(i => i.type === "missile")
    .map(m => `<option value="${m.id}"${m.id === selectedId ? " selected" : ""}>${esc(m.name)}</option>`)
    .join("");
}

/**
 * Ask how the target defends: weapon (Block, Riposte, Counterattack), body location (Block without a weapon, melee only: the weapon is then blank), aspect (Riposte, Counterattack) and a modifier.
 *
 * @param {string} defense  ignore | block | dodge | riposte | counterstrike
 * @param {Actor}  targetActor  the defender
 * @param {object|null} data  the declared attack (a range card restricts Block to the shields that can stop missiles); null for a defense roll outside an attack
 * @returns {Promise<{weaponId: string, armorLocationId: string, aspect: string, modifier: number}|{}|null>} the answer ("" for a field the defense does not ask); `{}` for Ignore (no dialog); `null` when there is no weapon to offer (a notification says why) or the dialog was closed
 */
export async function promptDefense(defense, targetActor, data) {
  if (defense === "ignore") return {};

  const modRow = modifierField({ label: L("modifier") });
  // Counterattack and Riposte answer with a strike, so they also pick an aspect.
  const strikesBack = defense === "counterstrike" || defense === "riposte";
  // A melee block can be made with a weapon or with a body location (the blow is turned onto it); a missile can only be blocked with a shield.
  const blockWithArmor = defense === "block" && data?.mode !== "range";
  let content = "";
  if (defense === "block" || strikesBack) {
    let offered;
    if (defense === "block" && data?.mode === "range") {
      // Missiles can only be blocked with specific shields (by name).
      const allowed = new Set(rangedBlockShields(data.velocity).map(n => n.toLowerCase()));
      offered = targetActor.items.filter(i => i.type === "weapon" && !i.system.broken && allowed.has(i.name.toLowerCase()));
      if (!offered.length) { ui.notifications.warn(L("noShield")); return null; }
    } else if (defense === "riposte") {
      // A Riposte parries and answers with a real weapon: no shield, and no
      // natural weapon or body part (WQ 0) - a bite or claw cannot parry a blade.
      offered = targetActor.items.filter(i => i.type === "weapon" && !i.system.broken && !isShield(i) && !isBodyPart(i));
      if (!offered.length) { ui.notifications.warn(L("noRiposteWeapon")); return null; }
    } else {
      offered = targetActor.items.filter(i => i.type === "weapon" && !i.system.broken);
    }
    // With a body location on offer the weapon box has a blank option too, and still starts on the first weapon.
    const options = (blockWithArmor ? `<option value=""></option>` : "")
      + offered.map((w, i) => `<option value="${w.id}"${blockWithArmor && i === 0 ? " selected" : ""}>${esc(w.name)}</option>`).join("");
    content += `<div class="form-group"><label>${L("weapon")}</label><select name="weapon">${options}</select></div>`;
    if (blockWithArmor) content += `<div class="form-group"><label>${L("armor")}</label><select name="armor">${armorLocationOptions(targetActor)}</select></div>`;
    if (strikesBack) {
      // Aspects of the weapon the dropdown shows first (not merely the actor's first weapon,
      // which may be broken or, for a Riposte, a shield that is not offered).
      const first = offered[0];
      content += `<div class="form-group"><label>${L("aspect")}</label><select name="aspect">${aspectOptions(first ? bestAspectKey(first) : "edged", first)}</select></div>`;
    }
  }
  content += modRow;

  const answer = await DialogV2.prompt({
    window: { title: `${L(defense)}` },
    content,
    render: (event, dialog) => {
      if (strikesBack) rewireAspect(dialog, targetActor);
      if (blockWithArmor) rewireBlockChoice(dialog);
    },
    ok: {
      label: L(defense),
      callback: (e, b) => ({
        weaponId: fieldValue(b.form, "weapon", ""),
        armorLocationId: fieldValue(b.form, "armor", ""),
        aspect: fieldValue(b.form, "aspect", ""),
        modifier: hasField(b.form, "modifier") ? readModifier(b.form) : 0
      })
    },
    rejectClose: false
  });
  // A melee block needs a weapon or a body location.
  if (answer && blockWithArmor && !answer.weaponId && !answer.armorLocationId) {
    ui.notifications.warn(L("chooseBlock"));
    return null;
  }
  return answer;
}
