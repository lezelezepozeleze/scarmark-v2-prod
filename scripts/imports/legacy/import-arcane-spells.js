/**
 * Scarmark - One-shot import: Arcane spells -> "scarmark.arcane" compendium
 * ------------------------------------------------------------------------
 * A single, self-contained action (English). Paste into a Foundry "Script"
 * macro and Execute once as GM. Not wired into the system, not bound to any
 * spreadsheet - the 123 spells below are embedded verbatim.
 * Built 2026-09-18 from the Scarmark_Arcane spell tables (Arcane .. Fey).
 *
 * HOW TO USE
 *   1. The Arcane compendium must exist: it is declared in system.json, so
 *      reload the world (F5) once and Foundry creates "scarmark.arcane".
 *   2. As GM: Macros -> new "Script" macro -> paste this whole file -> Execute.
 *   3. Safe to re-run: the pack is cleared and rebuilt, folders reused by name,
 *      ids are stable.
 */
(async () => {
  if ( !game.user?.isGM ) return ui.notifications.error("Arcane import: must be run by a GM.");

  const PACK = "scarmark.arcane";
  const pack = game.packs.get(PACK);
  if ( !pack ) return ui.notifications.error(
    `Arcane import: compendium "${PACK}" not found. Add it to system.json and reload the world first.`);

  const SCHOOLS = ["Arcane Magic", "Elemental Magic", "Creation Magic", "Illusion Magic", "Enthropic Magic", "Blood Magic", "Fey Magic"];
  const SPELLS = [
  {
    "_id": "2e4ys40D5gan58LR",
    "name": "1 Attune (Runeless)",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/magic-palm-lorc.svg",
    "system": {
      "magicType": "Arcane Magic",
      "level": 1,
      "notes": "",
      "description": "<p>Helps attune an artifact to a given person.</p><ul><li><strong>Critical Success:</strong> Attunement is instant.</li><li><strong>Success:</strong> Substantially aids the attunement (depending on the artifact type).</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> No</p>"
    }
  },
  {
    "_id": "bdN6OeM2qMXN5Yb3",
    "name": "1 Charge (Runeless)",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/magic-palm-lorc.svg",
    "system": {
      "magicType": "Arcane Magic",
      "level": 1,
      "notes": "",
      "description": "<p>Charges an artifact/rune.</p><ul><li><strong>Critical Success:</strong> Fully charges several runes/artifacts.</li><li><strong>Success:</strong> Fully charges a rune/artifact.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> No</p>"
    }
  },
  {
    "_id": "KnO3HR517O0m2MMF",
    "name": "1 Detect Magic (Runeless)",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/magic-palm-lorc.svg",
    "system": {
      "magicType": "Arcane Magic",
      "level": 1,
      "notes": "",
      "description": "<p>Detects magic or a spell stored in an artifact or rune.</p><ul><li><strong>Critical Success:</strong> Reveals its presence, its school, and whether it has a soul and raw power (Level).</li><li><strong>Success:</strong> Reveals the presence of magic or a spell in an object or rune.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> No</p>"
    }
  },
  {
    "_id": "TtlmaXFWu0uljUYA",
    "name": "1 Illumination",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/magic-palm-lorc.svg",
    "system": {
      "magicType": "Arcane Magic",
      "level": 1,
      "notes": "",
      "description": "<p>Lights up a room or creates an orb of light above the mage; also weakens dark and undead beings and any creature sensitive to light.</p><ul><li><strong>Critical Success:</strong> Shines until dismissed by the caster.</li><li><strong>Success:</strong> Shines for 30 minutes.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound &middot; <strong>Recipe:</strong> Rune + Illumination scroll + Crystal Shard</p>"
    }
  },
  {
    "_id": "R027xBMTCWpnvHKD",
    "name": "1 Telekinesis",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/magic-palm-lorc.svg",
    "system": {
      "magicType": "Arcane Magic",
      "level": 1,
      "notes": "",
      "description": "<p>Pulls inanimate objects toward the caster by force of mind (ones the caster could physically carry).</p><ul><li><strong>Critical Success:</strong> The caster finds they can move a heavier object.</li><li><strong>Success:</strong> Pulls or moves a small inanimate object.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound &middot; <strong>Recipe:</strong> Rune + Telekinesis scroll + Lodestone Shard</p>"
    }
  },
  {
    "_id": "JOWjRDLv7EDvY7zN",
    "name": "1 Arcane Bolt I",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/magic-palm-lorc.svg",
    "system": {
      "magicType": "Arcane Magic",
      "level": 1,
      "notes": "",
      "description": "<p>A strike by force of mind.</p><ul><li><strong>Critical Success:</strong> Extra damage.</li><li><strong>Success:</strong> Fires an Arcane Bolt I.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound (Missile) &middot; <strong>Recipe:</strong> Rune + Arcane Bolt I scroll + Lead Weight</p>"
    }
  },
  {
    "_id": "VEoxhUmyJiMz0Eja",
    "name": "2 Dispel (Runeless)",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/magic-palm-lorc.svg",
    "system": {
      "magicType": "Arcane Magic",
      "level": 2,
      "notes": "",
      "description": "<p>Cancels the effect of one spell; also works as a counterspell.</p><ul><li><strong>Critical Success:</strong> Puts enemy casters out of action for 1 round.</li><li><strong>Success:</strong> Cancels one effect or interrupts a spell being cast.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> No</p>"
    }
  },
  {
    "_id": "UeD2YPZFCO0nHHSf",
    "name": "2 Telekinesis II",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/magic-palm-lorc.svg",
    "system": {
      "magicType": "Arcane Magic",
      "level": 2,
      "notes": "",
      "description": "<p>Pulls inanimate objects toward the caster (up to the caster's carrying capacity); they can be used as an improvised weapon.</p><ul><li><strong>Critical Success:</strong> The caster finds they can move a living being.</li><li><strong>Success:</strong> Pulls or moves a heavy inanimate object within the caster's capacity, usable as an improvised blunt weapon.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Art./Nat.) &middot; <strong>Recipe:</strong> Telekinesis I Rune + Mercury + Wraithstone (Art./Nat.)</p>"
    }
  },
  {
    "_id": "5WRqq2sgQVrF3rNa",
    "name": "2 Empower I",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/magic-palm-lorc.svg",
    "system": {
      "magicType": "Arcane Magic",
      "level": 2,
      "notes": "",
      "description": "<p>Strengthens the effect of the next spell by +15.</p><ul><li><strong>Critical Success:</strong> Next spell +15 and free of Fatigue; lasts 1d3 rounds.</li><li><strong>Success:</strong> Next spell +15 and free of Fatigue.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound &middot; <strong>Recipe:</strong> Rune + Empower I scroll + Gem Dust</p>"
    }
  },
  {
    "_id": "Ec7xUaiEHluVRU1c",
    "name": "2 Arcane Bolt II",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/magic-palm-lorc.svg",
    "system": {
      "magicType": "Arcane Magic",
      "level": 2,
      "notes": "",
      "description": "<p>A strike by force of mind.</p><ul><li><strong>Critical Success:</strong> Extra damage.</li><li><strong>Success:</strong> Fires an Arcane Bolt II.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound (Missile) &middot; <strong>Recipe:</strong> Arcane Bolt I Rune + Iron Filings</p>"
    }
  },
  {
    "_id": "UZ8BVnoaVDdnRsQM",
    "name": "2 Arcane Shield",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/magic-palm-lorc.svg",
    "system": {
      "magicType": "Arcane Magic",
      "level": 2,
      "notes": "",
      "description": "<p>A reaction to an attack: acts as a shield and fully absorbs the attack against the caster.</p><ul><li><strong>Critical Success:</strong> Lasts 1d3 rounds.</li><li><strong>Success:</strong> Absorbs all damage from 1 attack.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound &middot; <strong>Recipe:</strong> Rune + Arcane Shield scroll + Steel Shard</p>"
    }
  },
  {
    "_id": "pNnLSgs0DZ9fCQ0A",
    "name": "2 Arcane Armor I",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/magic-palm-lorc.svg",
    "system": {
      "magicType": "Arcane Magic",
      "level": 2,
      "notes": "",
      "description": "<p>Gives the caster or a target magical armor for 1d3 rounds, granting 3B/3P/3E/3F protection.</p><ul><li><strong>Critical Success:</strong> The armor lasts the whole fight.</li><li><strong>Success:</strong> The armor lasts 1d3 rounds; protection 3B/3P/3E/3F.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound &middot; <strong>Recipe:</strong> Arcane Shield Rune + Leather Armor Scrap</p>"
    }
  },
  {
    "_id": "mjnZqYCevUEosVvS",
    "name": "2 Comprehend (Runeless)",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/magic-palm-lorc.svg",
    "system": {
      "magicType": "Arcane Magic",
      "level": 2,
      "notes": "",
      "description": "<p>Understand any language (a text or a short conversation).</p><ul><li><strong>Critical Success:</strong> Full understanding; can hold a conversation or write.</li><li><strong>Success:</strong> Understands a text or a short conversation.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> No</p>"
    }
  },
  {
    "_id": "qgIrqjl1GNczTYG7",
    "name": "2 Use Teleport (Runeless)",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/magic-palm-lorc.svg",
    "system": {
      "magicType": "Arcane Magic",
      "level": 2,
      "notes": "",
      "description": "<p>Uses a teleport device or a teleport rune. You cannot teleport freely anywhere; the teleport is always bound to a device or rune, and the spell merely triggers the effect.</p><ul><li><strong>Critical Success:</strong> Does a quick scout before the transfer, surveys the surroundings, and lands unnoticed.</li><li><strong>Success:</strong> Transfers the caster and a group in physical contact.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> No</p>"
    }
  },
  {
    "_id": "o9gX3c4s3CeYSJii",
    "name": "3 Telekinesis III",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/magic-palm-lorc.svg",
    "system": {
      "magicType": "Arcane Magic",
      "level": 3,
      "notes": "",
      "description": "<p>Also affects living beings.</p><ul><li><strong>Critical Success:</strong> The caster can crush a living being.</li><li><strong>Success:</strong> Also affects a living being, dealing blunt damage by hurling it.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Nat.) &middot; <strong>Recipe:</strong> Telekinesis II Rune + Vial with Blood (living creature) + Wraithstone (Nat.)</p>"
    }
  },
  {
    "_id": "1LplBIgDz5FTbtw1",
    "name": "3 Artificial Soul (Runeless)",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/magic-palm-lorc.svg",
    "system": {
      "magicType": "Arcane Magic",
      "level": 3,
      "notes": "",
      "description": "<p>Creates an artificial soul for a Wraithstone.</p><ul><li><strong>Critical Success:</strong> Ego = 12 (maximum).</li><li><strong>Success:</strong> Ego = 6 + 1d6.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> No</p>"
    }
  },
  {
    "_id": "Xcay9nMr5SeR8yRK",
    "name": "3 Arcane Bolt III",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/magic-palm-lorc.svg",
    "system": {
      "magicType": "Arcane Magic",
      "level": 3,
      "notes": "",
      "description": "<p>A strike by force of mind.</p><ul><li><strong>Critical Success:</strong> Extra damage.</li><li><strong>Success:</strong> Fires an Arcane Bolt III.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound (Missile) &middot; <strong>Recipe:</strong> Arcane Bolt II Rune + Steel Point + Wraithstone (Art.)</p>"
    }
  },
  {
    "_id": "zOicjStgPdOijbzD",
    "name": "3 Arcane Armor II",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/magic-palm-lorc.svg",
    "system": {
      "magicType": "Arcane Magic",
      "level": 3,
      "notes": "",
      "description": "<p>Gives the caster or a target magical armor for 3 rounds, granting 5B/5P/5E/5F protection.</p><ul><li><strong>Critical Success:</strong> The armor lasts the whole fight.</li><li><strong>Success:</strong> The armor lasts 3 rounds; protection 5B/5P/5E/5F.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Art.) &middot; <strong>Recipe:</strong> Arcane Armor I Rune + Steel Armor Scrap + Wraithstone (Art.)</p>"
    }
  },
  {
    "_id": "B1b6D6X91phvNjro",
    "name": "3 Cancel the Curse/Hex (Runeless)",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/magic-palm-lorc.svg",
    "system": {
      "magicType": "Arcane Magic",
      "level": 3,
      "notes": "",
      "description": "<p>Cancels the effect of a Curse/Hex.</p><ul><li><strong>Critical Success:</strong> Instantly cancels the curse on everyone in the scene.</li><li><strong>Success:</strong> Instantly cancels the curse on the target.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> No</p>"
    }
  },
  {
    "_id": "L7IEIXJtOCTi4vY1",
    "name": "4 Empower II",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/magic-palm-lorc.svg",
    "system": {
      "magicType": "Arcane Magic",
      "level": 4,
      "notes": "",
      "description": "<p>Strengthens the effect of the next spell by +30.</p><ul><li><strong>Critical Success:</strong> Next spell +30 and free of Fatigue; lasts 1d3 rounds.</li><li><strong>Success:</strong> Next spell +30 and free of Fatigue.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Art.) &middot; <strong>Recipe:</strong> Empower I Rune + Gold + Wraithstone (Art.)</p>"
    }
  },
  {
    "_id": "hJJkELi0AI5TW32c",
    "name": "var. Inscribe (Runeless)",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/magic-palm-lorc.svg",
    "system": {
      "magicType": "Arcane Magic",
      "level": 1,
      "notes": "",
      "description": "<p>Creates a rune or a magic scroll; the mage must demonstrably know the spell.</p><ul><li><strong>Critical Success:</strong> The rune/scroll is created; +1 extra charge or a variant one tier stronger.</li><li><strong>Success:</strong> The rune or scroll is created per the recipe.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> No</p>"
    }
  },
  {
    "_id": "v8vVbXB68ez4RgwL",
    "name": "0 Pyromancy (Runeless)",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/fire-ray-lorc.svg",
    "system": {
      "magicType": "Elemental Magic",
      "level": 1,
      "notes": "Opening Spell",
      "description": "<p>A touch sets something on fire (if the target would realistically ignite) or causes a light burn.</p><ul><li><strong>Critical Success:</strong> Sets the target on fire (Burning); the flame holds for 1d3 rounds.</li><li><strong>Success:</strong> A burn dealing 5 fire dmg on touch; easily flammable things catch fire.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> No</p>"
    }
  },
  {
    "_id": "LgV4w5nCHNoAFaDs",
    "name": "1 Firebolt I",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/fire-ray-lorc.svg",
    "system": {
      "magicType": "Elemental Magic",
      "level": 1,
      "notes": "",
      "description": "<p>A fiery projectile.</p><ul><li><strong>Critical Success:</strong> Extra damage.</li><li><strong>Success:</strong> Fires a Firebolt.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound (Missile) &middot; <strong>Recipe:</strong> Rune + Firebolt I scroll + Sulfur</p>"
    }
  },
  {
    "_id": "N1MtDahpYXCkHwJt",
    "name": "1 Frostbite I",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/fire-ray-lorc.svg",
    "system": {
      "magicType": "Elemental Magic",
      "level": 1,
      "notes": "",
      "description": "<p>A freezing projectile.</p><ul><li><strong>Critical Success:</strong> The target freezes for 1 round and loses its action.</li><li><strong>Success:</strong> Fires a Frostbite.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound (Missile) &middot; <strong>Recipe:</strong> Rune + Frostbite I scroll + Salt</p>"
    }
  },
  {
    "_id": "FPVthYPbQOXuACgH",
    "name": "1 Lightning Bolt I",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/fire-ray-lorc.svg",
    "system": {
      "magicType": "Elemental Magic",
      "level": 1,
      "notes": "",
      "description": "<p>A lightning strike; targets wearing mostly metal armor may be Stunned by the hit.</p><ul><li><strong>Critical Success:</strong> Extra damage.</li><li><strong>Success:</strong> Fires a Lightning Bolt.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound (Missile) &middot; <strong>Recipe:</strong> Rune + Lightning Bolt I scroll + Copper</p>"
    }
  },
  {
    "_id": "Ely1qHvXDTPEYqNN",
    "name": "1 Stone Fist I",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/fire-ray-lorc.svg",
    "system": {
      "magicType": "Elemental Magic",
      "level": 1,
      "notes": "",
      "description": "<p>A stone fist strikes a target a short distance from the caster.</p><ul><li><strong>Critical Success:</strong> Fires a Stone Fist; the target takes a Fumble and Stumble test.</li><li><strong>Success:</strong> Fires a Stone Fist.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound (Missile) &middot; <strong>Recipe:</strong> Rune + Stone Fist I scroll + Pebble</p>"
    }
  },
  {
    "_id": "nLCkxQY7MFrjQg0k",
    "name": "2 Firebolt II",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/fire-ray-lorc.svg",
    "system": {
      "magicType": "Elemental Magic",
      "level": 2,
      "notes": "",
      "description": "<p>A fiery projectile.</p><ul><li><strong>Critical Success:</strong> Extra damage.</li><li><strong>Success:</strong> Fires a Firebolt; may cause panic.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound (Missile) &middot; <strong>Recipe:</strong> Firebolt I Rune + Charcoal</p>"
    }
  },
  {
    "_id": "QORXlV9aN5qICmoM",
    "name": "2 Frostbite II",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/fire-ray-lorc.svg",
    "system": {
      "magicType": "Elemental Magic",
      "level": 2,
      "notes": "",
      "description": "<p>A freezing projectile.</p><ul><li><strong>Critical Success:</strong> The target freezes for 1 round and loses its action and reaction.</li><li><strong>Success:</strong> Fires a Frostbite; a hit target loses its action and can only react.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound (Missile) &middot; <strong>Recipe:</strong> Frostbite I Rune + Bluish Crystal</p>"
    }
  },
  {
    "_id": "t4RuqKgomB9W7MKb",
    "name": "2 Lightning Bolt II",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/fire-ray-lorc.svg",
    "system": {
      "magicType": "Elemental Magic",
      "level": 2,
      "notes": "",
      "description": "<p>A stronger lightning strike; targets wearing mostly metal armor may be Stunned by the hit.</p><ul><li><strong>Critical Success:</strong> Extra damage.</li><li><strong>Success:</strong> Fires a Lightning Bolt.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound (Missile) &middot; <strong>Recipe:</strong> Lightning Bolt I Rune + Amber</p>"
    }
  },
  {
    "_id": "U0YAp9dcXLeuU09v",
    "name": "2 Stone Fist II",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/fire-ray-lorc.svg",
    "system": {
      "magicType": "Elemental Magic",
      "level": 2,
      "notes": "",
      "description": "<p>A powerful stone fist strikes a target a short distance from the caster.</p><ul><li><strong>Critical Success:</strong> Fires a Stone Fist; the target is knocked down and disarmed.</li><li><strong>Success:</strong> Fires a Stone Fist; the target takes a Fumble and Stumble test.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound (Missile) &middot; <strong>Recipe:</strong> Stone Fist I Rune + Granite Chunk</p>"
    }
  },
  {
    "_id": "6ow7JZcoiVlwJ8sO",
    "name": "3 Firebolt III",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/fire-ray-lorc.svg",
    "system": {
      "magicType": "Elemental Magic",
      "level": 3,
      "notes": "",
      "description": "<p>A fiery projectile.</p><ul><li><strong>Critical Success:</strong> Extra damage.</li><li><strong>Success:</strong> Fires a Firebolt; may cause panic.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound (Missile) &middot; <strong>Recipe:</strong> Firebolt II Rune + Ruby + Wraithstone (Art.)</p>"
    }
  },
  {
    "_id": "yyUZ4ukizINvBGMJ",
    "name": "3 Frostbite III",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/fire-ray-lorc.svg",
    "system": {
      "magicType": "Elemental Magic",
      "level": 3,
      "notes": "",
      "description": "<p>A freezing projectile; can also be used underfoot; freezes the struck area + 5 ft in all directions.</p><ul><li><strong>Critical Success:</strong> The target and enemies right next to it (5 ft) freeze for 1d3 rounds.</li><li><strong>Success:</strong> Fires a Frostbite; a hit target freezes for 1d3 rounds.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound (Missile) &middot; <strong>Recipe:</strong> Frostbite II Rune + Frost Vial + Wraithstone (Nat.)</p>"
    }
  },
  {
    "_id": "XBtHqbzKOgRp5nBN",
    "name": "3 Lightning Bolt III (Chain)",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/fire-ray-lorc.svg",
    "system": {
      "magicType": "Elemental Magic",
      "level": 3,
      "notes": "",
      "description": "<p>The lightning chains to enemies in direct contact; targets wearing mostly metal armor may be Stunned by the hit.</p><ul><li><strong>Critical Success:</strong> Hits every enemy in the fight.</li><li><strong>Success:</strong> Fires a Lightning Bolt; on a hit it jumps to 1d3 further targets.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound (Missile) &middot; <strong>Recipe:</strong> Lightning Bolt II Rune + Steel Point + Wraithstone (Art.)</p>"
    }
  },
  {
    "_id": "zE9F54abwH7oy2A7",
    "name": "3 Wind Blast I",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/fire-ray-lorc.svg",
    "system": {
      "magicType": "Elemental Magic",
      "level": 3,
      "notes": "",
      "description": "<p>Knocks enemies in a 10 ft area to the ground.</p><ul><li><strong>Critical Success:</strong> Affects targets in a 20 ft area.</li><li><strong>Success:</strong> Targets in a 10 ft area are knocked down (Proned).</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound &middot; <strong>Recipe:</strong> Rune + Wind Blast I scroll + Feather + Wraithstone (Art.)</p>"
    }
  },
  {
    "_id": "jv6ibYPnxkLRRqML",
    "name": "3 Petrify",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/fire-ray-lorc.svg",
    "system": {
      "magicType": "Elemental Magic",
      "level": 3,
      "notes": "",
      "description": "<p>Turns/immobilizes a living target into stone.</p><ul><li><strong>Critical Success:</strong> The target hardens to stone for 1d3 rounds, then resists via STR x3; encased in stone, it cannot be wounded.</li><li><strong>Success:</strong> The target hardens to stone for 1 round, then resists via STR x4; encased in stone, it cannot be wounded.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Nat.) &middot; <strong>Recipe:</strong> Stone Fist II Rune + Rare Mineral + Wraithstone (Nat.)</p>"
    }
  },
  {
    "_id": "N2JBcmKU3nwiVO5Z",
    "name": "4 Fireball I",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/fire-ray-lorc.svg",
    "system": {
      "magicType": "Elemental Magic",
      "level": 4,
      "notes": "",
      "description": "<p>A fireball; on impact it explodes and harms targets in a 20x20 ft area.</p><ul><li><strong>Critical Success:</strong> Extra damage.</li><li><strong>Success:</strong> Explodes on impact; may cause panic.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound (Missile) &middot; <strong>Recipe:</strong> Rune + Fireball I scroll + Ruby + Wraithstone (Art.)</p>"
    }
  },
  {
    "_id": "HNgQzHMmjfJRZPTk",
    "name": "4 Wind Blast II",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/fire-ray-lorc.svg",
    "system": {
      "magicType": "Elemental Magic",
      "level": 4,
      "notes": "",
      "description": "<p>Scatters enemies in a 20 ft area across the ground like rag dolls, dealing blunt damage; one-handed weapons are torn from their hands.</p><ul><li><strong>Critical Success:</strong> Stuns the thrown targets.</li><li><strong>Success:</strong> Targets in 20 ft are thrown (Blunt dmg 5 to 10 by target type, weight and landing surface); one-handed weapons torn from hands; targets end up Proned.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound &middot; <strong>Recipe:</strong> Wind Blast I Rune + Piece of Cloth + Wraithstone (Art.)</p>"
    }
  },
  {
    "_id": "4EOKPZ5nfTF5YJ8N",
    "name": "4 Air Control I",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/fire-ray-lorc.svg",
    "system": {
      "magicType": "Elemental Magic",
      "level": 4,
      "notes": "",
      "description": "<p>Sucks the air away from around an enemy; they gasp for air, choke and panic.</p><ul><li><strong>Critical Success:</strong> Hits the enemy and its surroundings (5 ft).</li><li><strong>Success:</strong> The target loses its action (defense only), chokes and gasps for air, and takes a Panic test.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Nat.) &middot; <strong>Recipe:</strong> Rune + Air Control I scroll + Flask + Wraithstone (Nat.)</p>"
    }
  },
  {
    "_id": "VHdveTWcCYpD7hV3",
    "name": "4 Mist",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/fire-ray-lorc.svg",
    "system": {
      "magicType": "Elemental Magic",
      "level": 4,
      "notes": "",
      "description": "<p>Summons a thick fog covering the whole area; visibility drops to 10 ft, applies to the whole scene.</p><ul><li><strong>Critical Success:</strong> The fog is nearly impenetrable (5 ft visibility); it rains.</li><li><strong>Success:</strong> Covers the area in fog.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound &middot; <strong>Recipe:</strong> Rune + Mist scroll + Water</p>"
    }
  },
  {
    "_id": "1qY9xRDo5bYuUzc6",
    "name": "5 Fireball II",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/fire-ray-lorc.svg",
    "system": {
      "magicType": "Elemental Magic",
      "level": 5,
      "notes": "",
      "description": "<p>A fireball; on impact it explodes and harms targets in a 30x30 ft area.</p><ul><li><strong>Critical Success:</strong> Extra damage.</li><li><strong>Success:</strong> Explodes on impact; may cause panic.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound (Missile) &middot; <strong>Recipe:</strong> Fireball I Rune + Phosphorus + Wraithstone (Art.)</p>"
    }
  },
  {
    "_id": "6fJSlTKqu31f7CZQ",
    "name": "5 Air Control II",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/fire-ray-lorc.svg",
    "system": {
      "magicType": "Elemental Magic",
      "level": 5,
      "notes": "",
      "description": "<p>Sucks the air away from around an enemy, choking them until they pass out.</p><ul><li><strong>Critical Success:</strong> Hits the enemy and its surroundings (5 ft).</li><li><strong>Success:</strong> The target passes out and must be woken to fight again.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Nat.) &middot; <strong>Recipe:</strong> Air Control I Rune + Mercury + Wraithstone (Nat.)</p>"
    }
  },
  {
    "_id": "loLQTCXmLvKhg63i",
    "name": "5 Thunder",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/fire-ray-lorc.svg",
    "system": {
      "magicType": "Elemental Magic",
      "level": 5,
      "notes": "",
      "description": "<p>A storm with strong wind takes over the area and badly hampers ranged fire; the wind drowns out all sound and visibility is poor. Works for battle and as a distraction or to mask activity; applies to the whole scene.</p><ul><li><strong>Critical Success:</strong> Calls up a violent storm with a risk of lightning strikes (the lightning targets enemies, since the storm is under the mage's control).</li><li><strong>Success:</strong> Calls up a storm.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Art.) &middot; <strong>Recipe:</strong> Rune + Thunder scroll + Copper + Amber + Wraithstone (Art.)</p>"
    }
  },
  {
    "_id": "YYsEbmhA7Fe2sP7e",
    "name": "6 Blizzard",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/fire-ray-lorc.svg",
    "system": {
      "magicType": "Elemental Magic",
      "level": 6,
      "notes": "",
      "description": "<p>Conjures a brutal snowstorm; visibility drops to 5 ft, high-velocity missiles fail, applies to the whole scene.</p><ul><li><strong>Critical Success:</strong> The storm is devastating; the cold also slows enemies in the area.</li><li><strong>Success:</strong> Snowstorm: visibility 5 ft, HV missiles fail.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Art.) &middot; <strong>Recipe:</strong> Rune + Blizzard scroll + Frost Vial + Wraithstone (Art.)</p>"
    }
  },
  {
    "_id": "482r4AnPyniXCIDg",
    "name": "6 Inferno",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/fire-ray-lorc.svg",
    "system": {
      "magicType": "Elemental Magic",
      "level": 6,
      "notes": "",
      "description": "<p>Unleashes a fiery hell in a 50x50 ft radius, dealing great damage and causing panic.</p><ul><li><strong>Critical Success:</strong> The inferno is unstoppable and moves a random distance in a random direction; everything burns and Erminfried laughs hysterically, raging until the end of the fight.</li><li><strong>Success:</strong> A 50x50 ft area in flames; all targets take 10 Fire dmg + a Panic test for everyone who sees this apocalypse; it burns for 3 rounds and moves a random distance in a random direction.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Art.) &middot; <strong>Recipe:</strong> Fireball II Rune + Sulfur + Phosphorus + Wraithstone (Art.)</p>"
    }
  },
  {
    "_id": "VzahytLOi7eYUJ7K",
    "name": "0 Mending Touch (Runeless)",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/plants-and-animals-DarkZaitzev.svg",
    "system": {
      "magicType": "Creation Magic",
      "level": 1,
      "notes": "",
      "description": "<p>A touch gently nudges the target's natural healing along; no miracle, the body just does sooner what it would have done anyway.</p><ul><li><strong>Critical Success:</strong> The target gains +2 to its next Mend Roll.</li><li><strong>Success:</strong> The target gains +1 to its next Mend Roll.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> No</p>"
    }
  },
  {
    "_id": "RnK9TFFabf2rwUma",
    "name": "1 Stabilize (Runeless)",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/plants-and-animals-DarkZaitzev.svg",
    "system": {
      "magicType": "Creation Magic",
      "level": 1,
      "notes": "",
      "description": "<p>Stops bleeding and stabilizes a dying being.</p><ul><li><strong>Critical Success:</strong> Stabilizes + closes 1 Wound Level.</li><li><strong>Success:</strong> Stops bleeding and stabilizes the dying (auto-passes the Shock roll).</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> No</p>"
    }
  },
  {
    "_id": "9uxjHBjMIPzpX2Xw",
    "name": "1 Beast Speech (Runeless)",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/plants-and-animals-DarkZaitzev.svg",
    "system": {
      "magicType": "Creation Magic",
      "level": 1,
      "notes": "",
      "description": "<p>Grants the ability to speak with a given animal for a time, within the limits of the animal's intelligence.</p><ul><li><strong>Critical Success:</strong> Full mutual understanding; the animal gains trust and may even become a temporary ally.</li><li><strong>Success:</strong> Speaks the given animal's tongue.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> No</p>"
    }
  },
  {
    "_id": "xZnIQz8ccQLxB3on",
    "name": "2 Entangle I",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/plants-and-animals-DarkZaitzev.svg",
    "system": {
      "magicType": "Creation Magic",
      "level": 2,
      "notes": "",
      "description": "<p>Roots and thorns burst from the ground and bind the target's legs. Mounted target: the rider makes a Riding test to avoid falling.</p><ul><li><strong>Critical Success:</strong> Roots and thorns hold the target so tightly they are dragged to the ground (Proned); also drags down a flying target; lasts 1 round.</li><li><strong>Success:</strong> Roots and thorns hold the target for 1 round; the target loses its action but can defend.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound &middot; <strong>Recipe:</strong> Rune + Entangle I scroll + Young Sprout</p>"
    }
  },
  {
    "_id": "2jkX0aHcAr4VTGPA",
    "name": "2 Beast Form",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/plants-and-animals-DarkZaitzev.svg",
    "system": {
      "magicType": "Creation Magic",
      "level": 2,
      "notes": "",
      "description": "<p>Turns the caster into a beast; the change back to human happens only when the caster wills it.</p><ul><li><strong>Critical Success:</strong> Turns into a stronger version of the beast without losing speech.</li><li><strong>Success:</strong> Turns into a beast; loses speech but keeps their personality.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Nat.) &middot; <strong>Recipe:</strong> Rune + Beast Form scroll + a trophy from the beast you want to become + Wraithstone (holding that beast's soul)</p>"
    }
  },
  {
    "_id": "EsQqtoyNWHJReQSN",
    "name": "3 Heal",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/plants-and-animals-DarkZaitzev.svg",
    "system": {
      "magicType": "Creation Magic",
      "level": 3,
      "notes": "",
      "description": "<p>Spurs the healing of a wound.</p><ul><li><strong>Critical Success:</strong> Automatically lowers a WL without a Mend Roll.</li><li><strong>Success:</strong> The target may immediately test its Mend Roll.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound &middot; <strong>Recipe:</strong> Rune + Heal scroll + Marigold</p>"
    }
  },
  {
    "_id": "PAJTrUyj7HORxN0A",
    "name": "3 Tame Beast",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/plants-and-animals-DarkZaitzev.svg",
    "system": {
      "magicType": "Creation Magic",
      "level": 3,
      "notes": "",
      "description": "<p>Tames and gentles a beast; used on an already-tamed animal in an enemy group, the animal turns neutral and drops out of the fight.</p><ul><li><strong>Critical Success:</strong> Tames even a very dangerous beast; long-lasting effect.</li><li><strong>Success:</strong> Tames the given beast for 7 days.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound &middot; <strong>Recipe:</strong> Rune + Tame Beast scroll + Raw Meat</p>"
    }
  },
  {
    "_id": "0cytZSWTTwZ7686n",
    "name": "3 Entangle II",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/plants-and-animals-DarkZaitzev.svg",
    "system": {
      "magicType": "Creation Magic",
      "level": 3,
      "notes": "Combines Entangle I and II.",
      "description": "<p>Roots and thorns burst from the ground and bind the target's legs. Mounted target: the rider falls.</p><ul><li><strong>Critical Success:</strong> Roots and thorns hold the target so tightly they are dragged to the ground (Proned); also drags down a flying target; the target is fully immobilized; lasts 1 round.</li><li><strong>Success:</strong> Roots and thorns hold the target so tightly they are dragged to the ground (Proned); also drags down a flying target; lasts 1 round.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Art.) &middot; <strong>Recipe:</strong> Entangle I Rune + Staggerbane Extract (30) + Wraithstone (Art.)</p>"
    }
  },
  {
    "_id": "qzgfzcwn6iiLzD0j",
    "name": "3 Call Beast I",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/plants-and-animals-DarkZaitzev.svg",
    "system": {
      "magicType": "Creation Magic",
      "level": 3,
      "notes": "",
      "description": "<p>Summons an animal ally; the animal takes some time to arrive. It is not tamed, it merely grasps the situation and joins the fight, but still acts as a wild animal and thinks for itself.</p><ul><li><strong>Critical Success:</strong> Summons a strong beast or a pack of beasts.</li><li><strong>Success:</strong> Summons a beast from the area, depending on terrain and situation.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Art.) &middot; <strong>Recipe:</strong> Rune + Call Beast scroll + an animal trophy (any) + Wraithstone (Art.)</p>"
    }
  },
  {
    "_id": "0whCWHBAwnKBeuuz",
    "name": "3 Insect Swarm",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/plants-and-animals-DarkZaitzev.svg",
    "system": {
      "magicType": "Creation Magic",
      "level": 3,
      "notes": "",
      "description": "<p>Summons a stinging swarm that attacks targets in a 15 ft area.</p><ul><li><strong>Critical Success:</strong> The stinging swarm harries the targets, who lose their actions for 1d3 rounds and take -20 to defense.</li><li><strong>Success:</strong> The stinging swarm harries targets in the area; they take -20 to all skills for 1d3 rounds.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Art.) &middot; <strong>Recipe:</strong> Rune + Insect Swarm scroll + Sack of Dried Insects + Wraithstone (Art.)</p>"
    }
  },
  {
    "_id": "PLT1QyAPwaNLIIsn",
    "name": "4 Cure",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/plants-and-animals-DarkZaitzev.svg",
    "system": {
      "magicType": "Creation Magic",
      "level": 4,
      "notes": "",
      "description": "<p>Cures a disease, stops a poisoning or an infection. Can also be used as Heal (per the Heal rules).</p><ul><li><strong>Critical Success:</strong> Automatically lowers a WL without a Mend Roll.</li><li><strong>Success:</strong> For a serious illness it stabilizes the target; the target may immediately test its Mend Roll.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound &middot; <strong>Recipe:</strong> Heal Rune + Herbal Antivenin</p>"
    }
  },
  {
    "_id": "HMEfAfWuF5bLALPC",
    "name": "4 Entangle III",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/plants-and-animals-DarkZaitzev.svg",
    "system": {
      "magicType": "Creation Magic",
      "level": 4,
      "notes": "",
      "description": "<p>Roots and thorns burst from the ground and bind the legs of targets in a 15 ft area. Mounted target: the rider falls.</p><ul><li><strong>Critical Success:</strong> Roots and thorns hold targets in a 15 ft area so tightly they are dragged to the ground (Proned); also drags down flying targets; the targets are fully immobilized; lasts 1 round; also deals 6 Piercing dmg.</li><li><strong>Success:</strong> Roots and thorns hold targets in a 15 ft area so tightly they are dragged to the ground (Proned); also drags down flying targets; the targets are fully immobilized; lasts 1 round.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Nat.) &middot; <strong>Recipe:</strong> Entangle II Rune + Staggerbane Extract (30) + Wraithstone (Nat.)</p>"
    }
  },
  {
    "_id": "WqxNUBMVtVfTnBNr",
    "name": "4 Deadly Tendril",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/plants-and-animals-DarkZaitzev.svg",
    "system": {
      "magicType": "Creation Magic",
      "level": 4,
      "notes": "",
      "description": "<p>A giant vine bursts from the ground and slashes at enemies within reach; it can attack and defend but cannot move, and stays active until the end of the fight.</p><ul><li><strong>Critical Success:</strong> Summons a vine (Deadly Tendril token) with a 10 ft attack reach that climbs from the ground and can move.</li><li><strong>Success:</strong> Summons a vine (Deadly Tendril token) with a 10 ft attack reach.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Art.) &middot; <strong>Recipe:</strong> Rune + Deadly Tendril scroll + Mandrake + Wraithstone (Art.)</p>"
    }
  },
  {
    "_id": "uF3FjKcJ18rk8kqn",
    "name": "5 Call Beast II",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/plants-and-animals-DarkZaitzev.svg",
    "system": {
      "magicType": "Creation Magic",
      "level": 5,
      "notes": "",
      "description": "<p>Instantly brings a nearby animal onto the scene. It is not tamed, it merely grasps the situation and joins the fight, but still acts as a wild animal and thinks for itself.</p><ul><li><strong>Critical Success:</strong> Brings a strong beast or a pack of beasts.</li><li><strong>Success:</strong> Brings a beast from the area, depending on terrain and situation.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Nat.) &middot; <strong>Recipe:</strong> Call Beast I Rune + an animal trophy (any) + Wraithstone (Nat.)</p>"
    }
  },
  {
    "_id": "A8tB9Jssn12pd3WM",
    "name": "5 Deadly Tendril II",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/plants-and-animals-DarkZaitzev.svg",
    "system": {
      "magicType": "Creation Magic",
      "level": 5,
      "notes": "",
      "description": "<p>A giant vine bursts from the ground and slashes at enemies within reach; it can attack, defend and move freely as the situation demands, and stays active until the end of the fight.</p><ul><li><strong>Critical Success:</strong> Summons 2 such vines.</li><li><strong>Success:</strong> Summons a vine (Deadly Tendril token) with a 10 ft attack reach that climbs from the ground and can move.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Nat.) &middot; <strong>Recipe:</strong> Deadly Tendril I Rune + Wraithstone (Nat.)</p>"
    }
  },
  {
    "_id": "3b1ntcWJ2kzJsNFk",
    "name": "0 Mesmerize (Runeless)",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/psychic-waves-blue-lorc.svg",
    "system": {
      "magicType": "Illusion Magic",
      "level": 1,
      "notes": "Opening Spell",
      "description": "<p>A look into the eyes briefly freezes the target; they stiffen and their will melts for a moment. Requires eye contact.</p><ul><li><strong>Critical Success:</strong> The target is frozen for 1d3 rounds (or until something disturbs them).</li><li><strong>Success:</strong> The target is frozen for 1 round (loses its action).</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> No</p>"
    }
  },
  {
    "_id": "lRi8yF8CHLHPP99b",
    "name": "1 Blink (Runeless)",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/psychic-waves-blue-lorc.svg",
    "system": {
      "magicType": "Illusion Magic",
      "level": 1,
      "notes": "",
      "description": "<p>Short-range teleport (up to 50 ft); the caster must see the spot they want to move to.</p><ul><li><strong>Critical Success:</strong> Can take along a person in contact.</li><li><strong>Success:</strong> Teleports to a spot in sight (up to 50 ft).</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> No</p>"
    }
  },
  {
    "_id": "JtLUawrFhNEmfauU",
    "name": "1 Phantasm I",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/psychic-waves-blue-lorc.svg",
    "system": {
      "magicType": "Illusion Magic",
      "level": 1,
      "notes": "",
      "description": "<p>Creates a small illusion (a static image, sound or smell); up close the target realizes it is only an illusion and it fades.</p><ul><li><strong>Critical Success:</strong> The illusion is convincing even up close and multi-sensory, but static; it fades only on touch.</li><li><strong>Success:</strong> A static, single-sense illusion.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound &middot; <strong>Recipe:</strong> Rune + Phantasm I scroll + Flask</p>"
    }
  },
  {
    "_id": "x9np5v8XCZIwxvl4",
    "name": "2 Phantasm II",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/psychic-waves-blue-lorc.svg",
    "system": {
      "magicType": "Illusion Magic",
      "level": 2,
      "notes": "Combines Phantasm I and II.",
      "description": "<p>Creates a moving, multi-sensory illusion.</p><ul><li><strong>Critical Success:</strong> The illusion is convincing even up close, multi-sensory, moving and lures the target after it; it can even frighten the target and fades only on touch.</li><li><strong>Success:</strong> A moving, multi-sensory illusion.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound &middot; <strong>Recipe:</strong> Phantasm I Rune + Smoke Vial</p>"
    }
  },
  {
    "_id": "Rpph26r1XdryjXhn",
    "name": "2 Disguise I",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/psychic-waves-blue-lorc.svg",
    "system": {
      "magicType": "Illusion Magic",
      "level": 2,
      "notes": "Can target the caster or a target.",
      "description": "<p>Changes the user's appearance into a static object; it works visually, the smell stays the same (won't fool an animal); lasts 5 minutes.</p><ul><li><strong>Critical Success:</strong> Changes appearance into a static object; the user must not move, and the object cannot be detected.</li><li><strong>Success:</strong> Changes appearance into a static object; the user must not move, and the object can be detected via passive Awareness.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound &middot; <strong>Recipe:</strong> Rune + Disguise I scroll + Beeswax</p>"
    }
  },
  {
    "_id": "Zti5mjt8k6BnEcib",
    "name": "2 Astral Sight",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/psychic-waves-blue-lorc.svg",
    "system": {
      "magicType": "Illusion Magic",
      "level": 2,
      "notes": "",
      "description": "<p>Sees into the astral.</p><ul><li><strong>Critical Success:</strong> Sees everyone's true face based on their morality and personality.</li><li><strong>Success:</strong> Sees nearby ghosts and astral phenomena; sees true appearance.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound &middot; <strong>Recipe:</strong> Rune + Astral Sight scroll + Moonstone</p>"
    }
  },
  {
    "_id": "7GNSnUYfP54UU5Dr",
    "name": "2 Whisper (Runeless)",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/psychic-waves-blue-lorc.svg",
    "system": {
      "magicType": "Illusion Magic",
      "level": 2,
      "notes": "",
      "description": "<p>Sends the target a short message; the target must be within visual range.</p><ul><li><strong>Critical Success:</strong> A short two-way exchange.</li><li><strong>Success:</strong> Sends the target a short message.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> No</p>"
    }
  },
  {
    "_id": "P06Gmvm9B844c3GU",
    "name": "3 Phantasm III",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/psychic-waves-blue-lorc.svg",
    "system": {
      "magicType": "Illusion Magic",
      "level": 3,
      "notes": "Combines Phantasm I–II.",
      "description": "<p>A wholly convincing multi-sensory illusion that also reacts to the target.</p><ul><li><strong>Critical Success:</strong> The target is entirely in the illusion's power.</li><li><strong>Success:</strong> A moving, multi-sensory illusion indistinguishable from the original; it can frighten the target or communicate with them.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Art.) &middot; <strong>Recipe:</strong> Phantasm II Rune + Butterfly Wing + Wraithstone (Art.)</p>"
    }
  },
  {
    "_id": "H8GqVrhyFmPQoERy",
    "name": "3 Disguise II",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/psychic-waves-blue-lorc.svg",
    "system": {
      "magicType": "Illusion Magic",
      "level": 3,
      "notes": "Can target the caster or a target; can be used as Disguise I.",
      "description": "<p>Changes the user's appearance (won't fool an animal); lasts 10 minutes.</p><ul><li><strong>Critical Success:</strong> The user blends perfectly into their surroundings.</li><li><strong>Success:</strong> Changes the user's appearance into someone else, but it can be detected via passive Awareness; the user gives themselves away with more interaction with their surroundings.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Art.) &middot; <strong>Recipe:</strong> Disguise I Rune + Glass Eye + Wraithstone (Art.)</p>"
    }
  },
  {
    "_id": "YxIjzALtwGYvtW7z",
    "name": "3 Mirror Selves",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/psychic-waves-blue-lorc.svg",
    "system": {
      "magicType": "Illusion Magic",
      "level": 3,
      "notes": "",
      "description": "<p>Creates illusory duplicates of the caster and shuffles the positions of the caster and the duplicates; lasts until the duplicates are exposed.</p><ul><li><strong>Critical Success:</strong> Creates 4 illusory duplicates.</li><li><strong>Success:</strong> Creates 2 illusory duplicates.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Art.) &middot; <strong>Recipe:</strong> Rune + Mirror Selves scroll + Steel Mirror + Wraithstone (Art.)</p>"
    }
  },
  {
    "_id": "qT16Q6aHiYbOiKbX",
    "name": "3 Scry I",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/psychic-waves-blue-lorc.svg",
    "system": {
      "magicType": "Illusion Magic",
      "level": 3,
      "notes": "",
      "description": "<p>Views a distant, known place or person.</p><ul><li><strong>Critical Success:</strong> A clear and longer view.</li><li><strong>Success:</strong> Views a known place/person.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound &middot; <strong>Recipe:</strong> Rune + Scry I scroll + Crystal Shard</p>"
    }
  },
  {
    "_id": "zvYVNWdRwrbeqFVn",
    "name": "3 Divination (Runeless)",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/psychic-waves-blue-lorc.svg",
    "system": {
      "magicType": "Illusion Magic",
      "level": 3,
      "notes": "",
      "description": "<p>Glimpses the near future.</p><ul><li><strong>Critical Success:</strong> A clear omen.</li><li><strong>Success:</strong> A hazy omen.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> No</p>"
    }
  },
  {
    "_id": "2AWqYRoi4YUxVEfX",
    "name": "3 Telepathy (Runeless)",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/psychic-waves-blue-lorc.svg",
    "system": {
      "magicType": "Illusion Magic",
      "level": 3,
      "notes": "",
      "description": "<p>Communicates telepathically with a target; the target must be within visual range.</p><ul><li><strong>Critical Success:</strong> Can attempt an Insertion (see Insertion).</li><li><strong>Success:</strong> Telepathic communication with the target.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> No &middot; <strong>Recipe:</strong> Must know Whisper, which then broadens its options and abilities.</p>"
    }
  },
  {
    "_id": "f3qkmp7hcUWRnt0C",
    "name": "4 Disguise III",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/psychic-waves-blue-lorc.svg",
    "system": {
      "magicType": "Illusion Magic",
      "level": 4,
      "notes": "Can target the caster or a target; can be used as Disguise I–II.",
      "description": "<p>Changes the user's appearance to blend perfectly into their surroundings; animals grow wary but cannot make sense of it; lasts 15 minutes.</p><ul><li><strong>Critical Success:</strong> The surroundings take no notice of the user, whatever they do.</li><li><strong>Success:</strong> The user blends perfectly into their surroundings; only suspicious activity gives them away.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Art.) &middot; <strong>Recipe:</strong> Disguise II Rune + Valerian Herb + Wraithstone (Art.)</p>"
    }
  },
  {
    "_id": "9M9nHQMlzgYCWw1g",
    "name": "4 Scry II",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/psychic-waves-blue-lorc.svg",
    "system": {
      "magicType": "Illusion Magic",
      "level": 4,
      "notes": "Combines Scry I and II.",
      "description": "<p>Views any place or person.</p><ul><li><strong>Critical Success:</strong> Projects the user's awareness to that place or person, letting them react more, look around, walk the place or speak to the person.</li><li><strong>Success:</strong> Views even a place/person not known before.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Art.) &middot; <strong>Recipe:</strong> Scry I Rune + Moonstone + Wraithstone (Art.)</p>"
    }
  },
  {
    "_id": "SeJCkJMXILckCd1o",
    "name": "4 Astral Travel",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/psychic-waves-blue-lorc.svg",
    "system": {
      "magicType": "Illusion Magic",
      "level": 4,
      "notes": "Can be used as Astral Sight.",
      "description": "<p>Enters the astral as a spirit (the body stays behind).</p><ul><li><strong>Critical Success:</strong> If killed in the astral or another dimension, they reappear back in their body.</li><li><strong>Success:</strong> Enters the astral as a spirit.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Art.) &middot; <strong>Recipe:</strong> Astral Sight Rune + Astral Dust + Wraithstone (Art.)</p>"
    }
  },
  {
    "_id": "RQynZn7tMr8XeEwe",
    "name": "5 Disguise IV",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/psychic-waves-blue-lorc.svg",
    "system": {
      "magicType": "Illusion Magic",
      "level": 5,
      "notes": "Can target the caster or a target; can be used as Disguise I–III.",
      "description": "<p>Full invisibility; not even an animal detects it; lasts 20 minutes.</p><ul><li><strong>Critical Success:</strong> Invisible; can move and fully react, even attack.</li><li><strong>Success:</strong> Invisible; can move, pick up objects and speak, but cannot attack.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Art.) &middot; <strong>Recipe:</strong> Disguise III Rune + Flask + Wraithstone (Art.)</p>"
    }
  },
  {
    "_id": "qEbfYPSwUdAxZojC",
    "name": "5 Astral Travel II",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/psychic-waves-blue-lorc.svg",
    "system": {
      "magicType": "Illusion Magic",
      "level": 5,
      "notes": "Can be used as Astral Sight and Astral Travel I.",
      "description": "<p>Enters the astral in physical form.</p><ul><li><strong>Critical Success:</strong> If killed in the astral or another dimension, they reappear back in the physical world.</li><li><strong>Success:</strong> Enters the astral (with the whole group).</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Nat.) &middot; <strong>Recipe:</strong> Astral Travel I Rune + Meteorite Ore + Wraithstone (Nat.) holding a soul caught in the astral</p>"
    }
  },
  {
    "_id": "UXNrQhRHQm54EiXx",
    "name": "5 Astral Travel III (Half-Astral)",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/psychic-waves-blue-lorc.svg",
    "system": {
      "magicType": "Illusion Magic",
      "level": 5,
      "notes": "Reshapes one's own soul/body → Natural. Can be used as Astral Travel/Sight.",
      "description": "<p>A specialization of the Astral Travel II rune: the user shifts halfway into the astral and is temporarily invulnerable to ordinary means in the physical world.</p><ul><li><strong>Critical Success:</strong> Lasts 30 minutes.</li><li><strong>Success:</strong> Half in the astral, invulnerable to ordinary weapons (1d6 rounds); can pass through physical objects or walls.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Nat.) &middot; <strong>Recipe:</strong> Astral Travel II Rune + Meteorite Ore</p>"
    }
  },
  {
    "_id": "mrGpz9ANAQuiW3x5",
    "name": "5 Insertion",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/psychic-waves-blue-lorc.svg",
    "system": {
      "magicType": "Illusion Magic",
      "level": 5,
      "notes": "",
      "description": "<p>Telepathically plants a thought in the target, which the target takes to be their own.</p><ul><li><strong>Critical Success:</strong> Plants the thought; the target accepts it entirely without question.</li><li><strong>Success:</strong> Plants the thought; the thought seems suspicious to the target and they do not always hold to it (INT d100 test for the target).</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Nat.) &middot; <strong>Recipe:</strong> Rune + Insertion scroll + dried Noxy brain + Wraithstone (Nat.) holding a Noxy's soul</p>"
    }
  },
  {
    "_id": "4a7FA24rc3iBVHEG",
    "name": "0 Jinx (Runeless)",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/screaming-lorc.svg",
    "system": {
      "magicType": "Enthropic Magic",
      "level": 1,
      "notes": "Opening Spell",
      "description": "<p>Lays a small curse of misfortune on the target; no lightning, just suspiciously frequent bad luck. The target has no idea they are cursed.</p><ul><li><strong>Critical Success:</strong> The bad luck is pronounced and lasts 1d6 days.</li><li><strong>Success:</strong> The target has bad luck until the end of the day; the GM affects their important rolls.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> No</p>"
    }
  },
  {
    "_id": "tTMsg0G2siBuFeAU",
    "name": "1 Speak with Dead (Runeless)",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/screaming-lorc.svg",
    "system": {
      "magicType": "Enthropic Magic",
      "level": 1,
      "notes": "",
      "description": "<p>The caster can speak with a corpse.</p><ul><li><strong>Critical Success:</strong> The dead answers clearly and willingly.</li><li><strong>Success:</strong> The dead answers a few questions (hazily).</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> No</p>"
    }
  },
  {
    "_id": "jWgtGUpmwqObxMLX",
    "name": "2 Weakness",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/screaming-lorc.svg",
    "system": {
      "magicType": "Enthropic Magic",
      "level": 2,
      "notes": "",
      "description": "<p>Drains the target's strength: -attack, -defense and -movement (physical resists).</p><ul><li><strong>Critical Success:</strong> The target is weakened (STR, DEX and AGL -3); lasts until the end of the fight or the caster's death.</li><li><strong>Success:</strong> The target is weakened (STR, DEX and AGL -3); lasts 1d3 rounds.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound &middot; <strong>Recipe:</strong> Rune + Weakness scroll + Handful of Ash</p>"
    }
  },
  {
    "_id": "cbTBEgg7szk8MzHH",
    "name": "2 Disorient",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/screaming-lorc.svg",
    "system": {
      "magicType": "Enthropic Magic",
      "level": 2,
      "notes": "",
      "description": "<p>Confuses the target's mind for 1 round.</p><ul><li><strong>Critical Success:</strong> The target is confused for 3 rounds.</li><li><strong>Success:</strong> The target mistakes allies for enemies and attacks their allies.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound &middot; <strong>Recipe:</strong> Rune + Disorient scroll + Poppy Tincture</p>"
    }
  },
  {
    "_id": "t3eiTuLUmoutJdRv",
    "name": "2 Drain Life I",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/screaming-lorc.svg",
    "system": {
      "magicType": "Enthropic Magic",
      "level": 2,
      "notes": "",
      "description": "<p>Drains life force, weakening the target and healing the caster.</p><ul><li><strong>Critical Success:</strong> Takes a wound from the caster and gives it to the target.</li><li><strong>Success:</strong> Weakens the target by Fatigue +2 and heals the caster by 1 WL.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Nat.) &middot; <strong>Recipe:</strong> Rune + Drain Life I scroll + Leech + Wraithstone (Nat.)</p>"
    }
  },
  {
    "_id": "EPwnMtmmJWcEf9gx",
    "name": "2 Necrotic Touch",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/screaming-lorc.svg",
    "system": {
      "magicType": "Enthropic Magic",
      "level": 2,
      "notes": "",
      "description": "<p>A shadowy necrotic projectile.</p><ul><li><strong>Critical Success:</strong> Opens a new S2 infected wound on the target.</li><li><strong>Success:</strong> Infects the target's existing wound.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Special Item</p>"
    }
  },
  {
    "_id": "kl3bntoHZGnGBzug",
    "name": "2 Shadow of Doubt",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/screaming-lorc.svg",
    "system": {
      "magicType": "Enthropic Magic",
      "level": 2,
      "notes": "",
      "description": "<p>Sows the target's worst fears and doubts, showing them everything they regret from the past.</p><ul><li><strong>Critical Success:</strong> The target panics without defending.</li><li><strong>Success:</strong> The target makes a Panic test; on a failure they panic for 1d3 rounds.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Special Item</p>"
    }
  },
  {
    "_id": "Zhwt5QU4pb6Bbe3y",
    "name": "3 Affliction Hex I",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/screaming-lorc.svg",
    "system": {
      "magicType": "Enthropic Magic",
      "level": 3,
      "notes": "Curse/Hex",
      "description": "<p>A curse aimed at mages, lowering their magical abilities.</p><ul><li><strong>Critical Success:</strong> The target gains Fatigue +4, AUR and INT -2.</li><li><strong>Success:</strong> The target gains Fatigue +2, AUR and INT -1.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Art.) &middot; <strong>Recipe:</strong> Rune + Affliction Hex scroll + Diseased Blood + Wraithstone (Art.)</p>"
    }
  },
  {
    "_id": "IGYkFCEzpV2FVW3Q",
    "name": "3 Horror",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/screaming-lorc.svg",
    "system": {
      "magicType": "Enthropic Magic",
      "level": 3,
      "notes": "",
      "description": "<p>Forces terror on the target: they freeze and cannot move (Fear; mental resists). A sleeping target cannot resist and takes spirit dmg.</p><ul><li><strong>Critical Success:</strong> The terror hits all enemies on the battlefield (a Fear test for everyone).</li><li><strong>Success:</strong> A Fear test for the target; others right around them panic (a Panic test).</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Nat.) &middot; <strong>Recipe:</strong> Rune + Horror scroll + Poppy Tincture + Wraithstone (Nat.)</p>"
    }
  },
  {
    "_id": "8QkUTLEY9uDrXMNI",
    "name": "3 Sleep I",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/screaming-lorc.svg",
    "system": {
      "magicType": "Enthropic Magic",
      "level": 3,
      "notes": "",
      "description": "<p>Puts enemies in an area to sleep.</p><ul><li><strong>Critical Success:</strong> Enemies within 30 ft fall asleep; only an ally or an attack can wake them.</li><li><strong>Success:</strong> Puts the target to sleep; only an ally or an attack can wake them.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Nat.) &middot; <strong>Recipe:</strong> Rune + Sleep I scroll + Valerian Draught + Wraithstone (Nat.)</p>"
    }
  },
  {
    "_id": "fFTkzdQ96Z601ZB6",
    "name": "3 Drain Life II",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/screaming-lorc.svg",
    "system": {
      "magicType": "Enthropic Magic",
      "level": 3,
      "notes": "",
      "description": "<p>Drains life force, wounding the target and healing the caster.</p><ul><li><strong>Critical Success:</strong> Takes a wound from the caster and gives it to the target, worsening the wound further.</li><li><strong>Success:</strong> Takes a wound from the caster and gives it to the target.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Nat.) &middot; <strong>Recipe:</strong> Drain Life I Rune + Vial with Blood</p>"
    }
  },
  {
    "_id": "gChV56b0VyV4Bdbv",
    "name": "3 Homunculus",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/screaming-lorc.svg",
    "system": {
      "magicType": "Enthropic Magic",
      "level": 3,
      "notes": "",
      "description": "<p>Creates a dark servant.</p><ul><li><strong>Critical Success:</strong> Creates 2 homunculi and 1 large one.</li><li><strong>Success:</strong> Creates 3 homunculi.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Special Item</p>"
    }
  },
  {
    "_id": "dlzxDLY5x8OJ47zy",
    "name": "3 Natural Soul (Runeless)",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/screaming-lorc.svg",
    "system": {
      "magicType": "Enthropic Magic",
      "level": 3,
      "notes": "",
      "description": "<p>Traps a soul in a Wraithstone.</p><ul><li><strong>Critical Success:</strong> Ego = 18 (maximum).</li><li><strong>Success:</strong> Ego = 12 + 1d6.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> No</p>"
    }
  },
  {
    "_id": "iYA4gPLAwbd9jfxO",
    "name": "3 Mind Blast",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/screaming-lorc.svg",
    "system": {
      "magicType": "Enthropic Magic",
      "level": 3,
      "notes": "",
      "description": "<p>The target's mind literally explodes and they collapse.</p><ul><li><strong>Critical Success:</strong> The target collapses at once and suffers lasting psychological aftereffects.</li><li><strong>Success:</strong> The target makes a Fear test.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Special Item</p>"
    }
  },
  {
    "_id": "yj6158wC5HZ9U9BM",
    "name": "4 Misdirection Hex",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/screaming-lorc.svg",
    "system": {
      "magicType": "Enthropic Magic",
      "level": 4,
      "notes": "Curse/Hex",
      "description": "<p>A curse of imprecision: the target often misses and cannot land critical hits.</p><ul><li><strong>Critical Success:</strong> Slows the target's attack, movement and reactions.</li><li><strong>Success:</strong> The target takes -30 to Combat Skills.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Art.) &middot; <strong>Recipe:</strong> Rune + Misdirection Hex scroll + White Veil + Wraithstone (Art.)</p>"
    }
  },
  {
    "_id": "re6RUsoJCtgplXOU",
    "name": "4 Sleep II (Nightmare)",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/screaming-lorc.svg",
    "system": {
      "magicType": "Enthropic Magic",
      "level": 4,
      "notes": "Can be used as Sleep I.",
      "description": "<p>Puts enemies in an area to sleep.</p><ul><li><strong>Critical Success:</strong> Enemies within 30 ft fall asleep; only an ally or an attack can wake them; on waking they all make a Fear test.</li><li><strong>Success:</strong> Puts the target to sleep; only an ally or an attack can wake them; on waking they make a Fear test.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Nat.) &middot; <strong>Recipe:</strong> Sleep I Rune + Poppy Tincture + Wraithstone (Nat.)</p>"
    }
  },
  {
    "_id": "fZoDI8QPg74K7FyT",
    "name": "4 Paralysis",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/screaming-lorc.svg",
    "system": {
      "magicType": "Enthropic Magic",
      "level": 4,
      "notes": "",
      "description": "<p>Cripples the target (Paralyzed; physical resists).</p><ul><li><strong>Critical Success:</strong> Paralyzes nearby targets.</li><li><strong>Success:</strong> The target is fully paralyzed for 1 round.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Nat.) &middot; <strong>Recipe:</strong> Rune + Paralysis scroll + Toad Venom + Wraithstone (Nat.)</p>"
    }
  },
  {
    "_id": "Cyc86HGGZUIwqiLt",
    "name": "4 Raise Dead I",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/screaming-lorc.svg",
    "system": {
      "magicType": "Enthropic Magic",
      "level": 4,
      "notes": "",
      "description": "<p>Raises a corpse as an undead servant (skeleton/zombie).</p><ul><li><strong>Critical Success:</strong> Raises 3 corpses on the battlefield.</li><li><strong>Success:</strong> Raises 1 corpse on the battlefield.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Nat.) &middot; <strong>Recipe:</strong> Rune + Raise Dead I scroll + Grave Dirt + Wraithstone (Nat.)</p>"
    }
  },
  {
    "_id": "ZZTUig2DITcOQTjH",
    "name": "4 Homunculus II",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/screaming-lorc.svg",
    "system": {
      "magicType": "Enthropic Magic",
      "level": 4,
      "notes": "",
      "description": "<p>Creates a dark servant.</p><ul><li><strong>Critical Success:</strong> Creates 2 large homunculi.</li><li><strong>Success:</strong> Creates 1 large homunculus built for combat.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Special Item</p>"
    }
  },
  {
    "_id": "nHZzGVyvqfChHVvK",
    "name": "4 Plague",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/screaming-lorc.svg",
    "system": {
      "magicType": "Enthropic Magic",
      "level": 4,
      "notes": "",
      "description": "<p>Wraps the target in a cloud of fleas and infects them with plague.</p><ul><li><strong>Critical Success:</strong> More targets in range fall ill.</li><li><strong>Success:</strong> The target falls ill (tied to diseases/Vitality).</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Special Item</p>"
    }
  },
  {
    "_id": "eYsOOn4JPi998HNV",
    "name": "5 Affliction Hex II",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/screaming-lorc.svg",
    "system": {
      "magicType": "Enthropic Magic",
      "level": 5,
      "notes": "Curse/Hex",
      "description": "<p>Completely prevents the target from using magic.</p><ul><li><strong>Critical Success:</strong> The target cannot use magic and permanently forgets 1 random spell.</li><li><strong>Success:</strong> The target cannot use magic.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Nat.) &middot; <strong>Recipe:</strong> Affliction Hex I Rune + Meteorite Ore + Wraithstone (Nat.)</p>"
    }
  },
  {
    "_id": "9xoKWh29gosFxSow",
    "name": "5 Death Hex",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/screaming-lorc.svg",
    "system": {
      "magicType": "Enthropic Magic",
      "level": 5,
      "notes": "Curse/Hex",
      "description": "<p>A curse of deadly misfortune: every hit against the target becomes a success.</p><ul><li><strong>Critical Success:</strong> On its action the target makes a Fumble and Stumble test.</li><li><strong>Success:</strong> An attack on the target always succeeds (but the target can still defend normally).</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Nat.) &middot; <strong>Recipe:</strong> Rune + Death Hex scroll + Black Candle + Wraithstone (Nat.)</p>"
    }
  },
  {
    "_id": "rA8OrulW9z6Nhp6S",
    "name": "5 Mass Paralysis",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/screaming-lorc.svg",
    "system": {
      "magicType": "Enthropic Magic",
      "level": 5,
      "notes": "Can be used as Paralysis.",
      "description": "<p>Cripples all enemies in an area.</p><ul><li><strong>Critical Success:</strong> The paralysis lasts 1d3 rounds.</li><li><strong>Success:</strong> Enemies in the area are paralyzed for 1 round.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Nat.) &middot; <strong>Recipe:</strong> Paralysis Rune + Spider Venom + Wraithstone (Nat.)</p>"
    }
  },
  {
    "_id": "YXpdLXJmTIdMIjHl",
    "name": "5 Raise Dead II",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/screaming-lorc.svg",
    "system": {
      "magicType": "Enthropic Magic",
      "level": 5,
      "notes": "",
      "description": "<p>Raises more / stronger undead.</p><ul><li><strong>Critical Success:</strong> Raises 3 corpses on the battlefield and brings them back stronger.</li><li><strong>Success:</strong> Raises 3 corpses on the battlefield.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Nat.) &middot; <strong>Recipe:</strong> Raise Dead I Rune + Human Skull + Wraithstone (Nat.)</p>"
    }
  },
  {
    "_id": "fWPf5YEwSe7lSYpl",
    "name": "5 Homunculus III",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/screaming-lorc.svg",
    "system": {
      "magicType": "Enthropic Magic",
      "level": 5,
      "notes": "",
      "description": "<p>Creates a dark servant.</p><ul><li><strong>Critical Success:</strong> Summons 2 demonic entities.</li><li><strong>Success:</strong> Summons a demonic entity.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Special Item</p>"
    }
  },
  {
    "_id": "dSnCDsZ010T0HqrL",
    "name": "5 Soul Rend",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/screaming-lorc.svg",
    "system": {
      "magicType": "Enthropic Magic",
      "level": 5,
      "notes": "",
      "description": "<p>Tears out the target's soul and places it in a Wraithstone or claims it; can still be reversed by the caster's death.</p><ul><li><strong>Critical Success:</strong> Tears out the target's soul with no chance to defend.</li><li><strong>Success:</strong> Tears out the target's soul; the target resists via an AUR test.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Special Item</p>"
    }
  },
  {
    "_id": "69mnQ36xHcE6Ye9d",
    "name": "6 Raise Dead III",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/screaming-lorc.svg",
    "system": {
      "magicType": "Enthropic Magic",
      "level": 6,
      "notes": "",
      "description": "<p>Raises more / stronger undead.</p><ul><li><strong>Critical Success:</strong> Raises every corpse on the battlefield and returns them as strong undead (Death Knight, Lich).</li><li><strong>Success:</strong> Raises every corpse on the battlefield or creates strong undead (Death Knight, Lich).</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Nat.) &middot; <strong>Recipe:</strong> Raise Dead II Rune + Human Skull + Wraithstone (Nat.)</p>"
    }
  },
  {
    "_id": "xn5fRAeO54En8SBx",
    "name": "6 Corruption Hex",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/screaming-lorc.svg",
    "system": {
      "magicType": "Enthropic Magic",
      "level": 6,
      "notes": "Curse/Hex",
      "description": "<p>Corrupts and seizes the target's soul; they go over to the dark side.</p><ul><li><strong>Critical Success:</strong> The target immediately joins the caster's side without anyone knowing.</li><li><strong>Success:</strong> If the target fails a Mental Conflict, they gradually come over to the caster's side.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Special Item</p>"
    }
  },
  {
    "_id": "hss8hG3zs1mh4ooP",
    "name": "0 Bloodletting (Runeless)",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/stigmata-lorc.svg",
    "system": {
      "magicType": "Blood Magic",
      "level": 1,
      "notes": "Opening Spell",
      "description": "<p>Through blood contact, transfers pain and fatigue (and a bit of injury) between two beings.</p><ul><li><strong>Critical Success:</strong> Transfers Fatigue and even 1 wound in either direction.</li><li><strong>Success:</strong> Transfers Fatigue (pain / fatigue) from one being to another.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> No</p>"
    }
  },
  {
    "_id": "bWNWAscQpqLcw5zg",
    "name": "2 Blood Spike I",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/stigmata-lorc.svg",
    "system": {
      "magicType": "Blood Magic",
      "level": 2,
      "notes": "Magic Missile",
      "description": "<p>Creates a blood spike that deals Piercing dmg.</p><ul><li><strong>Critical Success:</strong> Extra damage.</li><li><strong>Success:</strong> Sends a blood spike (high velocity) at the target, a heavy bleeder wound.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound (Missile) &middot; <strong>Recipe:</strong> Rune + Blood Spike I scroll + Steel Point</p>"
    }
  },
  {
    "_id": "N27kBBwYU93EkKlg",
    "name": "2 Blood Frenzy",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/stigmata-lorc.svg",
    "system": {
      "magicType": "Blood Magic",
      "level": 2,
      "notes": "",
      "description": "<p>Sacrifices one's own or another's blood for combat fury; lasts the whole fight.</p><ul><li><strong>Critical Success:</strong> Opens a Minor wound on the target but adds Combat Skills +30.</li><li><strong>Success:</strong> Opens a Serious wound on the target but adds Combat Skills +30.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound &middot; <strong>Recipe:</strong> Rune + Blood Frenzy scroll + Vial with Blood (caster's own)</p>"
    }
  },
  {
    "_id": "YYyo9h8VHi5iFlUt",
    "name": "2 Blood Shield",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/stigmata-lorc.svg",
    "system": {
      "magicType": "Blood Magic",
      "level": 2,
      "notes": "",
      "description": "<p>A reaction to an attack: a shield of one's own blood absorbs the damage.</p><ul><li><strong>Critical Success:</strong> Lasts 1d3 rounds.</li><li><strong>Success:</strong> Absorbs all damage from 1 attack.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound &middot; <strong>Recipe:</strong> Rune + Blood Shield scroll + Vial with Blood (caster's own)</p>"
    }
  },
  {
    "_id": "bCQRO6mvGZlHe2EE",
    "name": "2 Sanguine Drain",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/stigmata-lorc.svg",
    "system": {
      "magicType": "Blood Magic",
      "level": 2,
      "notes": "",
      "description": "<p>Drains the target's blood and heals the caster.</p><ul><li><strong>Critical Success:</strong> Takes a wound from the caster and gives it to the target with heavy bleeding.</li><li><strong>Success:</strong> Weakens the target by Fatigue +2 and heals the caster by 1 WL; if the target is wounded, the wound opens as Heavy Bleeding.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound &middot; <strong>Recipe:</strong> Rune + Sanguine Drain scroll + Leech</p>"
    }
  },
  {
    "_id": "fpnsA2hOYc32lXVp",
    "name": "3 Blood Spike II",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/stigmata-lorc.svg",
    "system": {
      "magicType": "Blood Magic",
      "level": 3,
      "notes": "Magic Missile",
      "description": "<p>Creates a magical spike that deals Piercing dmg.</p><ul><li><strong>Critical Success:</strong> Extra damage.</li><li><strong>Success:</strong> Sends a stronger blood spike (high velocity) at the target, a heavy bleeder wound.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound (Missile) &middot; <strong>Recipe:</strong> Blood Spike I Rune + Bone Shard + Wraithstone (Nat.)</p>"
    }
  },
  {
    "_id": "g7aQSRGtW83tG4vy",
    "name": "3 Hemorrhage",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/stigmata-lorc.svg",
    "system": {
      "magicType": "Blood Magic",
      "level": 3,
      "notes": "",
      "description": "<p>Makes the target's wounds bleed out and weakens them.</p><ul><li><strong>Critical Success:</strong> All wounds bleed (heavy bleeder) and a new laceration opens (heavy bleeder).</li><li><strong>Success:</strong> All wounds bleed (heavy bleeder).</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Nat.) &middot; <strong>Recipe:</strong> Rune + Hemorrhage scroll + Leech + Wraithstone (Nat.)</p>"
    }
  },
  {
    "_id": "769Arrx5oi8Pssos",
    "name": "3 Self-harm",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/stigmata-lorc.svg",
    "system": {
      "magicType": "Blood Magic",
      "level": 3,
      "notes": "",
      "description": "<p>The target cannot resist the urge to wound themselves.</p><ul><li><strong>Critical Success:</strong> The target harms themselves with their own weapon and loses 1d3 rounds; they do not defend, because they want to feel the pain, and can be stopped by allies (through their own action).</li><li><strong>Success:</strong> The target harms themselves with their own weapon and loses a round; they do not defend, because they want to feel the pain, and can be stopped by allies (through their own action).</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Nat.) &middot; <strong>Recipe:</strong> Rune + Self-harm scroll + Knife + Wraithstone (Nat.)</p>"
    }
  },
  {
    "_id": "i0XhVtm91zO0rCLT",
    "name": "4 Rend",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/stigmata-lorc.svg",
    "system": {
      "magicType": "Blood Magic",
      "level": 4,
      "notes": "Magic Missile",
      "description": "<p>Tears flesh and armor alike, dealing Edge dmg and rending armor.</p><ul><li><strong>Critical Success:</strong> Stronger edge dmg, heavy bleeder, and completely destroys the armor at that spot.</li><li><strong>Success:</strong> Edge dmg; removes 1 point of the armor's AQ at the struck spot.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Bound (Missile) &middot; <strong>Recipe:</strong> Rune + Rend scroll + Knife + Wraithstone (Nat.)</p>"
    }
  },
  {
    "_id": "5WBCvjRzepiGJFex",
    "name": "4 Bone Shatter",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/stigmata-lorc.svg",
    "system": {
      "magicType": "Blood Magic",
      "level": 4,
      "notes": "L3+ fracture",
      "description": "<p>Shatters the target's bone or a held weapon.</p><ul><li><strong>Critical Success:</strong> Breaks a limb and a weapon.</li><li><strong>Success:</strong> Breaks a limb or a held weapon.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Nat.) &middot; <strong>Recipe:</strong> Rune + Bone Shatter scroll + Bone Shard + Wraithstone (Nat.)</p>"
    }
  },
  {
    "_id": "qyzJZZOiD9FA2O5w",
    "name": "4 Boil Blood",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/stigmata-lorc.svg",
    "system": {
      "magicType": "Blood Magic",
      "level": 4,
      "notes": "",
      "description": "<p>Boils the target's blood from within for 1d3 rounds, causing pain and leaving internal injury.</p><ul><li><strong>Critical Success:</strong> The pain is extreme; for 1d3 rounds the target is fully crippled by pain, leaving a Serious wound.</li><li><strong>Success:</strong> For 1d3 rounds the target writhes in pain on the ground (Proned) and can only defend, leaving a Minor wound.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Nat.) &middot; <strong>Recipe:</strong> Rune + Boil Blood scroll + Ruby + Wraithstone (Nat.)</p>"
    }
  },
  {
    "_id": "y4rTTXHbMzyTydPm",
    "name": "4 Crimson Bond",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/stigmata-lorc.svg",
    "system": {
      "magicType": "Blood Magic",
      "level": 4,
      "notes": "",
      "description": "<p>Binds two beings by blood; they share damage.</p><ul><li><strong>Critical Success:</strong> The two beings also pass all wounds suffered so far between them (copying the exact same wounds regardless of differing armor); lasts the whole fight.</li><li><strong>Success:</strong> The two beings share suffered damage for 3 rounds; if one is hit, the other takes the same impact (then proceeds by its own armor value).</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Nat.) &middot; <strong>Recipe:</strong> Rune + Crimson Bond scroll + Braided Vein + Wraithstone (Nat.)</p>"
    }
  },
  {
    "_id": "6ULgbgSfr7wXo0iM",
    "name": "5 Blood Puppet",
    "type": "spell",
    "img": "systems/scarmark/icons/magic/stigmata-lorc.svg",
    "system": {
      "magicType": "Blood Magic",
      "level": 5,
      "notes": "",
      "description": "<p>Seizes control of the target's body through its blood; the body obeys and the mind is helpless.</p><ul><li><strong>Critical Success:</strong> Seizes the target's physical movements and claims them until Dispel or the caster's death.</li><li><strong>Success:</strong> Seizes the target's physical movements and claims them for 1d3 rounds.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> Ego (Nat.) &middot; <strong>Recipe:</strong> Rune + Blood Puppet scroll + Vial with Blood (target's fresh blood) + Wraithstone (Nat.)</p>"
    }
  },
  {
    "_id": "EbxI8inhYva1z7Si",
    "name": "2 Elder Memory (Runeless)",
    "type": "spell",
    "img": "systems/scarmark/icons/religion/woman-elf-face-delapouite.svg",
    "system": {
      "magicType": "Fey Magic",
      "level": 2,
      "notes": "Runeless (aura). High-elf only.",
      "description": "<p>Elven boundless memory: a converse with a place's past and the land's spirits, recalling knowledge no living soul knows.</p><ul><li><strong>Critical Success:</strong> A clear, complete memory / an answer from the land's spirit.</li><li><strong>Success:</strong> A hazy image of the past / a fragment of ancient knowledge.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> No</p>"
    }
  },
  {
    "_id": "8HpsQY4KxSMinQt2",
    "name": "3 Silence (Runeless)",
    "type": "spell",
    "img": "systems/scarmark/icons/religion/woman-elf-face-delapouite.svg",
    "system": {
      "magicType": "Fey Magic",
      "level": 3,
      "notes": "Runeless (aura). High-elf only.",
      "description": "<p>An ancient elven song that pervades the mind and blocks magic.</p><ul><li><strong>Critical Success:</strong> For 3 rounds it fully blocks all further magic and cancels all magical effects.</li><li><strong>Success:</strong> For 1d3 rounds it fully blocks all further magic except the Fey Magic user's.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> No</p>"
    }
  },
  {
    "_id": "0ufoXANUyGG1MOxH",
    "name": "5 Moonfire (Runeless)",
    "type": "spell",
    "img": "systems/scarmark/icons/religion/woman-elf-face-delapouite.svg",
    "system": {
      "magicType": "Fey Magic",
      "level": 5,
      "notes": "Runeless (aura). High-elf only. Anti-dark/undead.",
      "description": "<p>A silver elven fire that heals the pure and allies but burns enemies, with a heightened effect on the corrupt, undead and dark.</p><ul><li><strong>Critical Success:</strong> Heals 3 WL for allies, deals Serious 3 burns to enemies, and Grievous burns to the undead and dark.</li><li><strong>Success:</strong> Heals 2 WL for allies, deals Serious 2 burns to enemies, and Serious 3 burns to the undead and dark.</li><li><strong>Failure:</strong> Spell fails</li><li><strong>Critical Failure:</strong> Spell Misfire + Aural Shock</li></ul><p><strong>Rune:</strong> No</p>"
    }
  }
];

  const wasLocked = pack.locked;
  if ( wasLocked ) await pack.configure({ locked: false });
  try {
    await pack.getIndex();
    const ids = [...pack.index.keys()];
    if ( ids.length ) await pack.documentClass.deleteDocuments(ids, { pack: PACK });

    const folderByName = {};
    for ( const name of SCHOOLS ) {
      let f = pack.folders.find(x => x.name === name);
      if ( !f ) f = await Folder.create({ name, type: "Item" }, { pack: PACK });
      folderByName[name] = f.id;
    }

    const data = SPELLS.map(s => ({ ...s, folder: folderByName[s.system.magicType] ?? null }));
    const created = await pack.documentClass.createDocuments(data, { pack: PACK, keepId: true });

    ui.notifications.info(`Arcane: imported ${created.length} spell(s) into "${pack.metadata.label}".`);
    console.log("Scarmark | Arcane import complete", { created: created.length, folders: SCHOOLS.length });
  } finally {
    if ( wasLocked ) await pack.configure({ locked: true });
  }
})();
