/** The roll-downs of the Actions panel (sheets/actions/action-panel.mjs) and the keys the action runner (helpers/actions/run.mjs) acts on. Pure data.
 * Each option is { label, requires }: the lang key, and the data path of a flag of the document that must be ticked for the option to be offered (null = always). An option a saved action already uses stays in its roll-down even when the flag is later unticked, so nothing is silently lost. */

/** "do": what an action does (ACTION_KINDS below): add an effect, roll a test, alter an item of the character, send a chat message, remove an effect or run a macro. An action without a kind is an "add effect" action (the first actions had no kind). */
export const ACTION_KIND_EFFECT = "effect";
export const ACTION_KIND_TEST = "test";
export const ACTION_KIND_ALTER = "alter";
export const ACTION_KIND_MESSAGE = "message";
/** "remove effect": takes an effect of the effect library off the target (matching effects of that name, or put there from that library entry). */
export const ACTION_KIND_REMOVE = "remove";
/** "run macro": runs a macro of the world or of a compendium as the character that acts (the used, consumed and inspected triggers). */
export const ACTION_KIND_MACRO = "macro";
/**
 * The kinds of action, the one place that knows them all. Per kind:
 *   label  the lang key of its entry in the "do" roll-down
 *   field  the stored field of the action that says what it does (see actionsField in data/shared-fields.mjs); an action of this kind with that field empty is unfinished
 * The runner (helpers/actions/run.mjs ACTION_RUNNERS) has one function per kind here, in the order a run does them. A new kind is an entry here, a runner there, and its part of templates/common/actions-panel.hbs.
 */
export const ACTION_KINDS = {
  [ACTION_KIND_EFFECT]: { label: "SCARMARK.Action.kindEffect", field: "effect" },
  [ACTION_KIND_TEST]: { label: "SCARMARK.Action.kindTest", field: "test" },
  [ACTION_KIND_ALTER]: { label: "SCARMARK.Action.kindAlter", field: "alteration" },
  [ACTION_KIND_MESSAGE]: { label: "SCARMARK.Action.kindMessage", field: "message" },
  [ACTION_KIND_REMOVE]: { label: "SCARMARK.Action.kindRemove", field: "effect" },
  [ACTION_KIND_MACRO]: { label: "SCARMARK.Action.kindMacro", field: "macro" }
};

/**
 * "alter": an action that changes an item of the carrying character. It names a kind of item (ALTERABLE_ITEM_TYPES), stored in the action's `targetItem`, and an alteration of that kind from its compendium (ALTERATION_PACKS). When the item is used, a dialog asks which of the character's items of that kind gets it. An alteration is an Active Effect in that compendium: the entry flagged ALTERATION_REPAIR repairs the item (wear back to full, the temporary modifiers of earlier alterations removed, permanent ones stay); an immediate entry rewrites the stored values of the item once; any other is put on the item as a modifier (permanent, or timed if it has a duration), once per entry: an item that already has an effect from the same entry is refused.
 */
export const ALTERABLE_ITEM_TYPES = ["armor", "weapon"];
export const ALTERATION_REPAIR = "repair";
/** The kinds of thing an effect is about (the first choice of the effect sheet): the character, or one kind of item. */
export const EFFECT_TARGET_CHARACTER = "character";
export const EFFECT_TARGET_TYPES = [EFFECT_TARGET_CHARACTER, "weapon", "armor"];

/** The stats an effect on a weapon or armor can modify. The effect change key is ITEM_MOD_KEY_PREFIX + the stat (e.g. "system.itemMods.impact.edged"), with type add or set (Foundry's override); the item applies them (rules/item-mods.mjs) into system.effective, which combat reads. The stored fields are never changed. Durability (quality) of armor means the condition of every location. */
export const ITEM_MOD_KEY_PREFIX = "system.itemMods.";
export const ITEM_MOD_STATS = {
  weapon: ["quality", "attack", "defense", "specialization", "impact.blunt", "impact.edged", "impact.piercing", "impact.fire"],
  armor: ["quality", "protection.blunt", "protection.edged", "protection.piercing", "protection.fire"]
};

/** The change types an item effect offers (add, set) and the priority each gets when the change states none: Foundry's own defaults, so a set wins over an add. */
export const ITEM_MOD_DEFAULT_PRIORITY = { add: 20, override: 50 };

/** "on": who an add-effect or remove-effect action acts on: the actor that carries the item, or the selected tokens. A weapon's "wounds" trigger always acts on the one that was hit (ACTION_TARGET_HIT, never offered in the roll-down). */
export const ACTION_TARGET_SELF = "self";
export const ACTION_TARGET_HIT = "hit";
export const ACTION_TARGET_SELECTED_TOKEN = "selectedToken";
export const ACTION_TARGETS = {
  [ACTION_TARGET_SELF]: { label: "SCARMARK.Action.targetSelf", requires: null },
  [ACTION_TARGET_SELECTED_TOKEN]: { label: "SCARMARK.Action.targetSelectedToken", requires: null }
};

