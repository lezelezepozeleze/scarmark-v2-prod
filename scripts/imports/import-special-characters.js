/**
 * Scarmark — Import: Midland NPCs, Special characters
 * ------------------------------------------------------------------
 * Creates 2 characters in the folder Special Characters: Janek Roh Kowalski (Polandian bogatyr, Hero NPC with a sabre, Combat about 80) and Dark Gnome (Creature, an evil goblin-like gnome).
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
 * somewhere). The background text goes to the Specialization field (Special Abilities for the creature form). Tokens are
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
  {"name": "Janek Roh Kowalski", "tier": "Hero", "folder": "Special Characters", "type": "npc", "race": "Human", "attrs": {"str": 18, "sta": 18, "dex": 14, "agl": 13, "wil": 15, "per": 12, "pre": 14, "int": 10, "spi": 9}, "skills": {"Vitality": 85, "Stealth": 32, "Close Combat": 80, "Unarmed Combat": 81, "Ranged Combat": 53, "Dodge": 51, "Initiative": 64, "Riding": 55, "Language - Other": 30}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Padded Cap", 1], ["Lamellar Helmet", 1], ["Mail Hood", 1], ["Padded Gambeson", 1], ["Mail Hauberk", 1], ["Lamellar Cuirass with a fauld", 1], ["Leather Gloves", 1], ["Leather Greaves", 1], ["Woolen Cloak", 1], ["Sabre IV", 1], ["Kite Shield", 1], ["Handaxe III", 1], ["Dagger", 1], ["Schnapz (9)", 2], ["Waterskin (booze)", 1], ["Trinket", 1], ["Signet Ring", 1], ["Purse", 1], ["Pfennig", 50], ["Groschen", 30], ["Gulden", 8]], "desc": "Janek Roh Kowalski, Polandian bogatyr and war hero, a giant of a man famous for the Polandian frontier wars. He fights with a sabre in lamellar and mail, drinks as hard as he fights, and the soldiers of three armies tell stories of him that are mostly true. Brave, proud and stubborn, he is far more dangerous in the line of battle than alone in a duel."},
  {"name": "Dark Gnome", "tier": "Creature I", "folder": "Special Characters", "type": "creature", "species": "Dark Gnome", "attrs": {"str": 6, "sta": 8, "dex": 13, "agl": 14, "wil": 10, "per": 12, "int": 12, "spi": 9}, "skills": {"Vitality": 44, "Stealth": 60, "Close Combat": 38, "Unarmed Combat": 39, "Ranged Combat": 37, "Dodge": 49, "Initiative": 40, "Alchemy": 45, "Lockpicking": 45}, "scale": 0.75, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Cloth Hood", 1], ["Leather Vest", 1], ["Dagger", 1], ["Crossbow (Small)", 1], ["Bolt (Small)", 10], ["Dartgun", 1], ["Dart", 6], ["Caltrops (5 fts)", 1], ["Smoke Bomb I", 1], ["Spider Venom", 1], ["Lockpick", 1], ["Pfennig", 6]], "desc": "", "special": "<p>Dark Gnome is the wicked cousin of the gnomes, a treacherous little goblin-like schemer who lives on traps, poison and ambushes. He is smaller and less strong than a goblin and far more cunning. He would rather poison you, trap you or shoot you in the back than fight fair, and he flees the moment the odds turn against him.</p><p><strong>Treacherous.</strong> He fights from cover, from the dark and with traps. Gnome blood: quick, small and clever with his hands. Darkvision 6 m.</p>"}
];

(async () => {
  if (!game.user?.isGM) return ui.notifications.error("NPC import: must be run by a GM.");
  const BATCH = "midland-special-1";
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
      system: n.type === "creature" ? { attributes, species: n.species, specialAbilities: n.special } : { attributes, race: n.race ?? "Human", specialization: n.desc },
      prototypeToken: { name: n.token ?? n.name, actorLink: false, disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL, texture: { scaleX: n.scale ?? 1, scaleY: n.scale ?? 1 } },
      flags: { scarmark: { npcBatch: BATCH, tier: n.tier } },
      items
    });
    made++;
  }

  if (missing.length) console.warn("NPC import | not found:", missing);
  ui.notifications[missing.length ? "warn" : "info"](
    `NPC import: ${made} actors created in "${PARENT}"` + (missing.length ? `, ${missing.length} items/skills not found (see console F12)` : "."));
})();
