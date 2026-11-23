/**
 * Scarmark — Rest
 * HOW TO USE: paste this entire file into a Script macro, select one or more
 * tokens you own (works for linked and unlinked tokens) and Execute.
 * Sets the stored Fatigue of every selected token to 0 and posts one chat
 * line. It does not touch Will/Spirit Capacity (use Recharge for those), wounds
 * or game time; confirm at the table that the rest actually took place.
 */
(async () => {
  const tokens = (canvas.tokens?.controlled ?? []).filter(t => t.actor?.isOwner);
  if (!tokens.length) return ui.notifications.warn("Select at least one token you own.");
  const lines = [];
  for (const token of tokens) {
    const actor = token.actor;
    const before = actor._source?.system?.resources?.fatigue ?? 0;
    await actor.update({ "system.resources.fatigue": 0 });
    lines.push(`${foundry.utils.escapeHTML(token.name)}: Fatigue ${before} &rarr; 0`);
  }
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker(),
    content: `<div class="scarmark-card"><strong>Rest</strong><p>${lines.join("<br>")}</p></div>`
  });
})();
