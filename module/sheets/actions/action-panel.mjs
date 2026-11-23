/**
 * The Actions panel: a reusable, self-contained piece of UI that edits a list of actions ("when <trigger> <do> ...") stored at any data path of a document. Like the Effects tab it lists the actions by name only, each with an on/off switch (a switched-off action does not fire) and a bin; a click on the name opens the window that edits the action (action-editor.mjs: its name and the lines below). A row drags out as a copy of its action, and an Action entry dropped on the panel adds its action (action-drag.mjs). The Add link offers a blank action and the entries of the action compendium (helpers/action-library.mjs). It is not tied to item sheets. To put it on a sheet:
 *   1. give the data model the field: `actions: actionsField()` (data/shared-fields.mjs), or any other path;
 *   2. wrap the sheet class: `class MySheet extends ActionsPanelMixin(HandlebarsApplicationMixin(DocumentSheetV2))` (adds the click actions and context.actionsPanel);
 *   3. put `{{> "systems/scarmark/templates/common/actions-panel.hbs" panel=actionsPanel}}` in a template (tab, section, dialog) and list ACTIONS_PANEL_TEMPLATES in that part's `templates`.
 * The panel finds its data path from the markup (data-actions-path), so several panels, each with its own path, can live on one sheet (give each its own context key: prepareActionsPanel(document, path, { library, tests, alterations, macros })).
 * The "do" roll-down chooses what the action does:
 *   add effect    an effect (the item's own, or any of the effect library; a library effect that an action picks is copied onto the item, helpers/actions/effects.mjs materializeActionEffects, so the Effects tab lists everything the actions use), on self or the selected tokens
 *   roll test     an attribute or skill test of the carrying character (helpers/action-tests.mjs), rolled by itself with the Foundry dice: the roll goes in the card with its outcome, and each outcome can put a library effect on the character
 *   alter         a kind of item (weapon or armor), then one alteration from the compendium of that kind (helpers/alterations.mjs); using the item asks which of the character's items of that kind gets it
 *   send message  a text posted to the chat
 *   remove effect an effect of the effect library taken off the target (self or a selected token; for a weapon's "wounds" trigger, the one that was hit)
 *   run macro     a macro of the world or of a compendium, run as the character that acts (helpers/macros.mjs; the used, consumed and inspected triggers)
 * The "when" and "on" roll-downs come from config/actions.mjs: an option can require a flag of the document (e.g. "Consumed" needs system.consumable), so the lists follow the item's checkboxes, and "on" is only shown for a trigger that asks for a target. The kinds on offer follow the trigger too (a weapon's \"hit\" only removes effects), and an entry of the action compendium (item type action) is offered every trigger. The Add link offers a blank action and the entries of the action compendium (helpers/action-library.mjs).
 */
import { FLAGS } from "../../constants.mjs";
import { ACTION_TARGETS, ACTION_TRIGGERS, ACTION_KINDS, ACTION_KIND_EFFECT, ALTERABLE_ITEM_TYPES, ACTION_ENTRY_TYPE } from "../../config/index.mjs";
import { asksTarget, kindOf, isEffectAction, isTestAction, isAlterAction, isMessageAction, isRemoveAction, isMacroAction, getPath } from "../../rules/index.mjs";
import { listEffectLibrary } from "../../helpers/effect-library.mjs";
import { listActionTests } from "../../helpers/action-tests.mjs";
import { listAlterations } from "../../helpers/alterations.mjs";
import { listMacros } from "../../helpers/macros.mjs";
import { listActionLibrary, copyLibraryActions } from "../../helpers/action-library.mjs";
import { saveActionToCompendium } from "../../helpers/save-to-compendium.mjs";
import { openActionMenu } from "./action-menu.mjs";
import { openActionEditor } from "./action-editor.mjs";
import { wireActionsDrag } from "./action-drag.mjs";

export { ACTIONS_PANEL_TEMPLATE, ACTION_FIELDS_TEMPLATE, ACTION_FIELDS_TEMPLATES, ACTIONS_PANEL_TEMPLATES } from "./action-templates.mjs";

/** Where an action list lives unless a sheet says otherwise. */
const DEFAULT_ACTIONS_PATH = "system.actions";

