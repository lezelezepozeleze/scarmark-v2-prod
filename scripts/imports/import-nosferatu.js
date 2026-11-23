/**
 * Scarmark — Import: Midland NPCs, Nosferatu
 * ------------------------------------------------------------------
 * Creates Nosferatu (Hero NPC, human form) and Nosferatu (Vampire Form) (Creature: the human profile plus STR +12, STA +12, DEX +6, AGL +6), in the folder Vampires.
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
  {"name": "Nosferatu", "tier": "Hero", "folder": "Vampires", "type": "npc", "race": "Vampire", "attrs": {"str": 17, "sta": 16, "dex": 17, "agl": 17, "wil": 18, "per": 16, "pre": 16, "int": 16, "spi": 14}, "skills": {"Vitality": 84, "Stealth": 82, "Close Combat": 94, "Unarmed Combat": 80, "Ranged Combat": 65, "Dodge": 85, "Initiative": 93, "Language - Other": 85, "Physician": 55}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Fancy Clothes", 1], ["Woolen Cloak", 1], ["Padded Doublet", 1], ["Leather Gloves", 1], ["Sword IV", 1], ["Dagger", 1], ["Vial with Blood", 3], ["Black Candle", 2], ["Ancient Tome", 1], ["Book", 1], ["Wine, fine (bottle)", 1], ["Purse", 1], ["Gulden", 40], ["Groschen", 60], ["Sapphire", 2], ["Jewelry", 2], ["Signet Ring", 1], ["Amulet", 1]], "desc": "Nosferatu in his human form, an ancient vampire Primal: a gaunt, stooped figure with sunken cheeks, long arms held close to his body and thin, withered lips that hide the fangs. His voice is deep and his speech exact. He remembers names and promises, bargains patiently, is cruel, and in the end his decisions are always made by thirst for blood. Vampirism (STR +2, AGL +2, DEX +2) is already included in his attributes. <b>Vampire Form:</b> the transformation costs 1 action and needs no roll; use the actor <i>Nosferatu (Vampire Form)</i> (human profile plus STR +12, STA +12, DEX +6, AGL +6, return removes them). <p><strong>Regeneration.</strong> At the end of every round, reduce each of his wounds by 1 WL. Changing form does not heal further. Complete closing of one wound per round is the Primal's privilege.</p>"},
  {"name": "Nosferatu (Vampire Form)", "tier": "Hero", "folder": "Vampires", "type": "creature", "species": "Nosferatu", "attrs": {"str": 29, "sta": 28, "dex": 23, "agl": 23, "wil": 18, "per": 16, "int": 16, "spi": 14}, "skills": {"Vitality": 124, "Stealth": 57, "Close Combat": 88, "Unarmed Combat": 110, "Ranged Combat": 28, "Dodge": 92, "Initiative": 89}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Claws IV", 1], ["Bite III", 1]], "desc": "", "special": "<p><strong>Vampire Form.</strong> The first sign of the change is that Nosferatu stops stooping. He straightens bone by bone, and only then do you see how tall he is. His chest swells, his neck thickens and his forearms grow so heavy that he carries part of his weight on his knuckles. His fingers end in broad hooked claws, his jaw juts out and the fangs show to the gums. In this shape he still speaks as clearly as a moment before, and he can lift a spell with one hand and carry on a conversation exactly where you left off.</p><p>Attributes are the human profile of Nosferatu (which already includes Vampirism) plus STR +12, STA +12, DEX +6, AGL +6. The transformation costs 1 action and needs no roll; the bonuses are temporary modifiers, removed on return to human form.</p><p><strong>Regeneration.</strong> At the end of every round, reduce each of his wounds by 1 WL. Changing form does not heal further. Complete closing of one wound per round is the Primal's privilege.</p>"}
];

(async () => {
  if (!game.user?.isGM) return ui.notifications.error("NPC import: must be run by a GM.");
  const BATCH = "midland-nosferatu-1";
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
