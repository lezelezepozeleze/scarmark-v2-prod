/** What the actor and item sheets share for portraits and Active Effects: the portrait picker, a blank effect, toggling, opening and deleting an effect. Handlers named on* are called by ApplicationV2 with the sheet as `this`. */
import { esc } from "../../helpers/escape.mjs";
import { EFFECT_DEFAULT_IMG } from "../../config/index.mjs";

/** The id of the effect row a clicked element sits in. */
export const effectIdOf = (target) => target.closest("[data-effect-id]")?.dataset.effectId;

/** The data of a new, blank Active Effect. */
export function blankEffectData() {
  return {
    name: game.i18n.localize("SCARMARK.Effect.new"),
    img: EFFECT_DEFAULT_IMG,
    disabled: false
  };
}

/** Open the file picker for the portrait of the sheet's document. */
export function onEditImage() {
  const current = this.document.img;
  new foundry.applications.apps.FilePicker.implementation({
    type: "image",
    current,
    callback: (path) => this.document.update({ img: path })
  }).render(true);
}

/** Switch an effect on or off. */
export function toggleEffect(effect) {
  effect?.update({ disabled: !effect.disabled });
}

/** Open the sheet of an effect. */
export function openEffect(effect) {
  effect?.sheet.render(true);
}

/**
 * Delete an effect. One transferred from an owned item (race trait, gear...) lives on that item: deleting it strips it from the item, so confirm first.
 */
export async function deleteEffectConfirmed(effect) {
  if (effect.parent?.documentName === "Item") {
    const ok = await foundry.applications.api.DialogV2.confirm({
      window: { title: `${game.i18n.localize("SCARMARK.Effect.delete")}: ${effect.name}` },
      content: game.i18n.format("SCARMARK.Effect.deleteFromItem", { effect: esc(effect.name), item: esc(effect.parent.name) }),
      rejectClose: false
    });
    if (!ok) return;
  }
  effect.delete();
}