/** A copy of the actions stored at `path` (the stored data, not the prepared one). */
const storedActions = (document, path) => (getPath(document._source ?? document, path) ?? []).map(action => ({ ...action }));

/** A roll-down: its form field name, and its options with the selected one marked (the blank option first). */
function rollDown(name, value, options) {
  return { name, options: [{ value: "", label: "", selected: !value }, ...options.map(option => ({ ...option, selected: option.value === value }))] };
}

/** A roll-down whose options come in labelled groups (after the blank option). */
function groupedRollDown(name, value, groups) {
  return {
    name,
    grouped: true,
    blankSelected: !value,
    groups: groups.map(group => ({ label: group.label, options: group.options.map(option => ({ ...option, selected: option.value === value })) }))
  };
}

/** The options of compendium entries: the uuid is the value, the name the label. */
const entryOptions = (entries) => entries.map(entry => ({ value: entry.uuid, label: entry.name }));

/** Groups of entries ({ label, entries }) as groups of roll-down options. */
const groupOptions = (groups) => groups.map(group => ({ label: group.label, options: entryOptions(group.entries) }));

/** The option of a stored choice that the list does not have any more (its compendium entry is gone), so the row shows "<name> (missing)" and a save keeps the choice instead of blanking it. `name` is the one the item remembered, if any. */
const missingOption = (value, name) => ({ value, label: game.i18n.format("SCARMARK.Action.entryMissing", { name: name || "?" }) });

/** `groups` plus a group of its own with the missing option of the stored value, when there is a stored value and no group has it. */
const groupsWithMissing = (groups, value, name) => (value && !groups.some(group => group.options.some(option => option.value === value))
  ? [...groups, { label: game.i18n.localize("SCARMARK.Action.entryMissingGroup"), options: [missingOption(value, name)] }]
  : groups);

/** `options` plus the missing option of the stored value, when there is a stored value and the options lack it. */
const withMissing = (options, value, name) => (value && !options.some(option => option.value === value) ? [...options, missingOption(value, name)] : options);

/** The options of a table of config/actions.mjs that this document is offered: those whose flag it has and whose item types and kinds of document match; the one the action has stays. An entry of the action compendium is offered everything: it does not know yet which item it will be put on. */
function offeredOptions(document, table, current) {
  const data = document._source ?? document;
  return Object.entries(table)
    .filter(([key, option]) => document.type === ACTION_ENTRY_TYPE || ((!option.requires || getPath(data, option.requires)) && (!option.types || option.types.includes(document.type)) && (!option.documents || option.documents.includes(document.documentName))) || key === current)
    .map(([value, option]) => ({ value, label: game.i18n.localize(option.label) }));
}

/** A new action: add-effect, nothing chosen yet, and the trigger the document is offered when it is offered only one (a chest: inspected; a region behavior: the region). */
export function blankAction(document, id) {
  const triggers = offeredOptions(document, ACTION_TRIGGERS, "");
  return { id, name: "", disabled: false, kind: ACTION_KIND_EFFECT, test: "", alteration: "", message: "", effect: "", on: "", targetItem: "", when: triggers.length === 1 ? triggers[0].value : "" };
}

/** What every row of the panel chooses from, worked out once per panel: the effects, tests and alterations on offer, the kinds of item, and the roll-downs that follow the flags of the document (an option can require a flag, see config/actions.mjs). */
function choicesFor(document, { library, tests, alterations, macros }) {
  const data = document._source ?? document;
  const own = Array.from(document.effects ?? []).map(effect => ({ value: effect.id, label: effect.name }));
  // Only the library effects can be removed (an effect of the item itself is not a name another actor has).
  const libraryGroups = groupOptions(library);
  return {
    tests,
    alterations,
    libraryGroups,
    macroGroups: groupOptions(macros),
    effectGroups: [...(own.length ? [{ label: game.i18n.localize("SCARMARK.Action.thisItem"), options: own }] : []), ...libraryGroups],
    // The names the item remembers for the entries its actions name (helpers/actions/entries.mjs), to label an entry that is gone.
    entryNames: data.flags?.[FLAGS.scope]?.[FLAGS.entryNames] ?? {},
    alterable: ALTERABLE_ITEM_TYPES.map(type => ({ value: type, label: game.i18n.localize(`TYPES.Item.${type}`) })),
    kindOptions: Object.entries(ACTION_KINDS).map(([value, kind]) => ({ value, label: game.i18n.localize(kind.label) })),
    offered: (table, current) => offeredOptions(document, table, current)
  };
}

