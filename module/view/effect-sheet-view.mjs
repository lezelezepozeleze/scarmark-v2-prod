/**
 * The view model of the effect sheet (sheets/effect-sheet.mjs, templates/effect/sheet.hbs): everything the template shows, worked out here so the template only loops and prints. Pure: the text comes through `localize`.
 */
import { CHARACTER_CHANGE_TYPES, SIMPLE_CHANGE_TYPES, DURATION_UNITS, EFFECT_TARGET_CHARACTER, ITEM_MOD_DEFAULT_PRIORITY, ON_HIT_ITEM_TYPES, ALTERATION_REPAIR, EFFECT_DEFAULT_IMG } from "../config/index.mjs";
import { FLAGS } from "../constants.mjs";
import { option } from "./options.mjs";
import { effectFlags, rewriteTarget } from "../rules/index.mjs";

/** Roll-down groups with a blank group first (nothing chosen), the blank one marked when `current` is empty. */
const ITEM_TYPES_WITH_REPAIR = ["armor", "weapon"];

const withBlank = (groups, current) => [{ label: "", options: [option("", "", current)] }, ...groups];

/** Stat groups as roll-down groups with the current key selected; a key no group offers (typed by hand, or left from another type) gets a group of its own so it is not lost. */
function keyGroups(groups, current, t) {
  const result = groups.map(group => ({ label: group.label, options: group.options.map(([value, label]) => option(value, label, current)) })).filter(group => group.options.length);
  if (current && !result.some(group => group.options.some(entry => entry.selected))) result.push({ label: t("SCARMARK.Effect.otherKey"), options: [option(current, current, current)] });
  return result;
}

/** The label of a change type: the words of the sheet ("override" is "set"), else the type itself. */
const CHANGE_TYPE_LABELS = Object.fromEntries(CHARACTER_CHANGE_TYPES.map(type => [type, `SCARMARK.Effect.changeType.${type}`]));

/** The rows of the change table: per change its stat and type roll-downs, value, priority (the default of its type as a hint) and phase. */
function changeRows(changes, stats, changeTypes, t) {
  return Array.from(changes ?? [], (change, index) => {
    const type = change.type ?? "add";
    return {
      index,
      keyGroups: keyGroups(stats, change.key ?? "", t),
      typeOptions: [...new Set([...changeTypes, type])].map(value => option(value, t(CHANGE_TYPE_LABELS[value] ?? value), type)),
      value: change.value ?? "",
      priority: change.priority ?? "",
      priorityHint: String(ITEM_MOD_DEFAULT_PRIORITY[type] ?? ""),
      phase: change.phase ?? "initial"
    };
  });
}

/** The units of a duration, with their words. */
const UNIT_LABELS = Object.fromEntries(DURATION_UNITS.map(unit => [unit, `SCARMARK.Effect.unit.${unit}`]));

/**
 * What the effect sheet shows.
 *
 * @param {object} effect the effect as plain data ({ name, img, disabled, transfer, duration, system: { changes }, flags })
 * @param {object} o
 * @param {{start: string, types: {type: string, label: string, groups: object[]}[]}} o.picker the stats per type (effects-view.mjs buildEffectTypes)
 * @param {(key: string) => string} o.localize the translator
 * @param {boolean} o.onItem whether the effect sits on an item (only then can it pass to the owner)
 * @param {{label: string, options: {value: string, label: string}[]}[]} [o.tests] the tests a poison can ask for
 * @param {{label: string, entries: {uuid: string, name: string}[]}[]} [o.library] the effects a failed test can put on the target
 */
export function buildEffectSheet(effect, { picker, localize: t, onItem, tests = [], library = [] }) {
  const flags = effectFlags(effect);
  const type = picker.types.some(entry => entry.type === flags[FLAGS.effectType]) ? flags[FLAGS.effectType] : picker.start;
  const immediate = flags[FLAGS.immediate] === true;
  const isCharacter = type === EFFECT_TARGET_CHARACTER;
  const stats = picker.types.find(entry => entry.type === type).groups
    // An immediate effect can only rewrite stored values: attributes, fatigue and skill levels of a character.
    .map(group => (immediate && isCharacter ? { ...group, options: group.options.filter(([key]) => rewriteTarget(key)) } : group));
  const changeTypes = immediate || !isCharacter ? SIMPLE_CHANGE_TYPES : CHARACTER_CHANGE_TYPES;
  const rows = changeRows(effect.system?.changes, stats, changeTypes, t);

  const onHitAllowed = ON_HIT_ITEM_TYPES.includes(type) && !immediate;
  return {
    flagPrefix: `flags.${FLAGS.scope}.`,
    name: effect.name ?? "",
    img: effect.img ?? EFFECT_DEFAULT_IMG,
    disabled: Boolean(effect.disabled),
    typeOptions: picker.types.map(entry => option(entry.type, entry.label, type)),
    kindOptions: [option("ongoing", t("SCARMARK.Effect.kindOngoing"), immediate ? "immediate" : "ongoing"), option("immediate", t("SCARMARK.Effect.kindImmediate"), immediate ? "immediate" : "ongoing")],
    kindHint: t(immediate ? "SCARMARK.Effect.hintImmediate" : "SCARMARK.Effect.hintOngoing"),
    rows,
    hasRows: rows.length > 0,
    showDuration: !immediate,
    durationValue: effect.duration?.value ?? "",
    unitOptions: DURATION_UNITS.map(unit => option(unit, t(UNIT_LABELS[unit]), effect.duration?.units ?? "seconds")),
    showTransfer: onItem && isCharacter && !immediate,
    transfer: Boolean(effect.transfer),
    showUnique: !immediate,
    unique: flags[FLAGS.unique] === true,
    showRepair: ITEM_TYPES_WITH_REPAIR.includes(type) && immediate,
    repair: flags[FLAGS.alteration] === ALTERATION_REPAIR,
    showOnHit: onHitAllowed,
    onHit: flags[FLAGS.onHit] === true,
    onHitTests: withBlank(tests.map(group => ({ label: group.label, options: group.options.map(entry => option(entry.value, entry.label, flags[FLAGS.onHitTest] ?? "")) })), flags[FLAGS.onHitTest] ?? ""),
    onHitEffects: withBlank(library.map(group => ({ label: group.label, options: group.entries.map(entry => option(entry.uuid, entry.name, flags[FLAGS.onHitEffect] ?? "")) })), flags[FLAGS.onHitEffect] ?? ""),
    charges: flags[FLAGS.charges] ?? ""
  };
}
