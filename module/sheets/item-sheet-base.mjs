/** The base of every item sheet: the Details tab (subclass-provided), the common Effects tab and the portrait picker. */
import { FORM_LIMITS } from "../config/index.mjs";
import { enhanceAccessibility, wireButtonKeys } from "./a11y.mjs";
import { onEditImage, effectIdOf, blankEffectData, toggleEffect, openEffect } from "./actions/effects.mjs";
import { inspect } from "../helpers/item-actions.mjs";
import { saveEffectToCompendium } from "../helpers/save-to-compendium.mjs";
import { ActionsPanelMixin } from "./actions/action-panel.mjs";
import { effectChangesLabel } from "../view/effects-view.mjs";
import ScrollKeeper from "./scroll-keeper.mjs";
import { itemTabs, headerPart, tabsPart, effectsPart, actionsPart } from "./item-layout.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

/** Add a blank Active Effect to the item. On a sheet with an Actions tab it is a catalog entry: it does not transfer to the owner (an "owned" action does that). A sheet without one (the trait) gets the plain effect. */
function onCreateEffect() {
  const catalog = this.constructor.TABS?.primary?.tabs?.some(tab => tab.id === "actions");
  this.document.createEmbeddedDocuments("ActiveEffect", [catalog ? { ...blankEffectData(), transfer: false } : blankEffectData()]);
}

/** Open the effect of this row. */
function onEditEffect(event, target) {
  openEffect(this.document.effects.get(effectIdOf(target)));
}

/** Delete the effect of this row. */
function onDeleteEffect(event, target) {
  const effectId = effectIdOf(target);
  if (effectId) this.document.deleteEmbeddedDocuments("ActiveEffect", [effectId]);
}

/** Save the effect of this row to a compendium (the dialog asks which). */
function onSaveEffect(event, target) {
  saveEffectToCompendium(this.document.effects.get(effectIdOf(target)));
}

/** Switch the effect of this row on or off. */
function onToggleEffect(event, target) {
  toggleEffect(this.document.effects.get(effectIdOf(target)));
}

/**
 * Shared behavior for every Item type: the Details tab (subclass-provided)
 * plus a common Effects tab (create/edit/delete/toggle). This is the one
 * thing every Item type has in common, regardless of what else it holds.
 */
export default class ScarmarkItemSheetBase extends ActionsPanelMixin(HandlebarsApplicationMixin(ItemSheetV2)) {

  static DEFAULT_OPTIONS = {
    classes: ["scarmark", "sheet", "item"],
    position: { width: 480, height: 460 },
    window: { resizable: true },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    },
    actions: {
      editImage: onEditImage,
      createEffect: onCreateEffect,
      editEffect: onEditEffect,
      deleteEffect: onDeleteEffect,
      saveEffect: onSaveEffect,
      toggleEffect: onToggleEffect
    }
  };

  static TABS = itemTabs("details");

  static PARTS = {
    header: headerPart(),
    tabs: tabsPart(),
    effects: effectsPart(),
    actions: actionsPart()
  };

  /** @override Wire the key handling on the root once. */
  _onFirstRender(context, options) {
    super._onFirstRender(context, options);
    wireButtonKeys(this.element);
    inspect(this.document);
    // A change re-renders the sheet and would throw the scrolled tab back to the top: remember the position and put it back.
    this._scroll = new ScrollKeeper(this);
    this._scroll.listen();
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

  /** @override Label links and button roles for the rendered HTML (sheets/a11y.mjs). */
  _onRender(context, options) {
    super._onRender(context, options);
    enhanceAccessibility(this.element);
    this._scroll?.afterRender();
  }

  /** @override */
  get title() {
    return this.document.name;
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.system = this.document.system;
    context.limits = FORM_LIMITS;
    if (this.constructor.TABS?.primary) {
      context.tabs = this._prepareTabs("primary");
    }
    context.effects = Array.from(this.document.effects);
    // The Changes column of the Effects tab: effect id -> readable names of the stats it changes.
    context.effectChanges = Object.fromEntries(context.effects.map(effect => [effect.id, effectChangesLabel(effect, key => game.i18n.localize(key))]));
    return context;
  }

  /**
   * The containers on the owning actor, for the "In Container" selector of the storable item types (empty when the item isn't embedded on an actor). Those sheets put it in their context as containerOptions.
   * @returns {{id: string, name: string}[]}
   */
  containerOptions() {
    const actor = this.document.parent;
    return (actor?.items ?? [])
      .filter(i => i.type === "container" && i.id !== this.document.id)
      .map(i => ({ id: i.id, name: i.name }));
  }

  /** @override */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    if (context.tabs?.[partId]) context.tab = context.tabs[partId];
    return context;
  }
}
