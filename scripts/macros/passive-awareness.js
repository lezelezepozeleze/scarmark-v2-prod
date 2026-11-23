/**
 * Scarmark — Passive Awareness
 * ------------------------------------------------------------------
 * Passive Awareness: does the character notice something without looking for
 * it (an ambush, a pickpocket, a smell of smoke)? Weaker than an active search.
 * Test: 1d100 vs effective Perception × 3 + modifier (capped at 95).
 * Effective Perception already includes fatigue and effects (a helmet −1 PER,
 * coffee +2, drunkenness −3 ...). Replaces the AWARENESS - PASSIVE skill
 * (Scarmark 1.0.36).
 *
 * The result is whispered to the GMs by default (the player should not learn
 * that there was something to notice); untick "Secret" to post it openly.
 *
 * HOW TO USE: select one or more tokens (or have a character assigned to your
 * user), paste this into a Script macro and Execute. With several tokens
 * selected, each rolls once with the same modifier.
 */
(async () => {
  const MULTIPLIER = 3;
  const TITLE = "Passive Awareness";

  const controlled = canvas.tokens?.controlled ?? [];
  const pairs = controlled.length
    ? controlled.filter(t => t.actor).map(t => ({ token: t, actor: t.actor }))
    : (game.user.character ? [{ token: null, actor: game.user.character }] : []);
  if ( !pairs.length ) return ui.notifications.warn(`${TITLE}: select a token (or assign a character to your user).`);

  const res = await foundry.applications.api.DialogV2.prompt({
    window: { title: TITLE },
    content: `
      <p style="margin:.25rem 0 .5rem">${pairs.map(p => Handlebars.escapeExpression(p.actor.name)).join(", ")} — Perception × ${MULTIPLIER}</p>
      <div class="form-group">
        <label>Modifier</label>
        <input type="number" name="modifier" value="0" step="5" autofocus />
      </div>
      <div class="form-group">
        <label>Secret (GM only)</label>
        <input type="checkbox" name="secret" checked />
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

  const LABEL = { cs: "Critical Success", ms: "Success", mf: "Failure", cf: "Critical Failure" };
  const RESULT = {
    cs: "Notices it at once, and more.",
    ms: "Notices it.",
    mf: "Notices nothing.",
    cf: "Notices nothing, or gets it wrong."
  };
  const gms = game.users.filter(u => u.isGM).map(u => u.id);

  for ( const { token, actor } of pairs ) {
    const per = actor.system.attributes?.per?.effective;
    if ( per === undefined ) {
      ui.notifications.warn(`${TITLE}: ${actor.name} has no Perception (update the Scarmark system to 1.0.36).`);
      continue;
    }
    const target = Math.min(95, Math.max(0, per * MULTIPLIER + res.modifier));
    const roll = await new Roll("1d100").evaluate();
    const d = roll.total;
    const crit = (d % 5) === 0;
    const level = d <= target ? (crit ? "cs" : "ms") : (crit ? "cf" : "mf");

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
    if ( res.secret ) data.whisper = gms;
    await ChatMessage.create(data);
  }
})();
