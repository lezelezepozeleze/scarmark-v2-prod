/**
 * Fix Armor Durability Everywhere: sets Original durability on every armor piece that has none (shown as "3/-").
 *
 * Covers: Item compendia (the Armor pack is fixed first), Actor compendia (the armor embedded in the
 * actors in them), world Items, world Actors, and the actors of unlinked tokens on all scenes.
 *
 * For each armor piece with Original durability 0 and Durability above 0 (Natural armor -1 and destroyed
 * pieces 0 are left alone):
 *   Original = the Original durability of the compendium Armor item of the same name (set from its
 *              Durability first, if the compendium item has none); else the piece's own Durability.
 *   Durability is never changed (a damaged piece stays damaged), except that it is lowered to the
 *   Original when it is above it.
 *
 * It first reports what it will change (console F12) and asks before it writes. Safe to run repeatedly.
 * HOW TO USE: as GM, create a Script macro, paste this, Execute.
 */
(async () => {
  if (!game.user.isGM) return ui.notifications.warn("Fix Armor Durability: GM only.");

  // 1) The reference: armor item name -> original durability, from the system Armor compendium.
  const armorPack = game.packs.get("scarmark.armor");
  if (!armorPack) return ui.notifications.error("Fix Armor Durability: pack scarmark.armor not found.");
  const reference = new Map();
  for (const doc of await armorPack.getDocuments()) {
    if (doc.type !== "armor") continue;
    const q = doc.system.quality;
    const o = doc.system.originalQuality > 0 ? doc.system.originalQuality : (q > 0 ? q : 0);
    if (o > 0) reference.set(doc.name.trim().toLowerCase(), o);
  }

  const wanted = (item) => {
    if (item.type !== "armor") return null;
    const q = item.system.quality;
    if (q === -1) return null;
    let original = item.system.originalQuality;
    if (!(original > 0)) original = reference.get(item.name.trim().toLowerCase()) ?? (q > 0 ? q : 0);
    if (!(original > 0)) return null;
    const quality = q > original ? original : q;
    if (original === item.system.originalQuality && quality === q) return null;
    return { _id: item.id, "system.originalQuality": original, "system.quality": quality };
  };

  // 2) Collect the jobs: { label, apply() } and a report.
  const jobs = [];
  const report = [];
  const inspect = (label, items, apply, pack = null) => {
    const updates = [];
    for (const item of items) {
      const u = wanted(item);
      if (!u) continue;
      updates.push(u);
      report.push(`${label}: ${item.name} ${item.system.quality}/${item.system.originalQuality} -> ${u["system.quality"]}/${u["system.originalQuality"]}`);
    }
    if (updates.length) jobs.push({ label, updates, apply, pack });
  };

  inspect("World items", game.items.contents, (u) => Item.updateDocuments(u));
  const actors = new Map();
  for (const actor of game.actors) actors.set(actor.uuid, actor);
  for (const scene of game.scenes) for (const token of scene.tokens) if (token.actor && !token.actorLink) actors.set(token.actor.uuid, token.actor);
  for (const actor of actors.values()) inspect(actor.token ? `${actor.name} (token)` : actor.name, actor.items.contents, (u) => actor.updateEmbeddedDocuments("Item", u));

  for (const pack of game.packs) {
    if (!["Item", "Actor"].includes(pack.documentName)) continue;
    const docs = await pack.getDocuments();
    if (pack.documentName === "Item") {
      inspect(`Compendium ${pack.metadata.label}`, docs, (u) => Item.updateDocuments(u, { pack: pack.collection }), pack);
    } else {
      for (const actor of docs) inspect(`Compendium ${pack.metadata.label}: ${actor.name}`, actor.items.contents, (u) => actor.updateEmbeddedDocuments("Item", u), pack);
    }
  }

  console.log(`Fix Armor Durability: ${report.length} armor pieces to change.\n` + report.join("\n"));
  if (!report.length) return ui.notifications.info("Fix Armor Durability: nothing to change.");

  const go = await foundry.applications.api.DialogV2.confirm({
    window: { title: "Fix Armor Durability Everywhere" },
    content: `<p>${report.length} armor pieces in ${jobs.length} places will get an Original durability (list in the console, F12).</p><p>Apply?</p>`,
    yes: { label: "Apply" }, no: { label: "Cancel" }
  });
  if (!go) return;

  // 3) Apply. Compendia are unlocked for the write and locked again afterwards. The Armor pack goes first.
  const locked = new Set();
  const unlock = async (pack) => { if (pack && pack.locked && !locked.has(pack)) { locked.add(pack); await pack.configure({ locked: false }); } };
  jobs.sort((a, b) => (b.pack === armorPack ? 1 : 0) - (a.pack === armorPack ? 1 : 0));
  let done = 0, failed = 0;
  for (const job of jobs) {
    try { await unlock(job.pack); await job.apply(job.updates); done += job.updates.length; }
    catch (err) { failed += job.updates.length; console.error("Fix Armor Durability failed for", job.label, err); }
  }
  for (const pack of locked) await pack.configure({ locked: true });
  ui.notifications[failed ? "warn" : "info"](`Fix Armor Durability: ${done} pieces fixed` + (failed ? `, ${failed} failed (see console F12)` : "") + ". Reload (F5) to refresh open sheets.");
})();
