/**
 * Sync Armor Durability: finds every armor piece in the game and makes Durability and Original durability consistent.
 * Covers world Items, the Items of world Actors and of the Actors of unlinked tokens on all scenes (compendia are the templates and are not touched).
 *
 * For each piece (Natural armor, -1, is skipped):
 *  1. Original durability: kept when set; else taken from the compendium item the piece was copied from; else from its current Durability (a unique item such as Wyvern Gloves 4/0 becomes 4/4); a destroyed piece (0) with neither is listed and left alone.
 *  2. Durability: never above the Original. With "Repair to full" ticked it is set to the Original (full) on every piece.
 *
 * It lists what it will change and asks before it writes. Safe to run repeatedly.
 */
(async () => {
  if (!game.user.isGM) return ui.notifications.warn("Sync Armor Durability: GM only.");

  const repair = await foundry.applications.api.DialogV2.prompt({
    window: { title: "Sync Armor Durability" },
    content: `<p>Fills in a missing Original durability and keeps Durability from exceeding it.</p>
      <label style="display:flex;gap:.5em;align-items:center"><input type="checkbox" name="repair" checked /> Repair to full (Durability = Original durability)</label>`,
    ok: { label: "Check", callback: (event, button) => button.form.elements.repair.checked }
  });
  if (repair === null || repair === undefined) return;

  const sourceCache = new Map();
  async function sourceDurability(item) {
    const uuid = [item._stats?.compendiumSource, item.flags?.core?.sourceId].find(u => typeof u === "string" && u.startsWith("Compendium."));
    if (!uuid) return null;
    if (!sourceCache.has(uuid)) {
      let value = null;
      try {
        const source = await fromUuid(uuid);
        const q = Number(source?.type === "armor" ? (source.system.originalQuality > 0 ? source.system.originalQuality : source.system.quality) : NaN);
        value = q > 0 ? q : null;
      } catch (err) { console.warn("Sync Armor Durability: cannot read", uuid, err); }
      sourceCache.set(uuid, value);
    }
    return sourceCache.get(uuid);
  }

  const actors = new Map();
  for (const actor of game.actors) actors.set(actor.uuid, actor);
  for (const scene of game.scenes) for (const token of scene.tokens) if (token.actor && !token.actorLink) actors.set(token.actor.uuid, token.actor);

  const jobs = [];
  const report = [];
  const skipped = [];
  let checked = 0;

  async function inspect(owner, where, items) {
    const updates = [];
    for (const item of items) {
      if (item.type !== "armor") continue;
      checked++;
      const quality = item.system.quality;
      if (quality === -1) continue;
      let original = item.system.originalQuality;
      if (!(original > 0)) original = (await sourceDurability(item)) ?? (quality > 0 ? quality : 0);
      if (!(original > 0)) { skipped.push(`${where}: ${item.name} (Durability ${quality}, no Original durability and no source)`); continue; }
      const target = repair ? original : Math.min(quality, original);
      if (target === quality && original === item.system.originalQuality) continue;
      updates.push({ _id: item.id, "system.originalQuality": original, "system.quality": target });
      report.push(`${where}: ${item.name} ${quality}/${item.system.originalQuality} -> ${target}/${original}`);
    }
    if (updates.length) jobs.push({ owner, updates });
  }

  await inspect(null, "World items", game.items.contents);
  for (const actor of actors.values()) await inspect(actor, actor.token ? `${actor.name} (token)` : actor.name, actor.items.contents);

  console.log(`Sync Armor Durability: ${checked} armor pieces found.\n` + report.join("\n") + (skipped.length ? "\nLeft alone:\n" + skipped.join("\n") : ""));
  if (!report.length) return ui.notifications.info(`Sync Armor Durability: ${checked} armor pieces found, nothing to change.` + (skipped.length ? ` ${skipped.length} left alone (see console F12).` : ""));

  const apply = await foundry.applications.api.DialogV2.confirm({
    window: { title: "Sync Armor Durability" },
    content: `<p>${checked} armor pieces found, ${report.length} will be changed.</p>`
      + (skipped.length ? `<p>${skipped.length} left alone (see console F12).</p>` : "")
      + `<p>Apply?</p>`,
    yes: { label: "Apply" }, no: { label: "Cancel" }
  });
  if (!apply) return;

  for (const job of jobs) {
    if (job.owner) await job.owner.updateEmbeddedDocuments("Item", job.updates);
    else await Item.updateDocuments(job.updates);
  }
  ui.notifications.info(`Sync Armor Durability: ${report.length} pieces updated.`);
})();