/** The row of one action: its roll-downs, named by the data path so the sheet's own form submit saves them (submitOnChange). */
function actionRow(action, prefix, { tests, alterations, libraryGroups, macroGroups, effectGroups, entryNames, alterable, kindOptions, offered }) {
  const kind = kindOf(action);
  const isRemove = isRemoveAction(action);
  // The kinds on offer follow the trigger (a weapon's "wounds" only removes effects); the one the action has stays.
  const trigger = ACTION_TRIGGERS[action.when];
  const kinds = kindOptions.filter(option => !trigger?.kinds || trigger.kinds.includes(option.value) || option.value === kind);
  // The alterations on offer are the ones of the kind of item picked.
  const alterationOptions = withMissing(entryOptions(alterations[action.targetItem] ?? []), action.alteration, entryNames[action.id]);
  // A library effect to remove, or a macro, that is no longer listed stays in its roll-down as "<name> (missing)".
  const removalGroups = isRemove ? groupsWithMissing(libraryGroups, action.effect, entryNames[action.id]) : libraryGroups;
  return {
    prefix,
    id: action.id,
    label: action.name || game.i18n.localize("SCARMARK.Action.unnamed"),
    // What sets the action off (Owned, Inspected, Used, ...): the "When" column of the panel.
    whenLabel: trigger ? game.i18n.localize(trigger.label) : "",
    name: { name: `${prefix}.name`, value: action.name ?? "" },
    disabled: action.disabled === true,
    when: rollDown(`${prefix}.when`, action.when, offered(ACTION_TRIGGERS, action.when)),
    kind: { name: `${prefix}.kind`, options: kinds.map(option => ({ ...option, selected: option.value === kind })) },
    isTest: isTestAction(action),
    isAlter: isAlterAction(action),
    isMessage: isMessageAction(action),
    isRemove,
    isMacro: isMacroAction(action),
    isEffect: isEffectAction(action),
    test: groupedRollDown(`${prefix}.test`, action.test, tests),
    targetItem: rollDown(`${prefix}.targetItem`, action.targetItem, alterable),
    alteration: rollDown(`${prefix}.alteration`, action.alteration, alterationOptions),
    effect: groupedRollDown(`${prefix}.effect`, action.effect, effectGroups),
    removal: groupedRollDown(`${prefix}.effect`, action.effect, removalGroups),
    macro: groupedRollDown(`${prefix}.macro`, action.macro, groupsWithMissing(macroGroups, action.macro, entryNames[action.id])),
    message: { name: `${prefix}.message`, value: action.message ?? "" },
    showOn: asksTarget(action.when, { kind }),
    on: rollDown(`${prefix}.on`, action.on, offered(ACTION_TARGETS, action.on))
  };
}

/**
 * The view model of the panel for the actions stored at `path` of `document`: one row per action with its roll-downs, named so the sheet's own form submit saves them (submitOnChange).
 *
 * @param {foundry.abstract.Document} document the item or actor that owns the list
 * @param {string} [path] data path of the list, e.g. "system.actions"
 * @param {object} [lists]
 * @param {{label: string, entries: {uuid: string, name: string}[]}[]} [lists.library] the effect library (listEffectLibrary)
 * @param {{label: string, options: {value: string, label: string}[]}[]} [lists.tests] the test groups (listActionTests)
 * @param {Object<string, {uuid: string, name: string}[]>} [lists.alterations] item type -> its alterations (listAlterations)
 * @param {{label: string, entries: {uuid: string, name: string}[]}[]} [lists.macros] the macros (listMacros)
 * @returns {{path: string, rows: object[]}}
 */
export function prepareActionsPanel(document, path = DEFAULT_ACTIONS_PATH, { library = [], tests = [], alterations = {}, macros = [] } = {}) {
  const choices = choicesFor(document, { library, tests, alterations, macros });
  return { path, rows: storedActions(document, path).map((action, index) => actionRow(action, `${path}.${index}`, choices)) };
}

