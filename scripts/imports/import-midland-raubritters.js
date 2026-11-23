/**
 * Scarmark — Import: Midland NPCs, batch 4 (Raubritters)
 * ------------------------------------------------------------------
 * Creates 2 NPCs in the folder Scums: Raubritter I (Elite) and Raubritter II (Master), robber knights.
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
  {"name": "Raubritter I", "tier": "Elite", "folder": "Scums", "attrs": {"str": 16, "sta": 16, "dex": 14, "agl": 13, "wil": 14, "per": 12, "pre": 12, "int": 10, "spi": 9}, "skills": {"Vitality": 77, "Stealth": 46, "Close Combat": 85, "Unarmed Combat": 65, "Ranged Combat": 49, "Dodge": 53, "Initiative": 62, "Riding": 58}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Padded Cap", 1], ["Plate Helmet Visor", 1], ["Mail Aventail (for helmet only)", 1], ["Padded Gambeson", 1], ["Padded Legs", 1], ["Brigandine Cuirass with a fauld", 1], ["Brigandine Full Arms", 1], ["Brigandine Gauntlets", 1], ["Mail Leggings", 1], ["Sword II", 1], ["Mace III", 1], ["Heater Shield", 1], ["Dagger", 1], ["Wine, fine (bottle)", 1], ["Purse", 1], ["Pfennig", 60], ["Groschen", 25], ["Gulden", 5], ["Signet Ring", 1]], "desc": "Robber knight, a landless or ruined nobleman who turned his castle and his sword to highway robbery. Well armoured, well mounted and well practised."},
  {"name": "Raubritter II", "tier": "Master", "folder": "Scums", "attrs": {"str": 17, "sta": 17, "dex": 15, "agl": 14, "wil": 15, "per": 12, "pre": 13, "int": 11, "spi": 10}, "skills": {"Vitality": 82, "Stealth": 58, "Close Combat": 94, "Unarmed Combat": 77, "Ranged Combat": 60, "Dodge": 60, "Initiative": 74, "Riding": 76}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Padded Cap", 1], ["Plate Great Helmet", 1], ["Plate Gorget (Neck)", 1], ["Padded Gambeson", 1], ["Padded Legs", 1], ["Padded Mittens", 1], ["Mail Habergeon", 1], ["Plate Cuirass with a fauld", 1], ["Plate Shoulders", 1], ["Plate Full Arms", 1], ["Plate Gauntlets", 1], ["Plate Full Legs", 1], ["Plate Boots", 1], ["Estoc III", 1], ["Warhammer III", 1], ["Kite Shield", 1], ["Dagger", 1], ["Wine, fine (bottle)", 1], ["Purse", 1], ["Pfennig", 100], ["Groschen", 40], ["Gulden", 12], ["Signet Ring", 1], ["Jewelry", 1], ["Sapphire", 1]], "desc": "Robber knight of the old school, a veteran of many campaigns and of many ambushes. In full harness he is nearly impossible to stop, and he knows it."}
];

(async () => {
  if (!game.user?.isGM) return ui.notifications.error("NPC import: must be run by a GM.");
  const BATCH = "midland-scums-2";
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

    const items = game.scarmark.defaultArmorLocationItems("npc");

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
      type: "npc",
      folder: folder.id,
      system: { attributes, race: "Human", specialization: n.desc },
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
