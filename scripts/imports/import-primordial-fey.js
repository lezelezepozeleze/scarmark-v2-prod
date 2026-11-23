/**
 * Scarmark — Import: Midland NPCs, Primordial Fey (Light)
 * ------------------------------------------------------------------
 * Creates 1 NPC (Hero) in the folder Fey: Primordial Fey (Light), a primordial light Fey above elven values, with her own Fey Arrows (Bodkin) (Impact 10, 9, 8, 7 by range band; also created as a world Item in the Item folder Fey Items).
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
  {"name": "Primordial Fey (Light)", "tier": "Hero", "folder": "Fey", "type": "npc", "race": "Fey", "attrs": {"str": 16, "sta": 18, "dex": 20, "agl": 22, "wil": 22, "per": 22, "pre": 22, "int": 20, "spi": 24}, "skills": {"Vitality": 97, "Stealth": 106, "Close Combat": 98, "Unarmed Combat": 64, "Ranged Combat": 107, "Dodge": 109, "Initiative": 107, "Arcane": 100, "Language - Other": 100, "Physician": 70, "Animal Handling": 80}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Fancy Dress", 1], ["White Veil", 1], ["Cloth Cloak", 1], ["Bow (Longbow)", 1], ["Fey Arrows (Bodkin)", 20], ["Quiver", 1], ["Elven Longknife II", 1], ["Singing Stone (Elven)", 1], ["Moonstone", 2], ["Astral Dust", 2], ["Crystal Shard", 1], ["Bluish Crystal", 1], ["Gem Dust", 2], ["Sapphire", 3], ["Amulet", 1], ["Jewelry", 2]], "desc": "Primordial Fey of the Light, one of the oldest beings of the Fey, older than the elves and than any kingdom of men. She is tall, slender and radiant, and she moves without a sound. Her gaze is a judgment and her patience is a weapon. She does not hurry; she has the time of the world. Her bow never misses by accident, and the arrows she shoots are made of the same light as her. She needs no armour, because she is seldom hit."}
];

// Items made for this import (not in a compendium). They are also created once as world Items (folder "Fey Items") so you can move them to a compendium.
const CUSTOM = {
 "Fey Arrows (Bodkin)": {
  "name": "Fey Arrows (Bodkin)",
  "type": "missile",
  "img": "systems/scarmark/icons/gear/slicing-arrow-lorc.svg",
  "system": {
   "quantity": 1,
   "weight": 0.05,
   "value": 600,
   "quality": 9,
   "velocity": "high",
   "aspect": "piercing",
   "associatedSkill": "ranged",
   "range": {
    "short": 5,
    "medium": 10,
    "long": 19,
    "extreme": 51
   },
   "impact": {
    "short": 10,
    "medium": 9,
    "long": 8,
    "extreme": 7
   },
   "notes": "AP: armor P halved. Fey light arrow, Impact 10 at short range.",
   "carried": true,
   "container": ""
  }
 }
};

(async () => {
  if (!game.user?.isGM) return ui.notifications.error("NPC import: must be run by a GM.");
  const BATCH = "midland-fey-1";
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
