/** Skill and attribute tests (d100 against a skill ESL or an attribute x multiplier): the sheet rolls and the two macros. */
import { fieldNumber, fieldValue } from "../form-fields.mjs";
import { ATTRIBUTES, ATTRIBUTE_TEST_MULTIPLIER } from "../../config/index.mjs";
import { capTarget } from "../../rules/index.mjs";
import { esc } from "../escape.mjs";
import { modifierField, readModifier, promptModifier } from "../modifier-prompt.mjs";
import { rollD100Test, controlledActor } from "./shared.mjs";

const t = (key) => game.i18n.localize(key);

/**
 * Ask for the multiplier and the modifier of a test against an attribute (a dialog) and work out what to roll.
 * Target = effective attribute (after fatigue, load and wound penalties) x multiplier (default x5), plus the modifier.
 * The multiplier is asked since the Core Rules allow 3-7 depending on GM/difficulty.
 *
 * @returns {Promise<{title: string, target: number}|null>} the title of the roll and its target; null when the actor has no such attribute or the dialog was closed
 */
export async function attributeTestTarget(actor, attributeKey) {
  const attr = actor.system.attributes?.[attributeKey];
  if (!attr) return null;

  const label = t(ATTRIBUTES[attributeKey]?.label ?? attributeKey);

  const dialogResult = await foundry.applications.api.DialogV2.prompt({
    window: { title: `${label} ${t("SCARMARK.Test")}` },
    content: `
      <div class="form-group">
        <label>${t("SCARMARK.TestMultiplier")}</label>
        <input type="number" name="multiplier" value="${ATTRIBUTE_TEST_MULTIPLIER}" min="1" step="1" autofocus />
      </div>
      ${modifierField()}`,
    ok: {
      label: t("SCARMARK.Test"),
      callback: (event, button) => ({
        multiplier: fieldNumber(button.form, "multiplier", ATTRIBUTE_TEST_MULTIPLIER),
        modifier: readModifier(button.form)
      })
    },
    rejectClose: false
  });
  if (!dialogResult) return null;
  const { multiplier, modifier } = dialogResult;
  return { title: `${label} ${t("SCARMARK.Test")}`, target: capTarget((attr.effective * multiplier) + modifier) };
}

/**
 * Roll a d100 test against an attribute and post its card.
 * Success levels: multiples of 5 are critical (CS if <= target, CF if > target), otherwise regular success/failure.
 */
export async function rollAttributeTest(actor, attributeKey) {
  const test = await attributeTestTarget(actor, attributeKey);
  if (test) await rollD100Test(actor, test.title, test.target);
}

/**
 * Skill Test macro (game.scarmark.skillTest): pick one of the actor's skills + a modifier in
 * a dialog, then roll d100 vs ESL + modifier.
 * @param {Actor} [actor] defaults to the controlled token's actor, else the user's character
 */
export async function skillTest(actor) {
  actor ??= controlledActor();
  if (!actor) return ui.notifications.warn(t("SCARMARK.CombatAuto.selectOneToken"));
  const skills = actor.items.filter(i => i.type === "skill");
  if (!skills.length) return ui.notifications.warn(t("SCARMARK.RollTest.noSkills"));

  const options = skills.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join("");
  const res = await foundry.applications.api.DialogV2.prompt({
    window: { title: t("SCARMARK.RollTest.skillTest") },
    content: `
      <div class="form-group"><label>${t("SCARMARK.RollTest.skill")}</label><select name="skill">${options}</select></div>
      ${modifierField()}`,
    ok: { label: t("SCARMARK.Test"), callback: (e, b) => ({ skillId: fieldValue(b.form, "skill"), modifier: readModifier(b.form) }) },
    rejectClose: false
  });
  if (!res) return;

  const skill = actor.items.get(res.skillId);
  if (!skill) return;   // the skill was deleted while the dialog was open
  const target = capTarget(skill.system.esl + res.modifier);
  await rollD100Test(actor, `${skill.name} ${t("SCARMARK.Test")}`, target);
}

/**
 * Attribute Test macro (game.scarmark.attributeTest): pick one of the actor's attributes, a
 * Multiplier (default 5) and a Modifier in a dialog, then roll d100 vs
 * effective attribute x multiplier + modifier.
 * @param {Actor} [actor] defaults to the controlled token's actor, else the user's character
 */
export async function attributeTest(actor) {
  actor ??= controlledActor();
  if (!actor) return ui.notifications.warn(t("SCARMARK.CombatAuto.selectOneToken"));
  const attrs = actor.system.attributes ?? {};

  // Configured keys only (a stray entry left by an effect on a removed attribute has no label).
  const options = Object.keys(ATTRIBUTES).filter(key => attrs[key])
    .map(key => `<option value="${key}">${t(ATTRIBUTES[key].label)}</option>`).join("");
  const res = await foundry.applications.api.DialogV2.prompt({
    window: { title: t("SCARMARK.RollTest.attributeTest") },
    content: `
      <div class="form-group"><label>${t("SCARMARK.RollTest.attribute")}</label><select name="attr">${options}</select></div>
      <div class="form-group"><label>${t("SCARMARK.TestMultiplier")}</label><input type="number" name="mult" value="${ATTRIBUTE_TEST_MULTIPLIER}" min="1" step="1" /></div>
      ${modifierField()}`,
    ok: {
      label: t("SCARMARK.Test"),
      callback: (e, b) => ({
        attr: fieldValue(b.form, "attr"),
        mult: fieldNumber(b.form, "mult", ATTRIBUTE_TEST_MULTIPLIER),
        modifier: readModifier(b.form)
      })
    },
    rejectClose: false
  });
  if (!res) return;

  const label = t(ATTRIBUTES[res.attr].label);
  const target = capTarget((attrs[res.attr].effective * res.mult) + res.modifier);
  await rollD100Test(actor, `${label} ${t("SCARMARK.Test")}`, target);
}

/**
 * Ask for the modifier of a test of a skill (a dialog) and work out what to roll: directly against its ESL (no multiplier - skills are tested straight against Effective Skill Level, unlike attributes).
 *
 * @returns {Promise<{title: string, target: number}|null>} the title of the roll and its target; null when the actor has no such skill or the dialog was closed
 */
export async function skillTestTarget(actor, skillId) {
  const skill = actor.items.get(skillId);
  if (!skill) return null;

  const modifier = await promptModifier({ title: `${skill.name} ${t("SCARMARK.Test")}`, okLabel: t("SCARMARK.Test") });
  if (modifier === null) return null;

  return { title: `${skill.name} ${t("SCARMARK.Test")}`, target: capTarget(skill.system.esl + modifier) };
}

/** Roll a d100 test for a skill and post its card. */
export async function rollSkillTest(actor, skillId) {
  const test = await skillTestTarget(actor, skillId);
  if (test) await rollD100Test(actor, test.title, test.target);
}
