/**
 * Scarmark — Import: Midland NPCs, Nobility
 * ------------------------------------------------------------------
 * Creates 2 NPCs in the folder Nobility: Nobleman (with a sword) and Noble Woman (Common, civilian nobles).
 *
 * Actors are created directly in World Actors, in the folder
 * "Midland NPCs / <sub-folder>" (sub-folder per NPC, see the data).
 *
 * Each actor gets: the 9 attributes, the skills below (copied from the Skills
 * compendium, level set directly; a skill missing from the compendium is created
 * with its standard attributes instead), the default humanoid Armor Locations,
 * and its kit (weapons, armor, gear, coins) copied from the system compendia by
 * exact name, with quantities. Everyone also has Fist, Leg and Head (Unarmed
 * Combat). Items with a third entry 0 are put on the actor NOT carried (stored
 * somewhere). The background text goes to the Specialization field. Tokens are
 * NEUTRAL and unlinked; no token or portrait art is set (add it yourself).
 *
 * Items missing from a compendium are listed in the console and in the final
 * notification, never dropped silently.
 *
 * HOW TO USE: as GM, create a new "Script" macro, paste this, Execute.
 * Re-running replaces actors of this batch (same name + flag) in the folder.
 * ONE-TIME import: afterwards edit the actors in Foundry and move them to a
 * compendium by hand.
 */

