/**
 * Scarmark — Stun Check
 * ------------------------------------------------------------------
 * The Stun Test for a case the strike card does not cover: an electric shock
 * (elemental magic, which need not cause a wound), or a blow to the head you
 * want to test by hand. A Heavy or Severe wound to the Head (Wound Level 2-3) offers
 * the very same test as a button on its strike card; Dire and Mortal wounds
 * knock the victim out without a test.
 *
 * Test (the system rolls it, see game.scarmark.stunTest): 1d100 against 50, plus
 * the protection of the best armor piece worn on the Head (only for a blow to
 * the head: layer 5, rigid, +20; layers 2 to 4, soft, +10), plus your modifier.
 * For an electric shock use the modifier: −5 to −25 for iron-bearing armour
 * (Mail, Lamellar, Brigandine, Plate), the GM's call.
 *
 *   Critical Success — You saw stars; next round you act first, ignoring Initiative.
 *   Success          — That was a hit, but you withstood it.
 *   Failure          — You are Stunned for one round (defense −30, you lose your action).
 *   Critical Failure — You fall Unconscious.
 *
 * HOW TO USE
 *   1. Select exactly one token — the character that was hit (falls back to your
 *      assigned character if no token is selected).
 *   2. Paste this into a Script macro and Execute, or drop this file on the hotbar.
 */
(async () => {
  const controlled = canvas.tokens?.controlled ?? [];
  const token = controlled.length === 1 ? controlled[0] : null;
  const actor = token?.actor ?? game.user.character;
  if ( !actor ) {
    return ui.notifications.warn("Stun Check: select exactly one token (the character that was hit).");
  }
  if ( !game.scarmark?.stunTest ) {
    return ui.notifications.error("Stun Check: update the Scarmark system to 1.0.39-beta or later.");
  }

  const res = await foundry.applications.api.DialogV2.prompt({
    window: { title: "Stun Check" },
    content: `
      <p style="margin:.25rem 0 .5rem">Target: <strong>${Handlebars.escapeExpression(actor.name)}</strong> — 1d100 against 50 (+ head protection for a blow).</p>
      <div class="form-group">
        <label>Cause</label>
        <select name="cause">
          <option value="blow">Blow to the head</option>
          <option value="electric">Electric shock (elemental magic)</option>
        </select>
      </div>
      <div class="form-group">
        <label>Modifier</label>
        <input type="number" name="modifier" value="0" step="5" autofocus />
      </div>
      <p style="opacity:.7;font-size:.85em;margin:.4rem 0 0">GM guidance: −5 to −25 for an electric shock on iron-bearing armour. The head protection of a blow is added automatically.</p>`,
    ok: {
      label: "Roll",
      callback: (event, button) => ({
        cause: button.form.elements.cause.value,
        modifier: Number(button.form.elements.modifier.value) || 0
      })
    },
    rejectClose: false
  });
  if ( !res ) return;

  await game.scarmark.stunTest(actor, res);
})();
