/** The base of every actor sheet: ApplicationV2 wiring, template context, drag and drop. */
import { SCARMARK } from "../config.mjs";
import { consumeItem } from "../helpers/consume.mjs";
import { useItem } from "../helpers/item-actions.mjs";
import { categorizeEffects } from "../view/effects-view.mjs";
import { attributeRows, conditionBarPct, skillGroups, SKILL_TABS, inventoryLists, armorDurability, containerBlocks } from "../view/actor-view.mjs";
import { containerRows, chestGroups } from "../view/inventory-view.mjs";
import ScrollKeeper from "./scroll-keeper.mjs";
import { wireRowClicks } from "./row-clicks.mjs";
import { enhanceAccessibility, wireButtonKeys } from "./a11y.mjs";
import { wireInventoryDrop, inventoryDestination, endDrag } from "./inventory-drop.mjs";
import { containerTransfer, runLocked, reorderItems, deleteMovedOriginal } from "../helpers/inventory.mjs";
import { FORM_LIMITS, ASPECT_LETTERS } from "../config/index.mjs";
import { prepareCombat, prepareEsoterics } from "./actor-context.mjs";
import { wireActorListeners, isDropBelow } from "./actor-listeners.mjs";
import { PROFILE_ACTIONS } from "./actions/profile.mjs";
import { GEAR_ACTIONS } from "./actions/gear.mjs";
import { COMBAT_ACTIONS } from "./actions/combat.mjs";
import { ESOTERICS_ACTIONS } from "./actions/esoterics.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

/** The Race line under the name, shared by the Character and NPC sheets. */
export const RACE_SUBTITLE = { path: "race", label: "SCARMARK.Race" };

/**
 * ApplicationV2 wiring of every actor sheet (Character, NPC, Creature, Animal, Container): the window frame, the template context (_prepareContext, built from view/actor-view.mjs and sheets/actor-context.mjs), the listeners (sheets/actor-listeners.mjs), drag and drop, and the data-action handlers (sheets/actions/). Subclasses choose their tabs and parts and the getters below.
 */
