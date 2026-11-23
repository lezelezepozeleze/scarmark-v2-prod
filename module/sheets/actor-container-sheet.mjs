/** The sheet of the container actor (chest, stash, merchant): the Contents tab, and for the GM an Actions tab. */
import ScarmarkActorSheetBase from "./actor-sheet-base.mjs";
import { tabsConfig, partsConfig, visibleTo } from "./sheet-layout.mjs";
import { ActionsPanelMixin } from "./actions/action-panel.mjs";
import { inspect } from "../helpers/item-actions.mjs";

/** The tabs only the GM sees. What a player cannot read, a player still sets off: a "when inspected" action runs for whoever opens the sheet. */
const GM_ONLY = ["actions"];

/**
 * Sheet for the "container" ACTOR type (loot chest / stash / merchant). A Contents tab that reuses the Character Gear tab (gear.hbs) plus a Max Capacity field in the header, and for the GM an Actions tab: a "when inspected" action happens to the player who opens the sheet. Inherits all the gear actions (add/edit/delete/store/...) from the base sheet; being stat-less, the attribute/combat/skill blocks are simply empty (attributeKeys/skillCategories return [], prepareCombat in actor-context.mjs returns early).
 */
export default class ScarmarkContainerActorSheet extends ActionsPanelMixin(ScarmarkActorSheetBase) {

  static DEFAULT_OPTIONS = {
    classes: ["container-actor"],
    position: { width: 720, height: 620 }
  };

  // Reuse the "gear" tab id so gear.hbs renders unchanged; label it Contents.
  static TABS = tabsConfig(["gear", "actions"], { initial: "gear", labels: { gear: "SCARMARK.Tabs.contents" } });

  static PARTS = partsConfig(["gear", "actions"], { header: "container-header" });

  /** @override - a container has no attributes. */
  get attributeKeys() {
    return [];
  }

  /** @override - a container has no skills. */
  get skillCategories() {
    return [];
  }

  /** @override The Actions tab is the GM's. */
  _prepareTabs(group) {
    return visibleTo(super._prepareTabs(group), GM_ONLY, game.user.isGM);
  }

  /** @override The part of a tab the user does not see is not rendered. */
  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    if (options.parts) options.parts = visibleTo(options.parts, GM_ONLY, game.user.isGM);
  }

  /** @override A player opening the sheet sets off its "when inspected" actions, as their character. */
  _onFirstRender(context, options) {
    super._onFirstRender(context, options);
    inspect(this.document);
  }
}
