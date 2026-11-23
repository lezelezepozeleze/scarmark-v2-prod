/**
 * Scarmark — Import: Midland NPCs, batch 7 (Wood Elves)
 * ------------------------------------------------------------------
 * Creates 4 Forest Elf NPCs in the folder Wood Elves: Wood Elf Scout (Veteran), Wood Elf Archer (Veteran), Wood Elf Warrior (Elite) and Tikka Naira (Hero).
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
 * somewhere). The background text goes to the Specialization field. Wood elves carry the Forest Elf racial trait item (from the Racial Traits compendium), their racial attribute changes (STR -1, DEX +1, AGL +2, INT +1, PER +3) are already included in the attribute values, and the racial skill bonuses (+10 Ranged Combat, +10 Stealth, +5 Dodge for Quick Reflexes) are already included in the skill levels, because the trait carries no Active Effects now. Tokens are
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
  {"name": "Wood Elf Scout", "tier": "Veteran", "folder": "Wood Elves", "race": "Forest Elf", "attrs": {"str": 11, "sta": 12, "dex": 14, "agl": 16, "wil": 12, "per": 16, "pre": 9, "int": 11, "spi": 9}, "skills": {"Vitality": 60, "Stealth": 59, "Close Combat": 44, "Unarmed Combat": 44, "Ranged Combat": 62, "Dodge": 69, "Initiative": 54, "Language - Other": 45}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Cloth Hood", 1], ["Woolen Cloak", 1], ["Leather Cap", 1], ["Leather Vest", 1], ["Leather Gloves", 1], ["Elven Longknife I", 1], ["Dagger", 1], ["Bow (Shortbow)", 1], ["Arrow (Shortbow) I", 20], ["Quiver", 1], ["Waterskin (water)", 1], ["Dried meat (Portion)", 2], ["Rope, hemp (50 ft)", 1], ["Snare", 2], ["Bedroll", 1], ["Tinderbox (flint & steel)", 1], ["Pfennig", 8], ["Forest Elf", 1]], "desc": "Light scout of the deep woods. He walks ahead of the host, reads the forest like a book and is gone before anyone knows he was there."},
  {"name": "Wood Elf Archer", "tier": "Veteran", "folder": "Wood Elves", "race": "Forest Elf", "attrs": {"str": 11, "sta": 13, "dex": 16, "agl": 16, "wil": 12, "per": 17, "pre": 9, "int": 10, "spi": 9}, "skills": {"Vitality": 64, "Stealth": 55, "Close Combat": 52, "Unarmed Combat": 46, "Ranged Combat": 75, "Dodge": 69, "Initiative": 54}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Cloth Hood", 1], ["Woolen Cloak", 1], ["Leather Cap", 1], ["Leather Jacket", 1], ["Leather Gloves", 1], ["Leather Greaves", 1], ["Bow (Longbow)", 1], ["Arrow (Longbow) II", 20], ["Arrow (Bodkin)", 6], ["Quiver", 1], ["Elven Longknife II", 1], ["Dagger", 1], ["Waterskin (water)", 1], ["Dried meat (Portion)", 1], ["Whetstone (personal)", 1], ["Pfennig", 10], ["Forest Elf", 1]], "desc": "Archer of the elven woodland host. He picks his shots, picks his ground and does not miss often."},
  {"name": "Wood Elf Warrior (Elite)", "tier": "Elite", "folder": "Wood Elves", "race": "Forest Elf", "attrs": {"str": 14, "sta": 15, "dex": 15, "agl": 17, "wil": 14, "per": 15, "pre": 11, "int": 11, "spi": 9}, "skills": {"Vitality": 74, "Stealth": 59, "Close Combat": 81, "Unarmed Combat": 66, "Ranged Combat": 69, "Dodge": 82, "Initiative": 68}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Padded Cap", 1], ["Leather Cap", 1], ["Mail Hood", 1], ["Leather Coat", 1], ["Padded Gambeson", 1], ["Cuir bouilli Half Arms", 1], ["Leather Gloves", 1], ["Leather Greaves", 1], ["Elven Blade III", 1], ["Elven Longknife II", 1], ["Bow (Shortbow)", 1], ["Arrow (Shortbow) II", 15], ["Quiver", 1], ["Waterskin (water)", 1], ["Dried meat (Portion)", 1], ["Healing Kit", 1], ["Pfennig", 15], ["Groschen", 8], ["Gulden", 1], ["Forest Elf", 1]], "desc": "Elite warrior of the woodland host, a swordsman who fights in light armour and never stays where the enemy expects him."},
  {"name": "Tikka Naira", "tier": "Hero", "folder": "Wood Elves", "race": "Forest Elf", "attrs": {"str": 14, "sta": 15, "dex": 17, "agl": 18, "wil": 16, "per": 17, "pre": 13, "int": 13, "spi": 12}, "skills": {"Vitality": 77, "Stealth": 84, "Close Combat": 89, "Unarmed Combat": 72, "Ranged Combat": 99, "Dodge": 95, "Initiative": 88, "Language - Other": 70, "Physician": 60}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Cloth Hood", 1], ["Woolen Cloak", 1], ["Padded Cap", 1], ["Mail Hood", 1], ["Leather Coat", 1], ["Padded Gambeson", 1], ["Cuir bouilli Half Arms", 1], ["Leather Gloves", 1], ["Leather Greaves", 1], ["Elven Blade III", 1], ["Elven Longknife II", 1], ["Bow (Longbow)", 1], ["Arrow (Longbow) II", 20], ["Arrow (Bodkin)", 8], ["Quiver", 1], ["Potion of Shadow II (15)", 1], ["Second Wind III (20)", 1], ["Healing Draught III (5)", 1], ["Cat Senses II (15)", 1], ["Smoke Bomb I", 1], ["Healing Kit", 1], ["Waterskin (water)", 1], ["Dried meat (Portion)", 2], ["Gem Dust", 1], ["Pfennig", 20], ["Groschen", 20], ["Gulden", 5], ["Sapphire", 1], ["Amulet", 1], ["Forest Elf", 1]], "desc": "Tikka Naira, elven heroine of the deep woods, huntress and sword of her people. In the forest she is a legend and an ambush, and the legends of her are mostly true."}
];

(async () => {
  if (!game.user?.isGM) return ui.notifications.error("NPC import: must be run by a GM.");
  const BATCH = "midland-woodelves-1";
  const PARENT = "Midland NPCs";
  const PACKS = ["weapons", "armor", "gear", "gear-funny", "valuables", "currencies", "alchemy", "racial-traits"].map(n => `scarmark.${n}`);
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
