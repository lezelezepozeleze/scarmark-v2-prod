/**
 * Scarmark — Awareness
 * ------------------------------------------------------------------
 * Active Awareness: the character looks, listens and searches on purpose.
 * Test: 1d100 vs effective Perception × 5 + modifier (capped at 95).
 * Effective Perception already includes fatigue and effects (a helmet −1 PER,
 * coffee +2, drunkenness −3 ...). Replaces the AWARENESS skill (Scarmark 1.0.36).
 *
 *   Critical Success — You notice everything there is to notice, and more.
 *   Success          — You notice it.
 *   Failure          — You notice nothing.
 *   Critical Failure — You notice nothing, or get it wrong.
 *
 * HOW TO USE: select exactly one token (or have a character assigned to your
 * user), paste this into a Script macro and Execute. The GM may tick "Secret"
 * to whisper the result to the GMs only.
 */
(async () => {
  const MULTIPLIER = 5;
  const TITLE = "Awareness";

  const controlled = canvas.tokens?.controlled ?? [];
  const token = controlled.length === 1 ? controlled[0] : null;
  const actor = token?.actor ?? game.user.character;
  if ( !actor ) return ui.notifications.warn(`${TITLE}: select exactly one token (or assign a character to your user).`);
  const per = actor.system.attributes?.per?.effective;
  if ( per === undefined ) return ui.notifications.warn(`${TITLE}: ${actor.name} has no Perception (update the Scarmark system to 1.0.36).`);

  const res = await foundry.applications.api.DialogV2.prompt({
    window: { title: TITLE },
    content: `
      <p style="margin:.25rem 0 .5rem"><strong>${Handlebars.escapeExpression(actor.name)}</strong> — Perception ${per} × ${MULTIPLIER}</p>
      <div class="form-group">
        <label>Modifier</label>
        <input type="number" name="modifier" value="0" step="5" autofocus />
      </div>
      <div class="form-group">
        <label>Secret (GM only)</label>
        <input type="checkbox" name="secret" />
      </div>`,
    ok: {
      label: "Roll",
      callback: (event, button) => ({
        modifier: Number(button.form.elements.modifier.value) || 0,
        secret: button.form.elements.secret.checked
      })
    },
    rejectClose: false
  });
  if ( !res ) return;

  const target = Math.min(95, Math.max(0, per * MULTIPLIER + res.modifier));
  const roll = await new Roll("1d100").evaluate();
  const d = roll.total;
  const crit = (d % 5) === 0;
  const level = d <= target ? (crit ? "cs" : "ms") : (crit ? "cf" : "mf");
  const LABEL = { cs: "Critical Success", ms: "Success", mf: "Failure", cf: "Critical Failure" };
  const RESULT = {
    cs: "You notice everything there is to notice, and more.",
    ms: "You notice it.",
    mf: "You notice nothing.",
    cf: "You notice nothing, or get it wrong."
  };

  const modLine = res.modifier ? ` (${per} × ${MULTIPLIER} ${res.modifier > 0 ? "+" : "−"} ${Math.abs(res.modifier)})` : "";
  let content = `<div class="scarmark-card test-card"><div class="test-block">`;
  content += `<div class="card-title">${TITLE} — ${Handlebars.escapeExpression(actor.name)}</div>`;
  content += `<div class="card-line">Target: ${target}${modLine}</div>`;
  content += `<div class="card-line">Roll: ${d}</div>`;
  content += `<hr class="card-sep">`;
  content += `<div class="test-outcome outcome-${level}">${LABEL[level]}</div>`;
  content += `<div class="card-line">${RESULT[level]}</div>`;
  content += `</div></div>`;

  const data = { speaker: ChatMessage.getSpeaker({ token: token?.document, actor }), content, rolls: [roll] };
  if ( res.secret ) data.whisper = game.users.filter(u => u.isGM).map(u => u.id);
  await ChatMessage.create(data);
})();
