/** Actions of an item: which of them a trigger sets off. Pure. */
import { ACTION_TRIGGER_OWNED, ACTION_TRIGGERS, ACTION_KINDS, ACTION_KIND_EFFECT, ACTION_KIND_TEST, ACTION_KIND_ALTER, ACTION_KIND_MESSAGE, ACTION_KIND_REMOVE, ACTION_KIND_MACRO, ACTION_TARGET_SELF, ACTION_TARGET_HIT } from "../config/index.mjs";

/** Whether an action rolls a test (the others, including older ones with no kind, add an effect). */
export const isTestAction = (action) => action.kind === ACTION_KIND_TEST;

/** Whether an action changes an item once (repair armor, ...). */
export const isAlterAction = (action) => action.kind === ACTION_KIND_ALTER;

/** Whether an action sends a chat message. */
export const isMessageAction = (action) => action.kind === ACTION_KIND_MESSAGE;

/** Whether an action takes an effect off a target. */
export const isRemoveAction = (action) => action.kind === ACTION_KIND_REMOVE;

/** Whether an action runs a macro. */
export const isMacroAction = (action) => action.kind === ACTION_KIND_MACRO;

/** The kind of an action as the config names it (an action without a kind adds an effect). */
export const kindOf = (action) => action.kind || ACTION_KIND_EFFECT;

/** Whether an action adds an effect to a character (the kind of the actions before there were kinds, so also one with no kind or an unknown one). */
export const isEffectAction = (action) => !Object.hasOwn(ACTION_KINDS, action.kind) || action.kind === ACTION_KIND_EFFECT;

/** What an action names to do: the stored field its kind says (config/actions.mjs ACTION_KINDS), trimmed; an action of no kind or an unknown one reads as an add-effect action. */
const whatOf = (action) => String(action[(ACTION_KINDS[kindOf(action)] ?? ACTION_KINDS[ACTION_KIND_EFFECT]).field] ?? "").trim();

/** The actions that are switched on, whose "when" is `trigger`, of a kind the trigger runs (finished or not). */
function switchedOn(actions, trigger) {
  const kinds = ACTION_TRIGGERS[trigger]?.kinds;
  return (actions ?? []).filter(action => !action.disabled && action.when === trigger && (!kinds || kinds.includes(kindOf(action))));
}

/**
 * The switched-on actions of a trigger that name nothing to do yet (the field their kind needs is empty), which `actionsFor` leaves out. The runner warns about them, so a half-set action is not silent.
 *
 * @param {Array<{kind?: string, when?: string}>|undefined} actions the item's actions
 * @param {string} trigger a key of ACTION_TRIGGERS
 */
export const unfinishedActions = (actions, trigger) => switchedOn(actions, trigger).filter(action => !whatOf(action));

/**
 * The actions that fire on `trigger`: the ones that are switched on, whose "when" is that trigger, of a kind the trigger runs, and that name what they do (the field their kind needs is filled in).
 *
 * @param {Array<{kind?: string, effect?: string, test?: string, alteration?: string, macro?: string, message?: string, when?: string, disabled?: boolean}>|undefined} actions the item's actions
 * @param {string} trigger a key of ACTION_TRIGGERS
 */
export const actionsFor = (actions, trigger) => switchedOn(actions, trigger).filter(whatOf);

/**
 * The actions of a compendium entry as new actions of another document: each gets a fresh id (`newId` gives one) and keeps its name, or takes the name of the entry when it has none. Anything that is not an action is dropped.
 *
 * @param {object[]|undefined} actions the stored actions of the entry
 * @param {string} entryName the name of the entry
 * @param {() => string} newId makes an id
 * @returns {object[]}
 */
export const actionsFromEntry = (actions, entryName, newId) => (actions ?? [])
  .filter(action => action && typeof action === "object")
  .map(action => ({ ...action, id: newId(), name: action.name || entryName }));

