/**
 * Natural weapons: add Blunt impact to big Claws and Bite (III and up).
 * A troll's paw or a crocodile's jaws may not cut or pierce plate, but the blow still crushes.
 * Blunt = the same as the existing Edged (Claws) / Piercing (Bite) impact (compare Mace III 7, Hooves II 7, Giant Club 10).
 *   III 5, IV 7, V 9. Claws/Bite I and II are unchanged (small beasts, race traits).
 * Updates items named Claws III-V and Bite III-V in the world Items and in the weapon compendium.
 * Safe to run repeatedly (sets values, never adds). Only touches weapons whose Blunt is -1 or already set by this rule.
 */
const RULES = {
  "Claws III": 5, "Claws IV": 7, "Claws V": 9,
  "Bite III": 5, "Bite IV": 7, "Bite V": 9
};

const report = [];

async function patch(docs, where, updateFn) {
  const updates = [];
  for (const d of docs) {
    const target = RULES[d.name];
    if (target === undefined || d.type !== "weapon") continue;
    if (d.system.impact.blunt === target) { report.push(`${where}: ${d.name} already ${target}`); continue; }
    updates.push({ _id: d.id, "system.impact.blunt": target });
    report.push(`${where}: ${d.name} Blunt ${d.system.impact.blunt} -> ${target}`);
  }
  if (updates.length) await updateFn(updates);
}

// World items
await patch(game.items.contents, "World", u => Item.updateDocuments(u));

// Compendia with weapons (any pack that holds weapon items)
for (const pack of game.packs.filter(p => p.documentName === "Item" && p.metadata.packageName === "scarmark")) {
  const wasLocked = pack.locked;
  if (wasLocked) await pack.configure({ locked: false });
  const docs = await pack.getDocuments();
  await patch(docs, pack.metadata.label, u => Item.updateDocuments(u, { pack: pack.collection }));
  if (wasLocked) await pack.configure({ locked: true });
}

ui.notifications.info(`Natural weapons: ${report.length} items checked, see console (F12).`);
console.log("Natural weapons Blunt update:\n" + report.join("\n"));