const NPCS = [
  {"name": "Nobleman", "tier": "Common", "folder": "Nobility", "type": "npc", "race": "Human", "attrs": {"str": 12, "sta": 13, "dex": 12, "agl": 11, "wil": 12, "per": 12, "pre": 15, "int": 14, "spi": 10}, "skills": {"Vitality": 64, "Stealth": 21, "Close Combat": 49, "Unarmed Combat": 33, "Ranged Combat": 29, "Dodge": 30, "Initiative": 35, "Riding": 45, "Language - Other": 60, "Erminfried": 35}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Fancy Clothes", 1], ["Cloth Cap", 1], ["Woolen Cloak", 1], ["Leather Gloves", 1], ["Sword II", 1], ["Dagger", 1], ["Signet Ring", 1], ["Jewelry", 1], ["Book", 1], ["Parchment (sheet)", 2], ["Ink & quill", 1], ["Wine, fine (bottle)", 1], ["Comb", 1], ["Soap", 1], ["Purse", 1], ["Pfennig", 60], ["Groschen", 40], ["Gulden", 10]], "desc": "Educated, well-fed and good-looking nobleman in civilian dress, used to being obeyed. He has had a fencing master since boyhood and wears a sword as a mark of rank, but he is no soldier. Reads, writes and rides well, and knows how to talk to people above and below him."},
  {"name": "Noble Woman", "tier": "Common", "folder": "Nobility", "type": "npc", "race": "Human", "attrs": {"str": 8, "sta": 11, "dex": 12, "agl": 12, "wil": 13, "per": 13, "pre": 16, "int": 15, "spi": 11}, "skills": {"Vitality": 59, "Stealth": 27, "Close Combat": 27, "Unarmed Combat": 26, "Ranged Combat": 24, "Dodge": 33, "Initiative": 38, "Language - Other": 65, "Erminfried": 35, "Physician": 25}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Fancy Dress", 1], ["White Veil", 1], ["Woolen Cloak", 1], ["Leather Gloves", 1], ["Dagger", 1], ["Jewelry", 2], ["Amulet", 1], ["Book", 1], ["Steel mirror", 1], ["Comb", 1], ["Luxury Perfume", 1], ["Purse", 1], ["Pfennig", 50], ["Groschen", 30], ["Gulden", 8]], "desc": "Educated, well-fed and beautiful noblewoman in civilian dress. Quick-witted, well read and used to a world of courts, letters and carefully chosen words. She carries nothing sharper than a small dagger, and nothing harder to use than her own name."}
];

// Items made for this import (not in a compendium). They are also created once as world Items (folder "Fey Items") so you can move them to a compendium.
const CUSTOM = {};

(async () => {
  if (!game.user?.isGM) return ui.notifications.error("NPC import: must be run by a GM.");
  const BATCH = "midland-nobility-1";
  const PARENT = "Midland NPCs";
  const PACKS = ["weapons", "armor", "gear", "gear-funny", "valuables", "currencies", "alchemy"].map(n => `scarmark.${n}`);
  // Standard definitions, used only when the Skills compendium does not have the skill yet.
  const SKILL_DEFS = {
    "arcane": ["esoterics", "arcane", "int", "spi", "wil"],
    "handicraft": ["skill", "", "dex", "dex", "wil"],
    "erminfried": ["esoterics", "religion", "pre", "int", "str"],
    "alchemy": ["skill", "", "per", "int", "spi"],
    "animal handling": ["skill", "", "agl", "pre", "wil"],
    "lockpicking": ["skill", "", "dex", "per", "wil"],
    "language - other": ["skill", "", "int", "int", "wil"]
  };
  const norm = (s) => String(s).toLowerCase().replace(/[‐-―−]/g, "-").replace(/\s+/g, " ").trim();

  // folders
  const ensureFolder = async (name, parent) => {
    const hit = game.folders.find(f => f.type === "Actor" && f.name === name && (f.folder?.id ?? null) === (parent?.id ?? null));
    return hit ?? Folder.create({ name, type: "Actor", folder: parent?.id ?? null });
  };
  const parent = await ensureFolder(PARENT, null);
  const folders = {};
  for (const name of new Set(NPCS.map(n => n.folder))) folders[name] = await ensureFolder(name, parent);

  // custom items as world Items (once)
  const itemFolder = game.folders.find(f => f.type === "Item" && f.name === "Fey Items") ?? await Folder.create({ name: "Fey Items", type: "Item" });
  for (const item of Object.values(CUSTOM)) if (!game.items.find(i => i.name === item.name && i.folder?.id === itemFolder.id)) await Item.create({ ...foundry.utils.deepClone(item), folder: itemFolder.id });

  // pack indexes
  const index = new Map(); // normalized name -> {pack, id}
  for (const key of PACKS) {
    const pack = game.packs.get(key);
    if (!pack) { console.warn(`NPC import | pack ${key} not found`); continue; }
    for (const e of await pack.getIndex()) { const k = norm(e.name); if (!index.has(k)) index.set(k, { pack, id: e._id }); }
  }
  const skillPack = game.packs.get("scarmark.skills");
  if (!skillPack) return ui.notifications.error("NPC import: skills pack scarmark.skills not found.");
  const skillIndex = new Map((await skillPack.getIndex()).map(e => [norm(e.name), e._id]));

  const getItem = async (name) => {
    if (CUSTOM[name]) return foundry.utils.deepClone(CUSTOM[name]);
    const hit = index.get(norm(name)); if (!hit) return null;
    const d = (await hit.pack.getDocument(hit.id)).toObject();
    delete d._id; delete d.folder; delete d.sort;
    return d;
  };
  const getSkill = async (name, level) => {
    const id = skillIndex.get(norm(name));
    if (id) {
      const d = (await skillPack.getDocument(id)).toObject();
      delete d._id; delete d.folder; delete d.sort;
      d.system.level = level;
      return d;
    }
    const def = SKILL_DEFS[norm(name)];
    if (!def) return null;
    const [category, kind, a1, a2, a3] = def;
    console.warn(`NPC import | skill "${name}" not in the Skills compendium, created from its standard definition`);
    return { name, type: "skill", system: { category, esotericKind: kind, attribute1: a1, attribute2: a2, attribute3: a3, level } };
  };

  const missing = [];
  let made = 0;
  for (const n of NPCS) {
    const folder = folders[n.folder];
    // replace a previous run of this batch
    for (const old of game.actors.filter(a => a.name === n.name && a.getFlag("scarmark", "npcBatch") === BATCH)) await old.delete();

    const items = game.scarmark.defaultArmorLocationItems(n.type ?? "npc");

    for (const [skill, level] of Object.entries(n.skills)) {
      const d = await getSkill(skill, level);
      if (!d) { missing.push(`${n.name}: skill ${skill}`); continue; }
      items.push(d);
    }
    for (const [name, qty, carried] of n.items) {
      const d = await getItem(name);
      if (!d) { missing.push(`${n.name}: item ${name}`); continue; }
      d.system.quantity = qty;
      // armor copied from the compendium: Original durability = Durability when the compendium has none
      if (d.type === "armor" && !(d.system.originalQuality > 0) && d.system.quality > 0) d.system.originalQuality = d.system.quality;
      if (carried === 0) d.system.carried = false;
      items.push(d);
    }

    const attributes = Object.fromEntries(Object.entries(n.attrs).map(([k, v]) => [k, { base: v }]));
    await Actor.create({
      name: n.name,
      type: n.type ?? "npc",
      folder: folder.id,
      system: { attributes, race: n.race ?? "Human", specialization: n.desc },
      prototypeToken: { name: n.token ?? n.name, actorLink: false, disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL },
      flags: { scarmark: { npcBatch: BATCH, tier: n.tier } },
      items
    });
    made++;
  }

  if (missing.length) console.warn("NPC import | not found:", missing);
  ui.notifications[missing.length ? "warn" : "info"](
    `NPC import: ${made} actors created in "${PARENT}"` + (missing.length ? `, ${missing.length} items/skills not found (see console F12)` : "."));
})();