/**
 * What to change on the effects of an item so that the ones named by an "owned" action transfer to the owner, and the ones that did only because of such an action stop when the action is gone. An effect that transfers on its own (not marked as managed) is never touched.
 *
 * @param {{id: string, transfer: boolean, managed: boolean}[]} effects the item's effects; `managed` = made to transfer by an owned action
 * @param {Array<{effect?: string, when?: string}>|undefined} actions the item's actions
 * @returns {{id: string, transfer: boolean, managed: boolean}[]} the effects to update
 */
export function ownedEffectChanges(effects, actions) {
  const wanted = new Set(actionsFor(actions, ACTION_TRIGGER_OWNED).filter(isEffectAction).map(action => action.effect));
  const changes = [];
  for (const effect of effects) {
    if (wanted.has(effect.id) && !effect.transfer) changes.push({ id: effect.id, transfer: true, managed: true });
    else if (!wanted.has(effect.id) && effect.managed) changes.push({ id: effect.id, transfer: false, managed: false });
  }
  return changes;
}

/**
 * Read the value of an action's test roll-down: "skill:<name>" (a d100 against that skill's ESL), "attribute:<key>" (against the attribute times the test multiplier), or an older bare skill name. Null for no test.
 *
 * @param {string|undefined} value
 * @returns {{type: "skill"|"attribute", name: string}|null}
 */
export function parseActionTest(value) {
  const text = String(value ?? "");
  if (!text) return null;
  const colon = text.indexOf(":");
  const type = text.slice(0, colon);
  if (colon > 0 && (type === "skill" || type === "attribute")) return { type, name: text.slice(colon + 1) };
  return { type: "skill", name: text };
}

/**
 * Whether the action asks "on what" (self or selected token): an add-effect action when its trigger says so (target), a remove-effect action when its trigger says "ask" (removeTarget).
 *
 * @param {string} trigger a key of ACTION_TRIGGERS
 * @param {{kind?: string}} action
 */
export function asksTarget(trigger, action) {
  const def = ACTION_TRIGGERS[trigger];
  if (isRemoveAction(action)) return def?.removeTarget === "ask";
  return isEffectAction(action) && def?.target === true;
}

/**
 * Who the action acts on: the one hit for a trigger that says "hit", the action's own choice when it asks, else the actor that carries the item.
 *
 * @param {string} trigger a key of ACTION_TRIGGERS
 * @param {{kind?: string, on?: string}} action
 * @returns {string} ACTION_TARGET_SELF, ACTION_TARGET_HIT or the action's `on` (selectedToken, or empty when it was never chosen)
 */
export function targetOf(trigger, action) {
  if (isRemoveAction(action) && ACTION_TRIGGERS[trigger]?.removeTarget === "hit") return ACTION_TARGET_HIT;
  return asksTarget(trigger, action) ? action.on : ACTION_TARGET_SELF;
}

/**
 * The effects a remove-effect action takes off: the ones put there from the library entry (same origin) and the ones with its name, ignoring case.
 *
 * @param {{id: string, name?: string, origin?: string}[]} effects the effects of the target
 * @param {{uuid: string, name: string}} entry the library entry the action names
 * @returns {string[]} the ids of the effects to remove
 */
export function effectsMatching(effects, { uuid, name }) {
  const wanted = String(name ?? "").trim().toLowerCase();
  return (effects ?? []).filter(effect => (uuid && effect.origin === uuid) || (wanted && String(effect.name ?? "").trim().toLowerCase() === wanted)).map(effect => effect.id);
}

/**
 * Whether using an item spends one unit of it: the item is "used up", and either it has no "when used" actions (using it is all there is to it) or at least one of them did something. An action that was refused, or a dialog that was closed, leaves the item unspent.
 *
 * @param {{usedUp?: boolean}} system the item's system data
 * @param {number} planned how many "when used" actions the item has
 * @param {number} done how many things they did (what runActions returns)
 */
export const spendsOnUse = (system, planned, done) => system?.usedUp === true && (planned === 0 || done > 0);
