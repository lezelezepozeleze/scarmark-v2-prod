/**
 * Set Original durability in the Armor compendium (and in world armor items).
 * The compendium armor pieces have no Original durability (0), so every new copy (also those made by
 * the NPC imports) starts as e.g. 4/0. This sets originalQuality = Durability (quality) for every
 * armor piece that has Durability above 0 and no Original durability. Natural armor (-1) and
 * destroyed pieces (0) are left alone. Safe to run repeatedly.
 *
 * HOW TO USE: as GM, create a Script macro, paste this, Execute. Then run "Sync Armor Durability"
 * (scripts/macros/sync-armor-durability.js) once to fix the armor already on actors.
 */
(async () => {
  if (!game.user.isGM) return ui.notifications.warn("Armor original durability: GM only.");
  const report = [];
  const fix = async (docs, where, update) => {
    const updates = [];
    for (const d of docs) {
      if (d.type !== "armor") continue;
      const q = d.system.quality;
      if (!(q > 0) || d.system.originalQuality > 0) continue;
      updates.push({ _id: d.id, "system.originalQuality": q });
      report.push(`${where}: ${d.name} ${q}/0 -> ${q}/${q}`);
    }
    if (updates.length) await update(updates);
  };
  await fix(game.items.contents, "World", u => Item.updateDocuments(u));
  for (const pack of game.packs.filter(p => p.documentName === "Item" && p.metadata.packageName === "scarmark")) {
    const wasLocked = pack.locked;
    if (wasLocked) await pack.configure({ locked: false });
    await fix(await pack.getDocuments(), pack.metadata.label, u => Item.updateDocuments(u, { pack: pack.collection }));
    if (wasLocked) await pack.configure({ locked: true });
  }
  console.log("Armor original durability:\n" + report.join("\n"));
  ui.notifications.info(`Armor original durability: ${report.length} pieces set (see console F12).`);
})();
