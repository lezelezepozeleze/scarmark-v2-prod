/**
 * Scarmark — Import: Midland NPCs, batch 3 (Scums)
 * ------------------------------------------------------------------
 * Creates 12 NPCs in the folder Scums: Drunkard, Thug, Thief, Brigand I, Brigand II (Melee) and (Crossbow), Brigand Boss (tokens of the Brigands are named Suspicious man), Thulenweiss I, II and III, Smuggler and Gambler.
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
  {"name": "Drunkard", "tier": "Poor", "folder": "Scums", "attrs": {"str": 12, "sta": 12, "dex": 9, "agl": 8, "wil": 7, "per": 8, "pre": 6, "int": 7, "spi": 6}, "skills": {"Vitality": 52, "Stealth": 20, "Close Combat": 30, "Unarmed Combat": 48, "Ranged Combat": 20, "Dodge": 20, "Initiative": 22}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Bottle", 1], ["Waterskin (booze)", 1], ["Booze (10)", 1], ["Pfennig", 3]], "desc": "Classic tavern drunkard looking for trouble. Slow on his feet and sloppy with a blade, but a brawl is the one thing he still does well."},
  {"name": "Thug", "tier": "Common", "folder": "Scums", "attrs": {"str": 14, "sta": 13, "dex": 12, "agl": 12, "wil": 10, "per": 10, "pre": 8, "int": 8, "spi": 7}, "skills": {"Vitality": 60, "Stealth": 32, "Close Combat": 45, "Unarmed Combat": 61, "Ranged Combat": 36, "Dodge": 36, "Initiative": 32, "Pickpocketing": 36}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Leather Cap", 1], ["Leather Vest", 1], ["Club II", 1], ["Knife", 1], ["Knuckle", 1], ["Small Pouch", 1], ["Purse", 1], ["Pfennig", 20]], "desc": "Notorious brawler and street thief who picks pockets in the crowd and settles the rest with his fists."},
  {"name": "Thief", "tier": "Common", "folder": "Scums", "attrs": {"str": 10, "sta": 11, "dex": 14, "agl": 14, "wil": 11, "per": 12, "pre": 10, "int": 11, "spi": 8}, "skills": {"Vitality": 55, "Stealth": 52, "Close Combat": 51, "Unarmed Combat": 61, "Ranged Combat": 36, "Dodge": 42, "Initiative": 36, "Pickpocketing": 59, "Lockpicking": 47}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Cloth Hood", 1], ["Leather Vest", 1], ["Leather Gloves", 1], ["Dagger", 1], ["Knife", 1], ["Knife (Throwing)", 2], ["Lockpick", 2], ["Lockpicking kit", 1], ["Rope, hemp (50 ft)", 1], ["Grappling hook", 1], ["Small Pouch", 1], ["Purse", 1], ["Pfennig", 25], ["Groschen", 2]], "desc": "Skilled burglar and cutpurse who works the shadows of town. Quick, quiet and sure of his hands."},
  {"name": "Brigand I", "tier": "Common", "folder": "Scums", "attrs": {"str": 14, "sta": 13, "dex": 12, "agl": 11, "wil": 10, "per": 11, "pre": 8, "int": 8, "spi": 8}, "skills": {"Vitality": 60, "Stealth": 32, "Close Combat": 51, "Unarmed Combat": 57, "Ranged Combat": 37, "Dodge": 33, "Initiative": 31}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Quilted Cap", 1], ["Leather Jacket", 1], ["Leather Gloves", 1], ["Handaxe II", 1], ["Round Shield", 1], ["Knife", 1], ["Waterskin (water)", 1], ["Bread (Portion)", 1], ["Purse", 1], ["Pfennig", 15]], "desc": "Robber of the roads and woods. Poorly armed, hungry and willing to take a purse from anyone who looks weaker.", "token": "Suspicious man"},
  {"name": "Brigand II (Melee)", "tier": "Veteran", "folder": "Scums", "attrs": {"str": 15, "sta": 14, "dex": 12, "agl": 11, "wil": 11, "per": 11, "pre": 9, "int": 8, "spi": 8}, "skills": {"Vitality": 65, "Stealth": 33, "Close Combat": 68, "Unarmed Combat": 56, "Ranged Combat": 51, "Dodge": 44, "Initiative": 44}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Padded Cap", 1], ["Mail Hood", 1], ["Quilted Gambeson", 1], ["Leather Gloves", 1], ["Leather Greaves", 1], ["Falchion II", 1], ["Heater Shield", 1], ["Dagger", 1], ["Waterskin (water)", 1], ["Dried meat (Portion)", 1], ["Purse", 1], ["Pfennig", 30], ["Groschen", 3]], "desc": "Seasoned highwayman, often a deserter, who knows how to fight in a gang. Armed and armoured well enough to worry a traveller.", "token": "Suspicious man"},
  {"name": "Brigand II (Crossbow)", "tier": "Veteran", "folder": "Scums", "attrs": {"str": 13, "sta": 13, "dex": 13, "agl": 12, "wil": 11, "per": 13, "pre": 9, "int": 8, "spi": 8}, "skills": {"Vitality": 62, "Stealth": 36, "Close Combat": 53, "Unarmed Combat": 51, "Ranged Combat": 63, "Dodge": 48, "Initiative": 46}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Padded Cap", 1], ["Mail Hood", 1], ["Quilted Gambeson", 1], ["Leather Gloves", 1], ["Leather Greaves", 1], ["Crossbow", 1], ["Bolt (Medium) I", 20], ["Bolt Case", 1], ["Falchion I", 1], ["Dagger", 1], ["Waterskin (water)", 1], ["Dried meat (Portion)", 1], ["Purse", 1], ["Pfennig", 30], ["Groschen", 3]], "desc": "Highwayman who hangs back in the brush with a crossbow and picks his target before the gang strikes.", "token": "Suspicious man"},
  {"name": "Brigand Boss", "tier": "Elite", "folder": "Scums", "attrs": {"str": 16, "sta": 15, "dex": 14, "agl": 13, "wil": 13, "per": 12, "pre": 12, "int": 10, "spi": 9}, "skills": {"Vitality": 72, "Stealth": 45, "Close Combat": 85, "Unarmed Combat": 65, "Ranged Combat": 70, "Dodge": 59, "Initiative": 59}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Padded Cap", 1], ["Plate Helmet Visor", 1], ["Mail Aventail (for helmet only)", 1], ["Padded Gambeson", 1], ["Brigandine Cuirass with a fauld", 1], ["Mail Voinders (Full Arms)", 1], ["Leather Gloves", 1], ["Mail Leggings", 1], ["Sword II", 1], ["Mace III", 1], ["Heater Shield", 1], ["Dagger", 1], ["Wine, fine (bottle)", 1], ["Purse", 1], ["Pfennig", 80], ["Groschen", 25], ["Gulden", 4], ["Signet Ring", 1], ["Jewelry", 1]], "desc": "Leader of a robber band, well armed and equipped with the best of what his gang has taken. He rules by strength and by a share of the loot.", "token": "Suspicious man"},
  {"name": "Thulenweiss I", "tier": "Elite", "folder": "Scums", "attrs": {"str": 11, "sta": 12, "dex": 15, "agl": 16, "wil": 13, "per": 13, "pre": 11, "int": 12, "spi": 9}, "skills": {"Vitality": 62, "Stealth": 64, "Close Combat": 76, "Unarmed Combat": 63, "Ranged Combat": 65, "Dodge": 80, "Initiative": 63, "Pickpocketing": 73, "Lockpicking": 70}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Cloth Hood", 1], ["Leather Jacket", 1], ["Leather Gloves", 1], ["Short Sword II", 1], ["Dagger", 1], ["Knife (Throwing)", 3], ["Lockpicking kit", 1], ["Fine Lockpick", 1], ["Garrote", 1], ["Grappling hook", 1], ["Rope, hemp (50 ft)", 1], ["Potion of Shadow I (10)", 1], ["Smoke Bomb I", 1], ["Purse", 1], ["Groschen", 10], ["Gulden", 2]], "desc": "Member of the Thulenweiss, the elite thieves guild. A junior operative who already outclasses any common thief."},
  {"name": "Thulenweiss II", "tier": "Master", "folder": "Scums", "attrs": {"str": 12, "sta": 13, "dex": 16, "agl": 17, "wil": 14, "per": 14, "pre": 12, "int": 13, "spi": 10}, "skills": {"Vitality": 67, "Stealth": 76, "Close Combat": 80, "Unarmed Combat": 75, "Ranged Combat": 74, "Dodge": 85, "Initiative": 75, "Pickpocketing": 76, "Lockpicking": 71}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Cloth Hood", 1], ["Leather Coat", 1], ["Leather Gloves", 1], ["Estoc II", 1], ["Dagger", 1], ["Knife (Throwing)", 3], ["Crossbow (Small)", 1], ["Bolt (Small)", 10], ["Fine Lockpick", 1], ["Skeleton Key", 1], ["Garrote", 1], ["Poison Ring", 1], ["Spider Venom", 1], ["Potion of Shadow II (15)", 1], ["Cat Senses II (15)", 1], ["Deft Hands II (15)", 1], ["Smoke Bomb I", 2], ["Grappling hook", 1], ["Purse", 1], ["Groschen", 20], ["Gulden", 5]], "desc": "Experienced operative of the Thulenweiss. He plans a job for weeks, executes it in minutes and leaves nothing behind but a missing purse or a cold body."},
  {"name": "Thulenweiss III", "tier": "Hero", "folder": "Scums", "attrs": {"str": 13, "sta": 14, "dex": 18, "agl": 18, "wil": 15, "per": 15, "pre": 13, "int": 14, "spi": 10}, "skills": {"Vitality": 72, "Stealth": 93, "Close Combat": 91, "Unarmed Combat": 77, "Ranged Combat": 90, "Dodge": 99, "Initiative": 88, "Pickpocketing": 87, "Lockpicking": 81, "Physician": 55}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Cloth Hood", 1], ["Mail Habergeon", 1], ["Leather Coat", 1], ["Leather Gloves", 1], ["Estoc III", 1], ["Dagger", 1], ["Dagger (Throwing)", 3], ["Crossbow (Small)", 1], ["Bolt (Small)", 10], ["Bolt (Bodkin)", 5], ["Garrote", 1], ["Poison Ring", 1], ["Fine Lockpick", 1], ["Skeleton Key", 1], ["Grappling hook", 1], ["Potion of Shadow III (20)", 1], ["Nimblefinger III (15)", 1], ["Deft Hands III (20)", 1], ["Cat Senses II (15)", 1], ["Smoke Bomb I", 2], ["Gravekiss Extract (75)", 1], ["Ashen Draught (40)", 1], ["Dreadmist Oil (30)", 1], ["Spider Venom", 1], ["Purse", 1], ["Groschen", 30], ["Gulden", 12], ["Sapphire", 1], ["Signet Ring", 1], ["Fancy Clothes", 1, 0], ["Disguise Kit", 1, 0], ["Forgery Kit", 1, 0]], "desc": "A true master of the guild, killer of nobles and kings. Nobody has ever seen his face twice, and nobody who has is left to say so."},
  {"name": "Smuggler", "tier": "Common", "folder": "Scums", "attrs": {"str": 12, "sta": 13, "dex": 11, "agl": 11, "wil": 11, "per": 12, "pre": 12, "int": 11, "spi": 8}, "skills": {"Vitality": 62, "Stealth": 41, "Close Combat": 36, "Unarmed Combat": 46, "Ranged Combat": 35, "Dodge": 33, "Initiative": 33, "Language - Other": 35}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Woolen Cloak", 1], ["Leather Jacket", 1], ["Knife", 1], ["Club II", 1], ["Crossbow (Small)", 1], ["Bolt (Small)", 10], ["Backpack", 1], ["Sack", 3], ["Small Chest", 1], ["Lock", 1], ["Lockpick", 1], ["Scales & Weights", 1], ["Brandy (9)", 2], ["Tobacco (common)", 3], ["Pipe", 1], ["Weed", 1], ["Opium", 1], ["Purse", 1], ["Pfennig", 40], ["Groschen", 8], ["Gulden", 1]], "desc": "Fence and smuggler of everything the law frowns upon, from brandy and tobacco to stolen goods and worse. Knows every back road and every toll keeper's price."},
  {"name": "Gambler", "tier": "Common", "folder": "Scums", "attrs": {"str": 9, "sta": 10, "dex": 13, "agl": 12, "wil": 12, "per": 13, "pre": 14, "int": 14, "spi": 9}, "skills": {"Vitality": 54, "Stealth": 37, "Close Combat": 33, "Unarmed Combat": 41, "Ranged Combat": 35, "Dodge": 36, "Initiative": 36, "Pickpocketing": 35, "Language - Other": 40}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Cloth Cap", 1], ["Leather Gloves", 1], ["Dagger", 1], ["Knife", 1], ["Dice Set", 1], ["Loaded Dice", 1], ["Playing Cards", 1], ["Marked Cards", 1], ["Wine, common (bottle)", 1], ["Purse", 1], ["Pfennig", 60], ["Groschen", 25], ["Gulden", 5]], "desc": "Professional gambler who lives off dice and cards. Honest play is for his marks, and he has a knife ready in case one of them notices."}
];

(async () => {
  if (!game.user?.isGM) return ui.notifications.error("NPC import: must be run by a GM.");
  const BATCH = "midland-scums-1";
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