export default class ScarmarkActorSheetBase extends HandlebarsApplicationMixin(ActorSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ["scarmark", "sheet", "actor"],
    position: { width: 820, height: 780 },
    window: { resizable: true },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    },
    actions: {
      ...PROFILE_ACTIONS,
      ...GEAR_ACTIONS,
      ...COMBAT_ACTIONS,
      ...ESOTERICS_ACTIONS
    }
  };

  /** @override */
  get title() {
    return this.document.name;
  }

  /**
   * @override Promote the (Prototype) Token control from the ⋮ menu to its own
   * button in the window header. The button reuses core's own control entry
   * (action / icon / label), so it opens Prototype Token on a world actor and
   * Configure Token on a token's actor, exactly like the menu item.
   */
  async _renderFrame(options) {
    const frame = await super._renderFrame(options);
    const control = this._getHeaderControls?.()
      .find(c => c.action === "configurePrototypeToken" || c.action === "configureToken");
    if (control && this.document.isOwner) {
      const label = game.i18n.localize(control.label);
      const button = document.createElement("button");
      button.type = "button";
      button.className = `header-control icon ${control.icon}`;
      button.dataset.action = control.action;
      button.dataset.tooltip = label;
      button.setAttribute("aria-label", label);
      const anchor = this.window?.controls ?? this.window?.close;
      if (anchor) anchor.before(button);
      else this.window?.header?.append(button);
    }
    return frame;
  }

  /**
   * Which attribute keys this actor type displays. Character and NPC show all
   * 9; Creature and Animal use SCARMARK.creatureAttributeKeys (no Presence).
   * @returns {string[]}
   */
  get attributeKeys() {
    return SCARMARK.characterAttributeKeys;
  }

  /**
   * The header subtitle field under the name (Race for Character, Species for
   * Creature). Return null to omit it entirely.
   * @returns {{path: string, label: string}|null}
   */
  get subtitleField() {
    return null;
  }

  /**
   * Whether the Profile tab shows the birth block (Sunsign / date of birth /
   * Birthplace). Character shows it; NPC hides it.
   * @returns {boolean}
   */
  get showBirthInfo() {
    return true;
  }

  /**
   * Whether the Profile tab shows the Special Abilities block. Creature and
   * Animal show it; Character and NPC do not.
   * @returns {boolean}
   */
  get showSpecialAbilities() {
    return false;
  }

  /**
   * Categories shown on the Skills tab, in display order: Skill, Combat, Esoterics.
   * @returns {{key: string, label: string, piety?: boolean}[]}
   */
  get skillCategories() {
    return SKILL_TABS;
  }

  /**
   * Whether a skill row is listed on the Skills tab (Creature and Animal hide the Religion skills).
   * @param {Item} skill
   * @returns {boolean}
   */
  // eslint-disable-next-line no-unused-vars -- the parameter documents the override signature
  showSkill(skill) {
    return true;
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = this.document;
    const system = actor.system;

    context.system = system;
    // Editable inputs must show the STORED (_source) value, never the prepared
    // one: Active Effects add onto fields like attribute base / Fatigue / Move,
    // and the form submits every input on any change (submitOnChange). Showing
    // the effect-boosted value would write it back as the new base and stack
    // the effect again on every edit of any field. Derived totals stay on display.
    const src = actor._source.system ?? {};
    context.tabs = this._prepareTabs("primary");
    context.showBirthInfo = this.showBirthInfo;
    context.showSpecialAbilities = this.showSpecialAbilities;
    context.attributeRows = attributeRows(this.attributeKeys, system, src);
    context.conditionBarPct = conditionBarPct(system.condition?.pct);

    // Own effects + effects transferred from owned items (weapon/armor/gear with
    // "Apply to Actor" on) so the tab shows every effect actually on the actor.
    context.effectCategories = categorizeEffects([...actor.allApplicableEffects()]);

    const sf = this.subtitleField;
    if (sf) {
      context.subtitleField = { name: `system.${sf.path}`, label: sf.label, value: system[sf.path] };
    }

    // Every list on the sheet follows the item's `sort` value, so the order set by
    // drag-and-drop (see _onSortItem) sticks. Ties keep creation order.
    const items = actor.items.contents.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
    context.physicalTraits = items.filter(i => i.type === "trait" && i.system.category === "physical");
    context.psycheTraits = items.filter(i => i.type === "trait" && i.system.category === "psyche");
    context.skillCategories = skillGroups(this.skillCategories, items, skill => this.showSkill(skill));

    Object.assign(context, inventoryLists(items));
    context.armorDur = armorDurability(context.armorItems, game.i18n.localize("SCARMARK.Gear.durHint"));
    context.isOwner = actor.isOwner;
    context.limits = FORM_LIMITS;
    context.aspectLetters = Object.values(ASPECT_LETTERS);
    context.isChest = actor.type === "container";
    context.containerRows = context.isChest ? [] : containerRows(items);
    context.chest = context.isChest ? chestGroups(items) : { groups: [] };
    context.containers = containerBlocks(items);
    context.gearSummary = system.gearSummary;

    prepareCombat(context, actor, items);
    prepareEsoterics(context, actor, items);

    return context;
  }

  /** @override */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    if (context.tabs?.[partId]) context.tab = context.tabs[partId];
    return context;
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
    wireActorListeners(this);
    enhanceAccessibility(this.element);
    this._scroll?.afterRender();
  }

  /** @override Stop the row-click timers and drop a drag in progress: they must not act for a window that is gone. */
  _onClose(options) {
    this._cancelRowClicks?.();
    endDrag();
    super._onClose(options);
  }

  /** @override Wire the listeners that live on the sheet's root element (it survives re-renders) once. */
  _onFirstRender(context, options) {
    super._onFirstRender(context, options);
    // The root survives re-renders, so these two go on it once (in _onRender they piled up, one more pair per render).
    const clearDropMarks = () => {
      for (const el of this.element.querySelectorAll(".sort-drop-before, .sort-drop-after")) {
        el.classList.remove("sort-drop-before", "sort-drop-after");
      }
    };
    this.element.addEventListener("drop", clearDropMarks);
    this.element.addEventListener("dragend", clearDropMarks);
    wireButtonKeys(this.element);
    this._scroll = new ScrollKeeper(this);
    this._scroll.listen();
    this._cancelRowClicks = wireRowClicks(this);
    wireInventoryDrop(this);
  }

  /** @override Remember the scroll positions while the old HTML is still there. */
  async _preRender(context, options) {
    await super._preRender(context, options);
    this._scroll?.capture();
  }

  /** @override Switching tabs hides and shows the panels: keep and restore their scroll positions. */
  changeTab(tab, group, options) {
    this._scroll?.capture();
    super.changeTab(tab, group, options);
    this._scroll?.afterRender();
  }

  /**
   * @override Re-order an item within the list it was dropped on. The sibling
   * set is the rows of that one list (a skill category, the Weapons table, the
   * spells table, ...), in their displayed order; the dragged item is placed
   * before/after the target row and the list is renumbered. Dropping onto a row
   * of a list the item isn't shown in (e.g. a sword onto a skill) does nothing.
   */
  async _onSortItem(event, itemData) {
    const source = this.document.items.get(itemData?.id ?? itemData?._id);
    const dropTarget = event.target.closest("[data-item-id]");
    if (!source || !dropTarget) return [];
    const rowIds = [...dropTarget.parentElement.children].map(el => el.dataset.itemId).filter(Boolean);
    return reorderItems(this.document, source.id, dropTarget.dataset.itemId, rowIds, isDropBelow(event, dropTarget));
  }

  /**
   * @override Dragging an item from one Actor onto another (or onto a Container
   * actor) should MOVE it, not copy: after the default create on this actor,
   * delete the source item. Items dropped from the world/a compendium still copy.
   */
  async _onDropItem(event, item) {
    // Into a container, a container with its contents, out of a container, to or from a chest: see inventory-drop.mjs.
    const dest = inventoryDestination(this, event, item);
    if (dest) {
      await runLocked([dest.source, dest.target], () => containerTransfer(dest.source, dest.target, item.id, dest.place));
      return null;
    }
    const created = await super._onDropItem(event, item);
    await deleteMovedOriginal(this.document, item, created);
    return created;
  }

  /* -------------------------------------------- */
  /*  Shared Actions                               */
  /* -------------------------------------------- */

  /** Find an ActiveEffect by id among the actor's own effects or those on its items. */
  _findEffect(id) {
    const own = this.document.effects.get(id);
    if (own) return own;
    for (const item of this.document.items) {
      const e = item.effects.get(id);
      if (e) return e;
    }
    return null;
  }

  /** Consume a consumable (see helpers/consume.mjs). Bound via an explicit listener in actor-listeners.mjs (not data-action). */
  _consumeItem(itemId) {
    const item = this.document.items.get(itemId);
    if (item) return consumeItem(this.document, item);
  }

  /** Use a usable item: set off its "when used" actions (see helpers/item-actions.mjs). Bound via an explicit listener in actor-listeners.mjs. */
  _useItem(itemId) {
    const item = this.document.items.get(itemId);
    if (item) return useItem(item);
  }

}