/** The data path of the panel a clicked element sits in. */
const pathOf = (target) => target.closest("[data-actions-path]")?.dataset.actionsPath;

/** Add an action to the list of this panel: a blank one, or the actions of an entry of the action compendium. With nothing in the compendium the blank one is added at once; otherwise a menu offers both. */
async function onCreateAction(event, target) {
  const path = pathOf(target);
  if (!path) return;
  const add = async (uuid) => {
    const actions = storedActions(this.document, path);
    if (uuid) {
      const copies = await copyLibraryActions(uuid);
      if (!copies) return ui.notifications.warn(game.i18n.localize("SCARMARK.Action.libraryMissing"));
      actions.push(...copies);
    } else {
      actions.push(blankAction(this.document, foundry.utils.randomID()));
    }
    await this.document.update({ [path]: actions });
  };
  const entries = await listActionLibrary();
  if (!entries.length) return add(null);
  openActionMenu(this, target, add, entries);
}

/** The panel and the row a click was in: the data path of the list and the index of the action; null when the click was not in a row of a panel. */
function rowOf(target) {
  const path = pathOf(target);
  const index = Number(target.closest("[data-index]")?.dataset.index);
  return path && Number.isInteger(index) ? { path, index } : null;
}

/** Switch the action of this row on or off: a switched-off action stays in the list and does not fire. */
function onToggleAction(event, target) {
  const row = rowOf(target);
  const actions = row && storedActions(this.document, row.path);
  if (!actions?.[row.index]) return;
  actions[row.index].disabled = !actions[row.index].disabled;
  this.document.update({ [row.path]: actions });
}

/** Save the action of this row to a compendium (the dialog asks which). */
function onSaveAction(event, target) {
  const row = rowOf(target);
  const action = row && storedActions(this.document, row.path)[row.index];
  if (action) saveActionToCompendium(this.document, action);
}

/** Delete the action of this row. */
function onDeleteAction(event, target) {
  const row = rowOf(target);
  if (row) this.document.update({ [row.path]: storedActions(this.document, row.path).filter((action, i) => i !== row.index) });
}

/** The lists every panel row chooses from (the effect library, tests, alterations and macros). */
async function actionLists() {
  return { library: await listEffectLibrary(), tests: await listActionTests(), alterations: await listAlterations(), macros: await listMacros() };
}

/** Open the window that edits the action of this row (its name and lines). The window finds the action by its id, so it keeps working when other actions are added or deleted. */
function onEditAction(event, target) {
  const row = rowOf(target);
  const document = this.document;
  const actionId = row && storedActions(document, row.path)[row.index]?.id;
  if (!actionId) return;
  const { path } = row;
  const indexOf = () => storedActions(document, path).findIndex(action => action.id === actionId);
  openActionEditor({
    document,
    actionId,
    prepare: async () => {
      const index = indexOf();
      return index < 0 ? null : prepareActionsPanel(document, path, await actionLists()).rows[index];
    },
    save: async (fields) => {
      const index = indexOf();
      if (index < 0) return;
      const actions = storedActions(document, path);
      const prefix = `${path}.${index}.`;
      for (const [key, value] of Object.entries(fields)) if (key.startsWith(prefix)) actions[index][key.slice(prefix.length)] = value;
      await document.update({ [path]: actions });
    }
  });
}

/** Give a document sheet class the Actions panel: its click actions, the drag and drop of the rows and context.actionsPanel (the panel at DEFAULT_ACTIONS_PATH). Handlers are called by ApplicationV2 with the sheet as `this`; DEFAULT_OPTIONS merge down the class chain. */
export const ActionsPanelMixin = (Base) => class extends Base {
  static DEFAULT_OPTIONS = {
    actions: { createAction: onCreateAction, editAction: onEditAction, deleteAction: onDeleteAction, toggleAction: onToggleAction, saveAction: onSaveAction }
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.actionsPanel = prepareActionsPanel(this.document, DEFAULT_ACTIONS_PATH, await actionLists());
    return context;
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
    wireActionsDrag(this, storedActions);
  }
};