/**
 * "when": what sets an action off. Per trigger:
 *   target        whether an add-effect action asks "on what" (true) or always acts on the actor that carries the item (false)
 *   removeTarget  the same for a remove-effect action: "ask" (self or selected token), "hit" (the one the weapon wounded), or "self" (always the actor that acts)
 *   kinds         the kinds of action the trigger runs (all of them when missing)
 *   types         the item types the trigger is offered on (all when missing)
 *   documents     the kinds of document that can have the trigger: "Item", "Actor" or "RegionBehavior" (items and actors when missing)
 *   verb          the lang key of what the chat says the character did ("{actor} used {item}"); none for owned (nothing happens at a moment). Every card is that verb plus a result (ACTION_RESULTS), see view/action-card.mjs
 *   announces     whether the chat always says it ("<actor> used <item>.") when no action did: used and consumed
 *   plain         the cards have no verb, only what happened (a region behavior says nothing by itself: its messages and results are the card)
 *   owned      the effect applies by itself while the actor owns the item (the effect is made to transfer, see helpers/actions/effects.mjs syncOwnedEffects)
 *   inspected  a player opens the sheet of the item or actor that has the action (not the GM). Everything it does is to the character that inspects: the one that carries the item, or the one of the player who opened an actor such as a chest (add or remove an effect, roll a test, send a message; no choice of "on")
 *   used       the Use icon of a usable item
 *   consumed   the Consume icon of a consumable item
 *   hit        a weapon wounds past the armor (helpers/combat/strike.mjs resolveWound), the same moment a poison on the blade gets in
 *   region     a token crosses or stops in a Region that has the behavior of the system (config/regions.mjs); the actions act as the actor of that token
 */
/** The item type of an entry of the action compendium: a named set of actions that the + Add menu of the Actions panel copies into an item (helpers/action-library.mjs). */
export const ACTION_ENTRY_TYPE = "action";

export const ACTION_TRIGGER_OWNED = "owned";
export const ACTION_TRIGGER_INSPECTED = "inspected";
export const ACTION_TRIGGER_USED = "used";
export const ACTION_TRIGGER_CONSUMED = "consumed";
export const ACTION_TRIGGER_HIT = "hit";
export const ACTION_TRIGGER_REGION = "region";
export const ACTION_TRIGGERS = {
  [ACTION_TRIGGER_OWNED]: { label: "SCARMARK.Action.triggerOwned", requires: null, documents: ["Item"], target: false, kinds: [ACTION_KIND_EFFECT, ACTION_KIND_TEST, ACTION_KIND_ALTER, ACTION_KIND_MESSAGE], verb: null },
  [ACTION_TRIGGER_INSPECTED]: { label: "SCARMARK.Action.triggerInspected", requires: null, documents: ["Item", "Actor"], target: false, removeTarget: "self", kinds: [ACTION_KIND_EFFECT, ACTION_KIND_REMOVE, ACTION_KIND_TEST, ACTION_KIND_MESSAGE, ACTION_KIND_MACRO], verb: "SCARMARK.Action.verbInspected", announces: false },
  [ACTION_TRIGGER_USED]: { label: "SCARMARK.Action.triggerUsed", requires: "system.usable", target: true, removeTarget: "ask", verb: "SCARMARK.Action.verbUsed", announces: true },
  [ACTION_TRIGGER_CONSUMED]: { label: "SCARMARK.Action.triggerConsumed", requires: "system.consumable", target: false, removeTarget: "ask", verb: "SCARMARK.Action.verbConsumed", announces: true },
  [ACTION_TRIGGER_HIT]: { label: "SCARMARK.Action.triggerHit", requires: null, types: ["weapon"], target: false, removeTarget: "hit", kinds: [ACTION_KIND_REMOVE], verb: "SCARMARK.Action.verbHit", announces: false },
  [ACTION_TRIGGER_REGION]: { label: "SCARMARK.Action.triggerRegion", requires: null, documents: ["RegionBehavior"], target: false, removeTarget: "ask", kinds: [ACTION_KIND_EFFECT, ACTION_KIND_REMOVE, ACTION_KIND_TEST, ACTION_KIND_ALTER, ACTION_KIND_MESSAGE], verb: null, plain: true, announces: false }
};

/** What a card says happened, after the verb (lang keys; the values are the target, the effect or the message). */
export const ACTION_RESULTS = {
  added: "SCARMARK.Action.resultAdded",
  addedMany: "SCARMARK.Action.resultAddedMany",
  immediate: "SCARMARK.Action.resultImmediate",
  removed: "SCARMARK.Action.resultRemoved",
  altered: "SCARMARK.Action.resultAltered",
  repaired: "SCARMARK.Action.resultRepaired",
  message: "SCARMARK.Action.resultMessage"
};

/** The icon of an effect that has none of its own (a new effect, the effect sheet, the Add menu). */
export const EFFECT_DEFAULT_IMG = "icons/svg/aura.svg";

/** The test an on-hit effect (a poison on a blade) asks of the target when it does not name one (same format as the tests of the Actions panel). */
export const ON_HIT_DEFAULT_TEST = "skill:Vitality";
/** The kinds of item whose effects can fire when the item wounds (weapons; missiles later). The "hit" trigger is offered on the same types. */
export const ON_HIT_ITEM_TYPES = ["weapon"];

/** The change types of a character effect (Foundry's own), in the order the effect sheet lists them. "override" is shown as "set". */
export const CHARACTER_CHANGE_TYPES = ["add", "multiply", "upgrade", "downgrade", "override"];
/** The change types of an immediate effect and of a weapon or armor effect: only add and set are understood (the keys of ITEM_MOD_DEFAULT_PRIORITY). */
export const SIMPLE_CHANGE_TYPES = Object.keys(ITEM_MOD_DEFAULT_PRIORITY);
/** The units of an effect's duration the sheet offers: the world-time ones (config/time.mjs UNIT_SECONDS) and the combat ones. */
export const DURATION_UNITS = ["seconds", "minutes", "hours", "days", "weeks", "rounds", "turns"];
