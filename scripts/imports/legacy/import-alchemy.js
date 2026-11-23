/**
 * Scarmark — Import: Alchemy (full re-import, 2026-09-26)
 * -------------------------------------------------------
 * Source : Scarmark_Gear.xlsx (sheets Herbs, Alchemy, Healing [Herbalist], Poisons), synced with Scarmark_Alchemy.docx.
 * 162 Items in D.'s compendium layout:
 *   <root>: Alchemy Kit I-III, Herbalist Kit
 *   Arcane Booster / Herbalist / Herbs / Herbs - Exotic / Ingredients / Narcotic / Poisons /
 *   Potions > Potions I / Potions II / Potions III
 * Note = effects (English). Description = extra info lines, a rule, then "Recipe: ..." (or just the recipe).
 * Potions, herbalist products and smokeables carry an Active Effect that applies only on Consume (transfer off);
 * ingredients, kits and poisons are plain gear (the poisoning itself is a separate effect/injury).
 *
 * TARGET: by default everything lands in a WORLD Item folder "Alchemy" with that layout; drag the subfolders
 * (and the four kits) into the Alchemy compendium. Set PACK = "scarmark.alchemy" to write straight into the
 * compendium root instead (empty it first, this macro never deletes anything).
 * Create-missing-only: an Item with the same name already in the target folder is skipped, so re-running is safe.
 *
 * HOW TO USE: Foundry (as GM) -> Macros -> new "Script" macro -> paste -> Execute.
 */
(async () => {
  if ( !game.user?.isGM ) return ui.notifications.error("Alchemy import: must be run by a GM.");

  const PACK = null;            // e.g. "scarmark.alchemy" to import straight into the compendium
  const ROOT = "Alchemy";       // world parent folder (ignored when PACK is set)
  const FOLDERS = ["Arcane Booster", "Herbalist", "Herbs", "Herbs - Exotic", "Ingredients", "Narcotic", "Poisons", "Potions", "Potions/Potions I", "Potions/Potions II", "Potions/Potions III"];
  const ITEMS = [
 {
  "name": "Mix of Herbs (Common)",
  "folder": "Herbs",
  "img": "systems/scarmark/icons/gear/herbs-bundle-delapouite.svg",
  "system": {
   "weight": 0.1,
   "value": 5.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Mix of common herbs",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Mix of Herbs (Uncommon)",
  "folder": "Herbs",
  "img": "systems/scarmark/icons/gear/herbs-bundle-delapouite.svg",
  "system": {
   "weight": 0.1,
   "value": 25.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Mix of uncommon herbs",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Mix of Herbs (Rare)",
  "folder": "Herbs",
  "img": "systems/scarmark/icons/gear/herbs-bundle-delapouite.svg",
  "system": {
   "weight": 0.1,
   "value": 100.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Mix of rare herbs",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Tea leaves (herbal tea)",
  "folder": "Herbs - Exotic",
  "img": "systems/scarmark/icons/gear/three-leaves-lorc.svg",
  "system": {
   "weight": 0.0,
   "value": 2.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Tea leaves (luxury)",
  "folder": "Herbs - Exotic",
  "img": "systems/scarmark/icons/gear/three-leaves-lorc.svg",
  "system": {
   "weight": 0.0,
   "value": 20.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Tobacco (common)",
  "folder": "Herbs - Exotic",
  "img": "systems/scarmark/icons/gear/three-leaves-lorc.svg",
  "system": {
   "weight": 0.0,
   "value": 3.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Calms the mind",
   "description": "<p>Duration: 1 hour</p>"
  },
  "effects": [
   {
    "name": "Tobacco (common)",
    "img": "systems/scarmark/icons/gear/three-leaves-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>INT +1</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.attributes.int.base",
       "value": 1,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Tobacco (luxury)",
  "folder": "Herbs - Exotic",
  "img": "systems/scarmark/icons/gear/three-leaves-lorc.svg",
  "system": {
   "weight": 0.0,
   "value": 45.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Calms the mind, social status image",
   "description": "<p>Duration: 2 hours</p>"
  },
  "effects": [
   {
    "name": "Tobacco (luxury)",
    "img": "systems/scarmark/icons/gear/three-leaves-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>INT +1, WIL +1</p>",
    "duration": {
     "value": 7200,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.attributes.int.base",
       "value": 1,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.attributes.wil.base",
       "value": 1,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Weed",
  "folder": "Herbs - Exotic",
  "img": "systems/scarmark/icons/gear/hemp-delapouite.svg",
  "system": {
   "weight": 0.0,
   "value": 60.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Causes random and uncontrolled laughter",
   "description": "<p>Duration: 3 hours</p>"
  },
  "effects": [
   {
    "name": "Weed",
    "img": "systems/scarmark/icons/gear/three-leaves-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>Injury −1, AWARENESS −10, Combat −10, Arcane Magic +10</p>",
    "duration": {
     "value": 10800,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.injury",
       "value": -1,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skill.AWARENESS",
       "value": -10,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skills.combat",
       "value": -10,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skill.Arcane Magic",
       "value": 10,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Coffee Beans",
  "folder": "Herbs - Exotic",
  "img": "systems/scarmark/icons/gear/swap-bag-lorc.svg",
  "system": {
   "weight": 0.1,
   "value": 12.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Chocolate Beans",
  "folder": "Herbs - Exotic",
  "img": "systems/scarmark/icons/gear/swap-bag-lorc.svg",
  "system": {
   "weight": 0.1,
   "value": 30.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Cinnamon",
  "folder": "Herbs - Exotic",
  "img": "systems/scarmark/icons/gear/swap-bag-lorc.svg",
  "system": {
   "weight": 0.01,
   "value": 20.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Exotic reagent: Potion of Dodging III, Elvenjäger’s Decoction III, Deft Hands III",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Pepper",
  "folder": "Herbs - Exotic",
  "img": "systems/scarmark/icons/gear/swap-bag-lorc.svg",
  "system": {
   "weight": 0.01,
   "value": 15.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Exotic reagent: Potion of Might III, Berserker’s Fury III",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Star Anise",
  "folder": "Herbs - Exotic",
  "img": "systems/scarmark/icons/gear/swap-bag-lorc.svg",
  "system": {
   "weight": 0.01,
   "value": 20.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Exotic reagent: Elixir of Focus III, Resolve Potion III, Arcane Draught III, Spellmend",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Myrtle",
  "folder": "Herbs - Exotic",
  "img": "systems/scarmark/icons/gear/swap-bag-lorc.svg",
  "system": {
   "weight": 0.01,
   "value": 15.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Exotic reagent: Ironhide Salve III, Luxury Perfume",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Ginger",
  "folder": "Herbs - Exotic",
  "img": "systems/scarmark/icons/gear/swap-bag-lorc.svg",
  "system": {
   "weight": 0.01,
   "value": 15.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Exotic reagent: Second Wind III, Vitality Potion III, Warming Salve",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Saffron",
  "folder": "Herbs - Exotic",
  "img": "systems/scarmark/icons/gear/swap-bag-lorc.svg",
  "system": {
   "weight": 0.01,
   "value": 60.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Exotic reagent: Mending Draught III, Lebenstrank Tincture",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Nutmeg",
  "folder": "Herbs - Exotic",
  "img": "systems/scarmark/icons/gear/swap-bag-lorc.svg",
  "system": {
   "weight": 0.01,
   "value": 25.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Exotic reagent: Owl Draught III, Potion of Shadow III, Potion of Steady Hand III",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Clove",
  "folder": "Herbs - Exotic",
  "img": "systems/scarmark/icons/gear/swap-bag-lorc.svg",
  "system": {
   "weight": 0.01,
   "value": 20.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Exotic reagent: Numbing Salve III, Healing Draught III, Nimblefinger III",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Herbalist Kit",
  "folder": "",
  "img": "systems/scarmark/icons/skills/apothecary-DarkZaitzev.svg",
  "system": {
   "weight": 3.0,
   "value": 40.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Makes all herbalist products (no roll, just the recipe).",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Trollwurz",
  "folder": "Herbs",
  "img": "systems/scarmark/icons/gear/three-leaves-lorc.svg",
  "system": {
   "weight": 0.0,
   "value": 12.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Used in: Potion of Might, Berserker’s Fury, Ironhide Salve.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Nettle",
  "folder": "Herbs",
  "img": "systems/scarmark/icons/gear/three-leaves-lorc.svg",
  "system": {
   "weight": 0.0,
   "value": 5.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Used in: Second Wind, Vitality Potion, Stimulant Powder, Nettle Tonic, Horse Stimulant.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Marigold",
  "folder": "Herbs",
  "img": "systems/scarmark/icons/gear/three-leaves-lorc.svg",
  "system": {
   "weight": 0.0,
   "value": 5.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Used in: Healing Draught, Mending Draught, Marigold Salve, Bloodcleaner Tincture, Purging Poultice, Curative Decoction, Rune: Heal.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Chamomile",
  "folder": "Herbs",
  "img": "systems/scarmark/icons/gear/three-leaves-lorc.svg",
  "system": {
   "weight": 0.0,
   "value": 5.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Used in: Potion of Steady Hand, Antidote, Chamomile Tea.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Sage",
  "folder": "Herbs",
  "img": "systems/scarmark/icons/gear/three-leaves-lorc.svg",
  "system": {
   "weight": 0.0,
   "value": 5.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Used in: Elixir of Focus, Arcane Draught, Spellmend, Resolve Potion, Sage Tea, Poison Detector Powder, Bloodcleaner Tincture, Lebenstrank Tincture, Purging Poultice, Curative Decoction.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Mint",
  "folder": "Herbs",
  "img": "systems/scarmark/icons/gear/three-leaves-lorc.svg",
  "system": {
   "weight": 0.0,
   "value": 5.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Used in: Potion of Dodging, Elvenjäger’s Decoction, Nimblefinger, Deft Hands, Mint Infusion.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Mandrake",
  "folder": "Herbs",
  "img": "systems/scarmark/icons/gear/three-leaves-lorc.svg",
  "system": {
   "weight": 0.0,
   "value": 12.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Used in: Numbing Salve, Church Sacrament, Whiplash, Pain-Ease Balm, Lebenstrank Tincture, Rune: Deadly Tendril.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Belladonna",
  "folder": "Herbs",
  "img": "systems/scarmark/icons/gear/three-leaves-lorc.svg",
  "system": {
   "weight": 0.0,
   "value": 12.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Also a poison plant: Staggerbane Extract",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Lavender",
  "folder": "Herbs",
  "img": "systems/scarmark/icons/gear/three-leaves-lorc.svg",
  "system": {
   "weight": 0.0,
   "value": 5.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Used in: Silvertongue, Common Perfume, Luxury Perfume, Makeup, Lavender Water.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Valerian",
  "folder": "Herbs",
  "img": "systems/scarmark/icons/gear/three-leaves-lorc.svg",
  "system": {
   "weight": 0.0,
   "value": 12.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Used in: Potion of Shadow, Valerian Draught, Rune: Disguise III, Rune: Sleep I.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Wormwood",
  "folder": "Herbs",
  "img": "systems/scarmark/icons/gear/three-leaves-lorc.svg",
  "system": {
   "weight": 0.0,
   "value": 12.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Used in: Ordeal Drug, Herbal Antivenin, Invisible Ink, Wretchbane Powder.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Hemlock",
  "folder": "Herbs",
  "img": "systems/scarmark/icons/gear/three-leaves-lorc.svg",
  "system": {
   "weight": 0.0,
   "value": 60.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Poison: Stillhand Ointment",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Foxglove",
  "folder": "Herbs",
  "img": "systems/scarmark/icons/gear/three-leaves-lorc.svg",
  "system": {
   "weight": 0.0,
   "value": 80.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Poison: Ashen Draught",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Wolfsbane",
  "folder": "Herbs",
  "img": "systems/scarmark/icons/gear/three-leaves-lorc.svg",
  "system": {
   "weight": 0.0,
   "value": 70.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Poison: Gravekiss Extract",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Henbane",
  "folder": "Herbs",
  "img": "systems/scarmark/icons/gear/three-leaves-lorc.svg",
  "system": {
   "weight": 0.0,
   "value": 50.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Poison: Dreadmist Oil",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Comfrey",
  "folder": "Herbs",
  "img": "systems/scarmark/icons/gear/three-leaves-lorc.svg",
  "system": {
   "weight": 0.0,
   "value": 4.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Used in: Comfrey Cast.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Willow Bark",
  "folder": "Herbs",
  "img": "systems/scarmark/icons/gear/three-leaves-lorc.svg",
  "system": {
   "weight": 0.0,
   "value": 4.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Used in: Fever Remedy.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Thyme",
  "folder": "Herbs",
  "img": "systems/scarmark/icons/gear/three-leaves-lorc.svg",
  "system": {
   "weight": 0.0,
   "value": 3.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Used in: Cough Syrup.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Eyebright",
  "folder": "Herbs",
  "img": "systems/scarmark/icons/gear/three-leaves-lorc.svg",
  "system": {
   "weight": 0.0,
   "value": 4.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Used in: Eyebright Wash.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Magic Mushrooms",
  "folder": "Herbs",
  "img": "systems/scarmark/icons/gear/mushrooms-cluster-Delapouite.svg",
  "system": {
   "weight": 0.1,
   "value": 10.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Random narcotic effect",
   "description": "<p>Duration: 3 Hours</p><p>Effect: RANDOM effect + temporary Psyche trait. Never know how it ends.</p>"
  },
  "effects": []
 },
 {
  "name": "Young Sprout",
  "folder": "Herbs",
  "img": "systems/scarmark/icons/skills/tree-branch-lorc.svg",
  "system": {
   "weight": 0.1,
   "value": 5.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Used in: Rune: Entangle I.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Frankincense",
  "folder": "Herbs - Exotic",
  "img": "systems/scarmark/icons/gear/incense-lorc.svg",
  "system": {
   "weight": 0.01,
   "value": 20.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Resin for making incense (Censer & Incense). Incense repels all dark beings.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Poppy",
  "folder": "Herbs",
  "img": "systems/scarmark/icons/gear/poppy-quoting.svg",
  "system": {
   "weight": 0.0,
   "value": 12.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Poppy heads (makovice). Source of Opium; also for Poppy Tincture.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Alchemy Kit I",
  "folder": "",
  "img": "systems/scarmark/icons/skills/erlenmeyer-lorc.svg",
  "system": {
   "weight": 4.0,
   "value": 120.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Brews tier I potions (Alchemy).",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Alchemy Kit II",
  "folder": "",
  "img": "systems/scarmark/icons/skills/erlenmeyer-lorc.svg",
  "system": {
   "weight": 4.0,
   "value": 350.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Brews tier I-II potions (Alchemy); tier I at +10.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Alchemy Kit III",
  "folder": "",
  "img": "systems/scarmark/icons/skills/erlenmeyer-lorc.svg",
  "system": {
   "weight": 4.0,
   "value": 900.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Brews tier I-III potions (Alchemy); tier II at +10, tier I at +20.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Flask",
  "folder": "Ingredients",
  "img": "systems/scarmark/icons/gear/porcelain-vase-Delapouite.svg",
  "system": {
   "weight": 0.2,
   "value": 2.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Container for drinks, tinctures and powders.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Ointment Tube",
  "folder": "Ingredients",
  "img": "systems/scarmark/icons/gear/cloth-jar-delapouite.svg",
  "system": {
   "weight": 0.01,
   "value": 2.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Container for salves and pastes.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Cheap Booze",
  "folder": "Ingredients",
  "img": "systems/scarmark/icons/gear/jug-delapouite.svg",
  "system": {
   "weight": 1.0,
   "value": 6.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Used in: Herbal Booze.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Herbal Booze",
  "folder": "Ingredients",
  "img": "systems/scarmark/icons/gear/round-bottom-flask-lorc.svg",
  "system": {
   "weight": 0.3,
   "value": 6.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Used in: Potion of Might, Berserker’s Fury, Potion of Shadow, Luxury Perfume, Arcane Draught, Whiplash, Poppy Tincture, Bloodwither Tincture, Gravekiss Extract, Staggerbane Extract.",
   "description": "<p>Recipe: Common Herb Mix + Cheap Booze + 4x Flask (yields 4)</p>"
  },
  "effects": []
 },
 {
  "name": "Water",
  "folder": "Ingredients",
  "img": "systems/scarmark/icons/gear/water-drop-sbed.svg",
  "system": {
   "weight": 0.5,
   "value": 0.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Used in: Owl Draught, Potion of Shadow, Amphibious Potion, Elixir of Focus, Antidote, Stimulant Powder, Ordeal Drug, Chamomile Tea, Valerian Draught, Mint Infusion, Sage Tea, Nettle Tonic and 7 more.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Herbal Wine",
  "folder": "Ingredients",
  "img": "systems/scarmark/icons/gear/round-bottom-flask-lorc.svg",
  "system": {
   "weight": 0.3,
   "value": 7.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Used in: Potion of Might, Second Wind, Potion of Steady Hand, Potion of Dodging, Elvenjäger’s Decoction, Cat Senses, True Vision, Potion of Shadow, Nimblefinger, Silvertongue, Elixir of Focus, Spellmend and 10 more.",
   "description": "<p>Recipe: Common Herb Mix + Common Wine bottle + 4x Flask (yields 4)</p>"
  },
  "effects": []
 },
 {
  "name": "Essential Oil",
  "folder": "Ingredients",
  "img": "systems/scarmark/icons/gear/round-bottom-flask-lorc.svg",
  "system": {
   "weight": 0.2,
   "value": 6.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Used in: Ironhide Salve, Numbing Salve, Dark Vision, Common Perfume, Makeup, Marigold Salve, Pain-Ease Balm, Warming Salve, Lavender Water, Invisible Ink, Stillhand Ointment, Dreadmist Oil.",
   "description": "<p>Recipe: Common Herb Mix + 4x Lamp Oil + 4x Flask (yields 4)</p>"
  },
  "effects": []
 },
 {
  "name": "Sack of dried insect",
  "folder": "Ingredients",
  "img": "systems/scarmark/icons/gear/swap-bag-lorc.svg",
  "system": {
   "weight": 0.05,
   "value": 10.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Used in: Potion of Might, Berserker’s Fury, Cat Senses, True Vision, Arcane Draught, Spellmend, Mending Draught, Rune: Insect Swarm.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Talc",
  "folder": "Ingredients",
  "img": "systems/scarmark/icons/gear/swap-bag-lorc.svg",
  "system": {
   "weight": 0.1,
   "value": 1.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Used in: Ironhide Salve, Numbing Salve, Makeup, Stimulant Powder, Comfrey Cast, Poison Detector Powder, Purging Poultice, Wretchbane Powder.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Sugar",
  "folder": "Ingredients",
  "img": "systems/scarmark/icons/gear/swap-bag-lorc.svg",
  "system": {
   "weight": 0.1,
   "value": 1.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Used in: Second Wind, Potion of Steady Hand, Potion of Dodging, Elvenjäger’s Decoction, Owl Draught, Nimblefinger, Silvertongue, Antidote, Vitality Potion, Healing Draught, Deft Hands, Resolve Potion.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Salt",
  "folder": "Ingredients",
  "img": "systems/scarmark/icons/gear/swap-bag-lorc.svg",
  "system": {
   "weight": 0.1,
   "value": 1.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Used in: Rune: Frostbite I.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Honey",
  "folder": "Ingredients",
  "img": "systems/scarmark/icons/gear/honey-jar-Delapouite.svg",
  "system": {
   "weight": 0.1,
   "value": 2.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Used in: Cough Syrup.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Beeswax",
  "folder": "Ingredients",
  "img": "systems/scarmark/icons/gear/honeycomb-lorc.svg",
  "system": {
   "weight": 0.2,
   "value": 2.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Used in: Marigold Salve, Pain-Ease Balm, Warming Salve, Stillhand Ointment, Rune: Disguise I.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Toad Venom",
  "folder": "Ingredients",
  "img": "systems/scarmark/icons/gear/poison-bottle-lorc.svg",
  "system": {
   "weight": 0.1,
   "value": 20.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Used in: Amphibious Potion, Rune: Paralysis.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Spider Venom",
  "folder": "Ingredients",
  "img": "systems/scarmark/icons/gear/poison-bottle-lorc.svg",
  "system": {
   "weight": 0.1,
   "value": 25.0,
   "quantity": 1,
   "consumable": false,
   "carried": true,
   "notes": "Used in: Bloodwither Tincture, Rune: Mass Paralysis.",
   "description": ""
  },
  "effects": []
 },
 {
  "name": "Potion of Might I (15)",
  "folder": "Potions/Potions I",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 60.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "CLOSE COMBAT +10",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -15</p><hr><p>Recipe: Common Herb Mix + Herbal Wine + Trollwurz + Flask</p>"
  },
  "effects": [
   {
    "name": "Potion of Might I (15)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -15, CLOSE COMBAT +10</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -15,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skill.CLOSE COMBAT",
       "value": 10,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Potion of Might II (20)",
  "folder": "Potions/Potions II",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 150.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "CLOSE COMBAT +20",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -20</p><hr><p>Recipe: Uncommon Herb Mix + Booze + Trollwurz + Dried insect + Flask</p>"
  },
  "effects": [
   {
    "name": "Potion of Might II (20)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -20, CLOSE COMBAT +20</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -20,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skill.CLOSE COMBAT",
       "value": 20,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Potion of Might III (25)",
  "folder": "Potions/Potions III",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 400.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "CLOSE COMBAT +30 (CF VITALITY = collapse)",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -25</p><hr><p>Recipe: Rare Herb Mix + Booze + Trollwurz + Dried insect + Pepper + Flask</p>"
  },
  "effects": [
   {
    "name": "Potion of Might III (25)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -25, CLOSE COMBAT +30 (CF VITALITY = collapse)</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -25,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skill.CLOSE COMBAT",
       "value": 30,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Berserker’s Fury I (15)",
  "folder": "Potions/Potions I",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 100.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Melee Defense -10, STR +2, Impact +1",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -15</p><hr><p>Recipe: Common Herb Mix + Booze + Trollwurz + Flask</p>"
  },
  "effects": [
   {
    "name": "Berserker’s Fury I (15)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -15, Melee Defense -10, STR +2, Impact +1</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -15,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.meleeDefense",
       "value": -10,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.attributes.str.base",
       "value": 2,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.impact",
       "value": 1,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Berserker’s Fury II (20)",
  "folder": "Potions/Potions II",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 200.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Melee Defense -10, STR +3, Impact +2",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -20</p><hr><p>Recipe: Uncommon Herb Mix + Booze + Trollwurz + Dried insect + Flask</p>"
  },
  "effects": [
   {
    "name": "Berserker’s Fury II (20)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -20, Melee Defense -10, STR +3, Impact +2</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -20,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.meleeDefense",
       "value": -10,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.attributes.str.base",
       "value": 3,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.impact",
       "value": 2,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Berserker’s Fury III (25)",
  "folder": "Potions/Potions III",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 400.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Melee Defense -15, STR +4, Impact +3",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -25</p><hr><p>Recipe: Rare Herb Mix + Booze + Trollwurz + Dried insect + Pepper + Flask</p>"
  },
  "effects": [
   {
    "name": "Berserker’s Fury III (25)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -25, Melee Defense -15, STR +4, Impact +3</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -25,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.meleeDefense",
       "value": -15,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.attributes.str.base",
       "value": 4,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.impact",
       "value": 3,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Ironhide Salve I (10)",
  "folder": "Potions/Potions I",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 50.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Armor +1 (all locations), AGL -2",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -10</p><hr><p>Recipe: Common Herb Mix + Essential Oil + Trollwurz + Ointment Tube</p>"
  },
  "effects": [
   {
    "name": "Ironhide Salve I (10)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -10, Armor +1 (all locations), AGL -2</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -10,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.attributes.agl.base",
       "value": -2,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Ironhide Salve II (15)",
  "folder": "Potions/Potions II",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 130.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Armor +2 (all locations), AGL -3",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -15</p><hr><p>Recipe: Uncommon Herb Mix + Essential Oil + Trollwurz + Talc + Ointment Tube</p>"
  },
  "effects": [
   {
    "name": "Ironhide Salve II (15)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -15, Armor +2 (all locations), AGL -3</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -15,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.attributes.agl.base",
       "value": -3,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Ironhide Salve III (20)",
  "folder": "Potions/Potions III",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 360.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Armor +3 (all locations), AGL -4",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -20</p><hr><p>Recipe: Rare Herb Mix + Essential Oil + Trollwurz + Talc + Myrtle + Ointment Tube</p>"
  },
  "effects": [
   {
    "name": "Ironhide Salve III (20)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -20, Armor +3 (all locations), AGL -4</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -20,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.attributes.agl.base",
       "value": -4,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Second Wind I (10)",
  "folder": "Potions/Potions I",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 50.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Endurance +5",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -10</p><hr><p>Recipe: Common Herb Mix + Herbal Wine + Nettle + Flask</p>"
  },
  "effects": [
   {
    "name": "Second Wind I (10)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -10, Endurance +5</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -10,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.endurance",
       "value": 5,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Second Wind II (15)",
  "folder": "Potions/Potions II",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 130.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Endurance +7",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -15</p><hr><p>Recipe: Uncommon Herb Mix + Herbal Wine + Nettle + Sugar + Flask</p>"
  },
  "effects": [
   {
    "name": "Second Wind II (15)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -15, Endurance +7</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -15,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.endurance",
       "value": 7,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Second Wind III (20)",
  "folder": "Potions/Potions III",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 360.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Endurance +9",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -20</p><hr><p>Recipe: Rare Herb Mix + Herbal Wine + Nettle + Sugar + Ginger + Flask</p>"
  },
  "effects": [
   {
    "name": "Second Wind III (20)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -20, Endurance +9</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -20,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.endurance",
       "value": 9,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Numbing Salve I",
  "folder": "Potions/Potions I",
  "img": "systems/scarmark/icons/gear/health-potion-Delapouite.svg",
  "system": {
   "weight": 0.5,
   "value": 100.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Injury -1; Fatigue +1",
   "description": "<p>Duration: 1 Hour</p><hr><p>Recipe: Common Herb Mix + Essential Oil + Mandrake + Ointment Tube</p>"
  },
  "effects": [
   {
    "name": "Numbing Salve I",
    "img": "systems/scarmark/icons/gear/health-potion-Delapouite.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>Injury -1; Fatigue +1</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.injury",
       "value": -1,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.resources.fatigue",
       "value": 1,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Numbing Salve II",
  "folder": "Potions/Potions II",
  "img": "systems/scarmark/icons/gear/health-potion-Delapouite.svg",
  "system": {
   "weight": 0.5,
   "value": 200.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Injury -3; Fatigue +1",
   "description": "<p>Duration: 1 Hour</p><hr><p>Recipe: Uncommon Herb Mix + Essential Oil + Mandrake + Talc + Ointment Tube</p>"
  },
  "effects": [
   {
    "name": "Numbing Salve II",
    "img": "systems/scarmark/icons/gear/health-potion-Delapouite.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>Injury -3; Fatigue +1</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.injury",
       "value": -3,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.resources.fatigue",
       "value": 1,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Numbing Salve III",
  "folder": "Potions/Potions III",
  "img": "systems/scarmark/icons/gear/health-potion-Delapouite.svg",
  "system": {
   "weight": 0.5,
   "value": 400.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Injury = 0",
   "description": "<p>Duration: 1 Hour</p><hr><p>Recipe: Rare Herb Mix + Essential Oil + Mandrake + Talc + Clove + Ointment Tube</p>"
  },
  "effects": [
   {
    "name": "Numbing Salve III",
    "img": "systems/scarmark/icons/gear/health-potion-Delapouite.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>Injury = 0</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.injury",
       "value": 0,
       "priority": 50,
       "type": "override",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Potion of Steady Hand I (5)",
  "folder": "Potions/Potions I",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 50.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "RANGED COMBAT +10",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -5</p><hr><p>Recipe: Common Herb Mix + Herbal Wine + Chamomile + Flask</p>"
  },
  "effects": [
   {
    "name": "Potion of Steady Hand I (5)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -5, RANGED COMBAT +10</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -5,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skill.RANGED COMBAT",
       "value": 10,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Potion of Steady Hand II (10)",
  "folder": "Potions/Potions II",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 120.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "RANGED COMBAT +20",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -10</p><hr><p>Recipe: Uncommon Herb Mix + Herbal Wine + Chamomile + Sugar + Flask</p>"
  },
  "effects": [
   {
    "name": "Potion of Steady Hand II (10)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -10, RANGED COMBAT +20</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -10,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skill.RANGED COMBAT",
       "value": 20,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Potion of Steady Hand III (15)",
  "folder": "Potions/Potions III",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 340.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "RANGED COMBAT +30",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -15</p><hr><p>Recipe: Rare Herb Mix + Herbal Wine + Chamomile + Sugar + Nutmeg + Flask</p>"
  },
  "effects": [
   {
    "name": "Potion of Steady Hand III (15)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -15, RANGED COMBAT +30</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -15,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skill.RANGED COMBAT",
       "value": 30,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Potion of Dodging I (10)",
  "folder": "Potions/Potions I",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 50.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "DODGE +15",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -10</p><hr><p>Recipe: Common Herb Mix + Herbal Wine + Mint + Flask</p>"
  },
  "effects": [
   {
    "name": "Potion of Dodging I (10)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -10, DODGE +15</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -10,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skill.DODGE",
       "value": 15,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Potion of Dodging II (15)",
  "folder": "Potions/Potions II",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 120.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "DODGE +25",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -15</p><hr><p>Recipe: Uncommon Herb Mix + Herbal Wine + Mint + Sugar + Flask</p>"
  },
  "effects": [
   {
    "name": "Potion of Dodging II (15)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -15, DODGE +25</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -15,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skill.DODGE",
       "value": 25,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Potion of Dodging III (20)",
  "folder": "Potions/Potions III",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 340.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "DODGE +35",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -20</p><hr><p>Recipe: Rare Herb Mix + Herbal Wine + Mint + Sugar + Cinnamon + Flask</p>"
  },
  "effects": [
   {
    "name": "Potion of Dodging III (20)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -20, DODGE +35</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -20,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skill.DODGE",
       "value": 35,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Elvenjäger’s Decoction I (15)",
  "folder": "Potions/Potions I",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 70.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "RANGED COMBAT +10, DODGE +15",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -15</p><hr><p>Recipe: Common Herb Mix + Herbal Wine + Mint + Flask</p>"
  },
  "effects": [
   {
    "name": "Elvenjäger’s Decoction I (15)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -15, RANGED COMBAT +10, DODGE +15</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -15,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skill.RANGED COMBAT",
       "value": 10,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skill.DODGE",
       "value": 15,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Elvenjäger’s Decoction II (20)",
  "folder": "Potions/Potions II",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 180.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "RANGED COMBAT +20, DODGE +25",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -20</p><hr><p>Recipe: Uncommon Herb Mix + Herbal Wine + Mint + Sugar + Flask</p>"
  },
  "effects": [
   {
    "name": "Elvenjäger’s Decoction II (20)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -20, RANGED COMBAT +20, DODGE +25</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -20,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skill.RANGED COMBAT",
       "value": 20,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skill.DODGE",
       "value": 25,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Elvenjäger’s Decoction III (25)",
  "folder": "Potions/Potions III",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 450.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "RANGED COMBAT +30, DODGE +35",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -25</p><hr><p>Recipe: Rare Herb Mix + Herbal Wine + Mint + Sugar + Cinnamon + Flask</p>"
  },
  "effects": [
   {
    "name": "Elvenjäger’s Decoction III (25)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -25, RANGED COMBAT +30, DODGE +35</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -25,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skill.RANGED COMBAT",
       "value": 30,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skill.DODGE",
       "value": 35,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Owl Draught III (15)",
  "folder": "Potions/Potions III",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 280.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "EYE +6, HRG +6, SML +6",
   "description": "<p>Duration: 2 Hours</p><p>Toxicity: -15</p><hr><p>Recipe: Rare Herb Mix + Water + Belladonna + Sugar + Nutmeg + Flask</p>"
  },
  "effects": [
   {
    "name": "Owl Draught III (15)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -15, EYE +6, HRG +6, SML +6</p>",
    "duration": {
     "value": 7200,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -15,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.attributes.eye.base",
       "value": 6,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.attributes.hrg.base",
       "value": 6,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.attributes.sml.base",
       "value": 6,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Cat Senses I (10)",
  "folder": "Potions/Potions I",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 120.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "EYE +6, HRG +6, SML +6, Feel Tremor vision (tremorsense) [vision hook]",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -10</p><hr><p>Recipe: Common Herb Mix + Herbal Wine + Belladonna + Flask</p>"
  },
  "effects": [
   {
    "name": "Cat Senses I (10)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -10, EYE +6, HRG +6, SML +6, Feel Tremor vision (tremorsense) [vision hook]</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -10,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.attributes.eye.base",
       "value": 6,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.attributes.hrg.base",
       "value": 6,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.attributes.sml.base",
       "value": 6,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Cat Senses II (15)",
  "folder": "Potions/Potions II",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 320.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "EYE +8, HRG +8, SML +8, Feel Tremor (larger radius) [vision hook]",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -15</p><hr><p>Recipe: Uncommon Herb Mix + Herbal Wine + Belladonna + Dried insect + Flask</p>"
  },
  "effects": [
   {
    "name": "Cat Senses II (15)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -15, EYE +8, HRG +8, SML +8, Feel Tremor (larger radius) [vision hook]</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -15,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.attributes.eye.base",
       "value": 8,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.attributes.hrg.base",
       "value": 8,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.attributes.sml.base",
       "value": 8,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Dark Vision I (5)",
  "folder": "Potions/Potions I",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 90.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Darkvision 20 ft [vision hook]",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -5</p><hr><p>Recipe: Common Herb Mix + Essential Oil + Belladonna + Ointment Tube</p>"
  },
  "effects": [
   {
    "name": "Dark Vision I (5)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -5, Darkvision 20 ft [vision hook]</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -5,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Dark Vision II (10)",
  "folder": "Potions/Potions II",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 240.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Darkvision 30 ft [vision hook]",
   "description": "<p>Duration: 2 Hours</p><p>Toxicity: -10</p><hr><p>Recipe: Uncommon Herb Mix + Essential Oil + Belladonna + Ointment Tube</p>"
  },
  "effects": [
   {
    "name": "Dark Vision II (10)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -10, Darkvision 30 ft [vision hook]</p>",
    "duration": {
     "value": 7200,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -10,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "True Vision I (10)",
  "folder": "Potions/Potions I",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 140.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "see invisible/hidden [vision hook]",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -10</p><hr><p>Recipe: Common Herb Mix + Herbal Wine + Belladonna + Flask</p>"
  },
  "effects": [
   {
    "name": "True Vision I (10)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -10, see invisible/hidden [vision hook]</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -10,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "True Vision II (15)",
  "folder": "Potions/Potions II",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 360.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "see invisible/hidden (stronger) [vision hook]",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -15</p><hr><p>Recipe: Uncommon Herb Mix + Herbal Wine + Belladonna + Dried insect + Flask</p>"
  },
  "effects": [
   {
    "name": "True Vision II (15)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -15, see invisible/hidden (stronger) [vision hook]</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -15,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Potion of Shadow I (10)",
  "folder": "Potions/Potions I",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 50.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "STEALTH +10",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -10</p><hr><p>Recipe: Common Herb Mix + Water + Valerian + Flask</p>"
  },
  "effects": [
   {
    "name": "Potion of Shadow I (10)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -10, STEALTH +10</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -10,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skill.STEALTH",
       "value": 10,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Potion of Shadow II (15)",
  "folder": "Potions/Potions II",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 120.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "STEALTH +20",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -15</p><hr><p>Recipe: Uncommon Herb Mix + Herbal Wine + Valerian + Flask</p>"
  },
  "effects": [
   {
    "name": "Potion of Shadow II (15)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -15, STEALTH +20</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -15,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skill.STEALTH",
       "value": 20,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Potion of Shadow III (20)",
  "folder": "Potions/Potions III",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 350.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "STEALTH +30",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -20</p><hr><p>Recipe: Rare Herb Mix + Booze + Valerian + Nutmeg + Flask</p>"
  },
  "effects": [
   {
    "name": "Potion of Shadow III (20)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -20, STEALTH +30</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -20,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skill.STEALTH",
       "value": 30,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Nimblefinger I (5)",
  "folder": "Potions/Potions I",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 50.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Legerdemain +10, Lockcraft +10",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -5</p><hr><p>Recipe: Common Herb Mix + Herbal Wine + Mint + Flask</p>"
  },
  "effects": [
   {
    "name": "Nimblefinger I (5)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -5, Legerdemain +10, Lockcraft +10</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -5,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skill.Legerdemain",
       "value": 10,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skill.Lockcraft",
       "value": 10,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Nimblefinger II (10)",
  "folder": "Potions/Potions II",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 120.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Legerdemain +20, Lockcraft +20",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -10</p><hr><p>Recipe: Uncommon Herb Mix + Herbal Wine + Mint + Sugar + Flask</p>"
  },
  "effects": [
   {
    "name": "Nimblefinger II (10)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -10, Legerdemain +20, Lockcraft +20</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -10,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skill.Legerdemain",
       "value": 20,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skill.Lockcraft",
       "value": 20,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Nimblefinger III (15)",
  "folder": "Potions/Potions III",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 340.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Legerdemain +30, Lockcraft +30",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -15</p><hr><p>Recipe: Rare Herb Mix + Herbal Wine + Mint + Sugar + Clove + Flask</p>"
  },
  "effects": [
   {
    "name": "Nimblefinger III (15)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -15, Legerdemain +30, Lockcraft +30</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -15,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skill.Legerdemain",
       "value": 30,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skill.Lockcraft",
       "value": 30,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Silvertongue I (5)",
  "folder": "Potions/Potions I",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 50.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Communication +10",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -5</p><hr><p>Recipe: Common Herb Mix + Herbal Wine + Lavender + Flask</p>"
  },
  "effects": [
   {
    "name": "Silvertongue I (5)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -5, Communication +10</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -5,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skills.communication",
       "value": 10,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Silvertongue II (10)",
  "folder": "Potions/Potions II",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 130.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Communication +20",
   "description": "<p>Duration: 2 Hours</p><p>Toxicity: -10</p><hr><p>Recipe: Uncommon Herb Mix + Herbal Wine + Lavender + Sugar + Flask</p>"
  },
  "effects": [
   {
    "name": "Silvertongue II (10)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -10, Communication +20</p>",
    "duration": {
     "value": 7200,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -10,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skills.communication",
       "value": 20,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Amphibious Potion (10)",
  "folder": "Potions/Potions II",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 200.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Water breathing",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -10</p><hr><p>Recipe: Uncommon Herb Mix + Water + Toad Venom + Flask</p>"
  },
  "effects": [
   {
    "name": "Amphibious Potion (10)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -10, Water breathing</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -10,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Common Perfume",
  "folder": "Potions/Potions I",
  "img": "systems/scarmark/icons/gear/perfume-bottle-lorc.svg",
  "system": {
   "weight": 0.3,
   "value": 40.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "COM +2",
   "description": "<p>Duration: 4 Hours</p><hr><p>Recipe: Common Herb Mix + Essential Oil + Lavender + Flask</p>"
  },
  "effects": [
   {
    "name": "Common Perfume",
    "img": "systems/scarmark/icons/gear/perfume-bottle-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>COM +2</p>",
    "duration": {
     "value": 14400,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.attributes.com.base",
       "value": 2,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Luxury Perfume",
  "folder": "Potions/Potions II",
  "img": "systems/scarmark/icons/gear/perfume-bottle-lorc.svg",
  "system": {
   "weight": 0.3,
   "value": 120.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "COM +3, Communication +20",
   "description": "<p>Duration: 4 Hours</p><hr><p>Recipe: Uncommon Herb Mix + Booze + Lavender + Myrtle + Flask</p>"
  },
  "effects": [
   {
    "name": "Luxury Perfume",
    "img": "systems/scarmark/icons/gear/perfume-bottle-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>COM +3, Communication +20</p>",
    "duration": {
     "value": 14400,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.attributes.com.base",
       "value": 3,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skills.communication",
       "value": 20,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Makeup I",
  "folder": "Potions/Potions I",
  "img": "systems/scarmark/icons/gear/lipstick-Delapouite.svg",
  "system": {
   "weight": 0.2,
   "value": 30.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Acting +10",
   "description": "<p>Duration: 4 Hours</p><hr><p>Recipe: Common Herb Mix + Essential Oil + Lavender + Ointment Tube</p>"
  },
  "effects": [
   {
    "name": "Makeup I",
    "img": "systems/scarmark/icons/gear/lipstick-Delapouite.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>Acting +10</p>",
    "duration": {
     "value": 14400,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.Acting",
       "value": 10,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Makeup II",
  "folder": "Potions/Potions II",
  "img": "systems/scarmark/icons/gear/lipstick-Delapouite.svg",
  "system": {
   "weight": 0.2,
   "value": 90.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Acting +20",
   "description": "<p>Duration: 4 Hours</p><hr><p>Recipe: Uncommon Herb Mix + Essential Oil + Lavender + Talc + Ointment Tube</p>"
  },
  "effects": [
   {
    "name": "Makeup II",
    "img": "systems/scarmark/icons/gear/lipstick-Delapouite.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>Acting +20</p>",
    "duration": {
     "value": 14400,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.Acting",
       "value": 20,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Elixir of Focus I (5)",
  "folder": "Potions/Potions I",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 50.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "INT +2",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -5</p><hr><p>Recipe: Common Herb Mix + Water + Sage + Flask</p>"
  },
  "effects": [
   {
    "name": "Elixir of Focus I (5)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -5, INT +2</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -5,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.attributes.int.base",
       "value": 2,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Elixir of Focus II (10)",
  "folder": "Potions/Potions II",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 130.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "INT +3",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -10</p><hr><p>Recipe: Uncommon Herb Mix + Herbal Wine + Sage + Flask</p>"
  },
  "effects": [
   {
    "name": "Elixir of Focus II (10)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -10, INT +3</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -10,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.attributes.int.base",
       "value": 3,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Elixir of Focus III (15)",
  "folder": "Potions/Potions III",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 380.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "INT +4",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -15</p><hr><p>Recipe: Rare Herb Mix + Herbal Wine + Sage + Star Anise + Flask</p>"
  },
  "effects": [
   {
    "name": "Elixir of Focus III (15)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -15, INT +4</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -15,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.attributes.int.base",
       "value": 4,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Arcane Draught I (15)",
  "folder": "Arcane Booster",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 70.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "AUR +2",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -15</p><hr><p>Recipe: Common Herb Mix + Booze + Sage + Flask</p>"
  },
  "effects": [
   {
    "name": "Arcane Draught I (15)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -15, AUR +2</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -15,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.attributes.aur.base",
       "value": 2,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Arcane Draught II (20)",
  "folder": "Arcane Booster",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 170.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "AUR +3",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -20</p><hr><p>Recipe: Uncommon Herb Mix + Booze + Sage + Dried insect + Flask</p>"
  },
  "effects": [
   {
    "name": "Arcane Draught II (20)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -20, AUR +3</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -20,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.attributes.aur.base",
       "value": 3,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Arcane Draught III (25)",
  "folder": "Arcane Booster",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 450.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "AUR +4",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -25</p><hr><p>Recipe: Rare Herb Mix + Booze + Sage + Dried insect + Star Anise + Flask</p>"
  },
  "effects": [
   {
    "name": "Arcane Draught III (25)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -25, AUR +4</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -25,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.attributes.aur.base",
       "value": 4,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Spellmend (25)",
  "folder": "Arcane Booster",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 1500.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "For 1 hour every spell you cast improves by one success level (CF to F, F to S, S to CS).",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -25</p><hr><p>Recipe: Rare Herb Mix + Herbal Wine + Sage + Dried insect + Star Anise + Flask</p>"
  },
  "effects": [
   {
    "name": "Spellmend (25)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -25</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -25,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Antidote I",
  "folder": "Potions/Potions I",
  "img": "systems/scarmark/icons/gear/health-potion-Delapouite.svg",
  "system": {
   "weight": 0.5,
   "value": 80.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "VITALITY = 50, ignore all toxicity effects",
   "description": "<p>Duration: 1 Hour</p><hr><p>Recipe: Common Herb Mix + Water + Chamomile + Flask</p>"
  },
  "effects": [
   {
    "name": "Antidote I",
    "img": "systems/scarmark/icons/gear/health-potion-Delapouite.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY = 50, ignore all toxicity effects</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": 50,
       "priority": 50,
       "type": "override",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Antidote II",
  "folder": "Potions/Potions II",
  "img": "systems/scarmark/icons/gear/health-potion-Delapouite.svg",
  "system": {
   "weight": 0.5,
   "value": 200.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "VITALITY = 75, ignore all toxicity effects",
   "description": "<p>Duration: 1 Hour</p><hr><p>Recipe: Uncommon Herb Mix + Herbal Wine + Chamomile + Sugar + Flask</p>"
  },
  "effects": [
   {
    "name": "Antidote II",
    "img": "systems/scarmark/icons/gear/health-potion-Delapouite.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY = 75, ignore all toxicity effects</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": 75,
       "priority": 50,
       "type": "override",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Vitality Potion I",
  "folder": "Potions/Potions I",
  "img": "systems/scarmark/icons/gear/health-potion-Delapouite.svg",
  "system": {
   "weight": 0.5,
   "value": 70.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "VITALITY +10",
   "description": "<p>Duration: 1 Hour</p><hr><p>Recipe: Common Herb Mix + Herbal Wine + Nettle + Flask</p>"
  },
  "effects": [
   {
    "name": "Vitality Potion I",
    "img": "systems/scarmark/icons/gear/health-potion-Delapouite.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY +10</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": 10,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Vitality Potion II",
  "folder": "Potions/Potions II",
  "img": "systems/scarmark/icons/gear/health-potion-Delapouite.svg",
  "system": {
   "weight": 0.5,
   "value": 160.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "VITALITY +20",
   "description": "<p>Duration: 1 Hour</p><hr><p>Recipe: Uncommon Herb Mix + Herbal Wine + Nettle + Sugar + Flask</p>"
  },
  "effects": [
   {
    "name": "Vitality Potion II",
    "img": "systems/scarmark/icons/gear/health-potion-Delapouite.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY +20</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": 20,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Vitality Potion III",
  "folder": "Potions/Potions III",
  "img": "systems/scarmark/icons/gear/health-potion-Delapouite.svg",
  "system": {
   "weight": 0.5,
   "value": 420.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "VITALITY +30",
   "description": "<p>Duration: 1 Hour</p><hr><p>Recipe: Rare Herb Mix + Herbal Wine + Nettle + Sugar + Ginger + Flask</p>"
  },
  "effects": [
   {
    "name": "Vitality Potion III",
    "img": "systems/scarmark/icons/gear/health-potion-Delapouite.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY +30</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": 30,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Healing Draught I",
  "folder": "Potions/Potions I",
  "img": "systems/scarmark/icons/gear/health-potion-Delapouite.svg",
  "system": {
   "weight": 0.5,
   "value": 60.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Stop heavy bleeding, +20 Recovery Roll",
   "description": "<p>Duration: Instant</p><hr><p>Recipe: Common Herb Mix + Herbal Wine + Marigold + Flask</p>"
  },
  "effects": []
 },
 {
  "name": "Healing Draught II (5)",
  "folder": "Potions/Potions II",
  "img": "systems/scarmark/icons/gear/health-potion-Delapouite.svg",
  "system": {
   "weight": 0.5,
   "value": 150.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Stop heavy bleeding, +30 Recovery Roll",
   "description": "<p>Duration: Instant</p><p>Toxicity: -5</p><hr><p>Recipe: Uncommon Herb Mix + Herbal Wine + Marigold + Sugar + Flask</p>"
  },
  "effects": [
   {
    "name": "Healing Draught II (5)",
    "img": "systems/scarmark/icons/gear/health-potion-Delapouite.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>Stop heavy bleeding, +30 Recovery Roll</p>",
    "duration": {
     "value": 10800,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -5,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Healing Draught III (5)",
  "folder": "Potions/Potions III",
  "img": "systems/scarmark/icons/gear/health-potion-Delapouite.svg",
  "system": {
   "weight": 0.5,
   "value": 400.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Stop heavy bleeding, automatic Recovery Roll",
   "description": "<p>Duration: Instant</p><p>Toxicity: -5</p><hr><p>Recipe: Rare Herb Mix + Herbal Wine + Marigold + Sugar + Clove + Flask</p>"
  },
  "effects": [
   {
    "name": "Healing Draught III (5)",
    "img": "systems/scarmark/icons/gear/health-potion-Delapouite.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>Stop heavy bleeding, automatic Recovery Roll</p>",
    "duration": {
     "value": 10800,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -5,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Stimulant Powder I",
  "folder": "Narcotic",
  "img": "systems/scarmark/icons/gear/powder-lorc.svg",
  "system": {
   "weight": 0.2,
   "value": 40.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Fatigue -3 (CRASH: +3 Fatigue after)",
   "description": "<p>Duration: 1 Hour</p><hr><p>Recipe: Common Herb Mix + Water + Nettle + Flask</p>"
  },
  "effects": [
   {
    "name": "Stimulant Powder I",
    "img": "systems/scarmark/icons/traits/star-swirl-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>Fatigue -3 (CRASH: +3 Fatigue after)</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.resources.fatigue",
       "value": -3,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Stimulant Powder II",
  "folder": "Narcotic",
  "img": "systems/scarmark/icons/gear/powder-lorc.svg",
  "system": {
   "weight": 0.2,
   "value": 110.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Fatigue = 0 (CRASH: +3 Fatigue after)",
   "description": "<p>Duration: 1 Hour</p><hr><p>Recipe: Uncommon Herb Mix + Water + Nettle + Talc + Flask</p>"
  },
  "effects": [
   {
    "name": "Stimulant Powder II",
    "img": "systems/scarmark/icons/traits/star-swirl-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>Fatigue = 0 (CRASH: +3 Fatigue after)</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.resources.fatigue",
       "value": 0,
       "priority": 50,
       "type": "override",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Church Sacrament (10)",
  "folder": "Narcotic",
  "img": "systems/scarmark/icons/gear/powder-lorc.svg",
  "system": {
   "weight": 0.3,
   "value": 40.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "+Religion, induces Vision, calms Fear",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -10</p><hr><p>Recipe: Common Herb Mix + Herbal Wine + Mandrake (church recipe) + Flask</p>"
  },
  "effects": [
   {
    "name": "Church Sacrament (10)",
    "img": "systems/scarmark/icons/traits/star-swirl-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>+Religion, induces Vision, calms Fear</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -10,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Ordeal Drug (10)",
  "folder": "Narcotic",
  "img": "systems/scarmark/icons/gear/powder-lorc.svg",
  "system": {
   "weight": 0.2,
   "value": 70.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Suggestibility / lowered resistance (GM interrogation tool)",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -10</p><hr><p>Recipe: Uncommon Herb Mix + Water + Wormwood + Flask</p>"
  },
  "effects": [
   {
    "name": "Ordeal Drug (10)",
    "img": "systems/scarmark/icons/traits/star-swirl-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>Suggestibility / lowered resistance (GM interrogation tool)</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -10,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Whiplash (20)",
  "folder": "Narcotic",
  "img": "systems/scarmark/icons/gear/powder-lorc.svg",
  "system": {
   "weight": 0.2,
   "value": 30.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Injury -2, Fatigue = 0; addiction risk, street drug",
   "description": "<p>Duration: 3 hours</p><p>Toxicity: -20</p><hr><p>Recipe: Common Herb Mix + Booze + Mandrake + Flask</p>"
  },
  "effects": [
   {
    "name": "Whiplash (20)",
    "img": "systems/scarmark/icons/traits/star-swirl-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -20, Injury -2, Fatigue = 0</p>",
    "duration": {
     "value": 10800,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -20,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.injury",
       "value": -2,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.resources.fatigue",
       "value": 0,
       "priority": 50,
       "type": "override",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Poppy Tincture (40)",
  "folder": "Narcotic",
  "img": "systems/scarmark/icons/gear/poppy-quoting.svg",
  "system": {
   "weight": 0.1,
   "value": 120.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Surgical use / Heavy Sleep. Arcane: focus for Disorient / Horror / Sleep II (Nightmare).",
   "description": "<p>Delivery: Per os</p><p>Toxicity: -40</p><p>Failure: Unconscious 1d6 hours</p><p>Critical Failure: overdose, deep Unconscious (Shock Roll)</p><p>Duration: 1d6 hours</p><hr><p>Recipe: Uncommon Herb Mix + Herbal Booze + Poppy + Flask</p>"
  },
  "effects": []
 },
 {
  "name": "Mending Draught II",
  "folder": "Potions/Potions II",
  "img": "systems/scarmark/icons/gear/health-potion-Delapouite.svg",
  "system": {
   "weight": 0.5,
   "value": 200.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Improve 1 injury by 1 Wound Level (instant)",
   "description": "<p>Duration: Instant</p><hr><p>Recipe: Uncommon Herb Mix + Herbal Wine + Marigold + Flask</p>"
  },
  "effects": []
 },
 {
  "name": "Mending Draught III",
  "folder": "Potions/Potions III",
  "img": "systems/scarmark/icons/gear/health-potion-Delapouite.svg",
  "system": {
   "weight": 0.5,
   "value": 650.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Fully heal 1 injury (instant)",
   "description": "<p>Duration: Instant</p><hr><p>Recipe: Rare Herb Mix + Herbal Wine + Marigold + Sack of dried insect + Saffron + Flask</p>"
  },
  "effects": []
 },
 {
  "name": "Deft Hands I (10)",
  "folder": "Potions/Potions I",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 50.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "DEX +2",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -10</p><hr><p>Recipe: Common Herb Mix + Herbal Wine + Mint + Flask</p>"
  },
  "effects": [
   {
    "name": "Deft Hands I (10)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -10, DEX +2</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -10,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.attributes.dex.base",
       "value": 2,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Deft Hands II (15)",
  "folder": "Potions/Potions II",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 130.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "DEX +3",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -15</p><hr><p>Recipe: Uncommon Herb Mix + Herbal Wine + Mint + Sugar + Flask</p>"
  },
  "effects": [
   {
    "name": "Deft Hands II (15)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -15, DEX +3</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -15,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.attributes.dex.base",
       "value": 3,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Deft Hands III (20)",
  "folder": "Potions/Potions III",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 380.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "DEX +4",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -20</p><hr><p>Recipe: Rare Herb Mix + Herbal Wine + Mint + Sugar + Cinnamon + Flask</p>"
  },
  "effects": [
   {
    "name": "Deft Hands III (20)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -20, DEX +4</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -20,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.attributes.dex.base",
       "value": 4,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Resolve Potion I (10)",
  "folder": "Potions/Potions I",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 50.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "WIL +2",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -10</p><hr><p>Recipe: Common Herb Mix + Herbal Wine + Sage + Flask</p>"
  },
  "effects": [
   {
    "name": "Resolve Potion I (10)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -10, WIL +2</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -10,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.attributes.wil.base",
       "value": 2,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Resolve Potion II (15)",
  "folder": "Potions/Potions II",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 130.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "WIL +3",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -15</p><hr><p>Recipe: Uncommon Herb Mix + Herbal Wine + Sage + Sugar + Flask</p>"
  },
  "effects": [
   {
    "name": "Resolve Potion II (15)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -15, WIL +3</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -15,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.attributes.wil.base",
       "value": 3,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Resolve Potion III (20)",
  "folder": "Potions/Potions III",
  "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
  "system": {
   "weight": 0.5,
   "value": 380.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "WIL +4",
   "description": "<p>Duration: 1 Hour</p><p>Toxicity: -20</p><hr><p>Recipe: Rare Herb Mix + Herbal Wine + Sage + Sugar + Star Anise + Flask</p>"
  },
  "effects": [
   {
    "name": "Resolve Potion III (20)",
    "img": "systems/scarmark/icons/gear/potion-ball-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY -20, WIL +4</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": -20,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.attributes.wil.base",
       "value": 4,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Marigold Salve",
  "folder": "Herbalist",
  "img": "systems/scarmark/icons/gear/cloth-jar-delapouite.svg",
  "system": {
   "weight": 0.1,
   "value": 35.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "+10 to the wound’s Care/Recovery Roll (topical)",
   "description": "<p>Duration: Instant</p><hr><p>Recipe: Marigold + Essential Oil + Beeswax + Ointment Tube</p>"
  },
  "effects": []
 },
 {
  "name": "Comfrey Cast",
  "folder": "Herbalist",
  "img": "systems/scarmark/icons/gear/cloth-jar-delapouite.svg",
  "system": {
   "weight": 0.1,
   "value": 20.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Helps a serious wound/fracture knit; +Recovery Roll on it (mild Mending)",
   "description": "<p>Duration: Instant</p><hr><p>Recipe: Comfrey + Talc + Ointment Tube</p>"
  },
  "effects": []
 },
 {
  "name": "Pain-Ease Balm",
  "folder": "Herbalist",
  "img": "systems/scarmark/icons/gear/cloth-jar-delapouite.svg",
  "system": {
   "weight": 0.1,
   "value": 50.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Injury penalty -1 for a short time (mild painkiller)",
   "description": "<p>Duration: 1 Hour</p><hr><p>Recipe: Mandrake + Essential Oil + Beeswax + Ointment Tube</p>"
  },
  "effects": [
   {
    "name": "Pain-Ease Balm",
    "img": "systems/scarmark/icons/gear/cloth-jar-delapouite.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>Injury -1</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.injury",
       "value": -1,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Chamomile Tea",
  "folder": "Herbalist",
  "img": "systems/scarmark/icons/gear/coffee-cup-Delapouite.svg",
  "system": {
   "weight": 0.0,
   "value": 14.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "+bonus to resist Fear/stress; calming",
   "description": "<p>Duration: 1 Hour</p><hr><p>Recipe: Chamomile + Water + Flask</p>"
  },
  "effects": [
   {
    "name": "Chamomile Tea",
    "img": "systems/scarmark/icons/gear/coffee-cup-Delapouite.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>WIL +1</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.attributes.wil.base",
       "value": 1,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Valerian Draught",
  "folder": "Herbalist",
  "img": "systems/scarmark/icons/gear/square-bottle-lorc.svg",
  "system": {
   "weight": 0.0,
   "value": 30.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Induces natural sleep / mild soporific",
   "description": "<p>Duration: 6 Hours (sleep)</p><hr><p>Recipe: Valerian + Water + Flask</p>"
  },
  "effects": []
 },
 {
  "name": "Mint Infusion",
  "folder": "Herbalist",
  "img": "systems/scarmark/icons/gear/coffee-cup-Delapouite.svg",
  "system": {
   "weight": 0.0,
   "value": 14.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Settles the stomach (mild toxicity relief), minor alertness; stops Nausea",
   "description": "<p>Duration: 1 Hour</p><hr><p>Recipe: Mint + Water + Flask</p>"
  },
  "effects": [
   {
    "name": "Mint Infusion",
    "img": "systems/scarmark/icons/gear/coffee-cup-Delapouite.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY +5, AWARENESS +5</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": 5,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skill.AWARENESS",
       "value": 5,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Sage Tea",
  "folder": "Herbalist",
  "img": "systems/scarmark/icons/gear/coffee-cup-Delapouite.svg",
  "system": {
   "weight": 0.0,
   "value": 14.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Clears the head (very mild Focus)",
   "description": "<p>Duration: 1 Hour</p><hr><p>Recipe: Sage + Water + Flask</p>"
  },
  "effects": [
   {
    "name": "Sage Tea",
    "img": "systems/scarmark/icons/gear/coffee-cup-Delapouite.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>INT +1</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.attributes.int.base",
       "value": 1,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Nettle Tonic",
  "folder": "Herbalist",
  "img": "systems/scarmark/icons/gear/square-bottle-lorc.svg",
  "system": {
   "weight": 0.0,
   "value": 8.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "-2 Fatigue",
   "description": "<p>Duration: 30 minutes</p><hr><p>Recipe: Nettle + Water + Flask</p>"
  },
  "effects": [
   {
    "name": "Nettle Tonic",
    "img": "systems/scarmark/icons/gear/square-bottle-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>Fatigue -2</p>",
    "duration": {
     "value": 1800,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.resources.fatigue",
       "value": -2,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Fever Remedy",
  "folder": "Herbalist",
  "img": "systems/scarmark/icons/gear/cloth-jar-delapouite.svg",
  "system": {
   "weight": 0.1,
   "value": 15.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "+Recovery Roll vs illness/fever",
   "description": "<p>Duration: Instant</p><hr><p>Recipe: Willow Bark + Water + Flask</p>"
  },
  "effects": []
 },
 {
  "name": "Cough Syrup",
  "folder": "Herbalist",
  "img": "systems/scarmark/icons/gear/square-bottle-lorc.svg",
  "system": {
   "weight": 0.1,
   "value": 10.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Eases coughs and breath ailments",
   "description": "<p>Duration: 3 Hours</p><hr><p>Recipe: Thyme + Honey + Water + Flask</p>"
  },
  "effects": []
 },
 {
  "name": "Herbal Antivenin",
  "folder": "Herbalist",
  "img": "systems/scarmark/icons/gear/square-bottle-lorc.svg",
  "system": {
   "weight": 0.1,
   "value": 80.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Cures a weaker poisoning (Wound Level 1-2, e.g. Wretchbane, Dreadmist, Staggerbane, Animal Poisoning (Strong)). No effect on WL 3+ (only Lebenstrank helps).",
   "description": "<p>Duration: Instant</p><hr><p>Recipe: Common Herb Mix + Water + Wormwood + Flask</p>"
  },
  "effects": []
 },
 {
  "name": "Warming Salve",
  "folder": "Herbalist",
  "img": "systems/scarmark/icons/gear/cloth-jar-delapouite.svg",
  "system": {
   "weight": 0.1,
   "value": 55.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Mild resistance to cold/frost",
   "description": "<p>Duration: 1 Hour</p><hr><p>Recipe: Ginger + Essential Oil + Beeswax + Ointment Tube</p>"
  },
  "effects": []
 },
 {
  "name": "Eyebright Wash",
  "folder": "Herbalist",
  "img": "systems/scarmark/icons/gear/square-bottle-lorc.svg",
  "system": {
   "weight": 0.1,
   "value": 10.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Heals temporary blindness",
   "description": "<p>Duration: Instant</p><hr><p>Recipe: Eyebright + Water + Flask</p>"
  },
  "effects": []
 },
 {
  "name": "Lavender Water",
  "folder": "Herbalist",
  "img": "systems/scarmark/icons/gear/perfume-bottle-lorc.svg",
  "system": {
   "weight": 0.1,
   "value": 30.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Crude perfume; minor social bonus",
   "description": "<p>Duration: 4 Hours</p><hr><p>Recipe: Lavender + Essential Oil + Flask</p>"
  },
  "effects": [
   {
    "name": "Lavender Water",
    "img": "systems/scarmark/icons/gear/perfume-bottle-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>Communication +5, Comeliness +2</p>",
    "duration": {
     "value": 14400,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skills.communication",
       "value": 5,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.attributes.com.base",
       "value": 2,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Poison Detector Powder",
  "folder": "Herbalist",
  "img": "systems/scarmark/icons/gear/powder-lorc.svg",
  "system": {
   "weight": 0.05,
   "value": 20.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Detects poison in food, drink or an object (reacts / changes colour)",
   "description": "<p>Duration: Instant</p><hr><p>Recipe: Talc + Sage + Flask</p>"
  },
  "effects": []
 },
 {
  "name": "Bloodcleaner Tincture",
  "folder": "Herbalist",
  "img": "systems/scarmark/icons/gear/square-bottle-lorc.svg",
  "system": {
   "weight": 0.1,
   "value": 50.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Drink before a drinking bout or before potions: VITALITY +5 for 3 hours (soaks alcohol and potion toxicity). Weaker but longer than the alchemical Vitality Potion.",
   "description": "<p>Duration: 3 hours</p><hr><p>Recipe: Common Herb Mix + Herbal Wine + Sage + Marigold + Flask</p>"
  },
  "effects": [
   {
    "name": "Bloodcleaner Tincture",
    "img": "systems/scarmark/icons/gear/square-bottle-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>VITALITY +5</p>",
    "duration": {
     "value": 10800,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.skill.VITALITY",
       "value": 5,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Lebenstrank Tincture",
  "folder": "Herbalist",
  "img": "systems/scarmark/icons/gear/square-bottle-lorc.svg",
  "system": {
   "weight": 0.1,
   "value": 600.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Ultimate antidote: negates any one poison (combat, per os or lethal) and removes its effects; the only cure for poisonings of Wound Level 3+.",
   "description": "<p>Duration: Instant</p><hr><p>Recipe: Rare Herb Mix + Herbal Wine + Sage + Mandrake + Saffron + Flask</p>"
  },
  "effects": []
 },
 {
  "name": "Invisible Ink",
  "folder": "Herbalist",
  "img": "systems/scarmark/icons/gear/quill-ink-lorc.svg",
  "system": {
   "weight": 0.1,
   "value": 25.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Writes invisible text, revealed by heat or a reagent",
   "description": "<p>Recipe: Essential Oil + Wormwood + Flask</p>"
  },
  "effects": []
 },
 {
  "name": "Horse Stimulant",
  "folder": "Herbalist",
  "img": "systems/scarmark/icons/gear/square-bottle-lorc.svg",
  "system": {
   "weight": 0.1,
   "value": 25.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Mount ignores fatigue and gains +Move/endurance (horses & beasts only)",
   "description": "<p>Duration: 1 Hour</p><hr><p>Recipe: Common Herb Mix + Water + Nettle + Flask</p>"
  },
  "effects": [
   {
    "name": "Horse Stimulant",
    "img": "systems/scarmark/icons/gear/square-bottle-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>Fatigue = 0, Endurance +5</p>",
    "duration": {
     "value": 3600,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.resources.fatigue",
       "value": 0,
       "priority": 50,
       "type": "override",
       "phase": "initial"
      },
      {
       "key": "system.mods.endurance",
       "value": 5,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Purging Poultice",
  "folder": "Herbalist",
  "img": "systems/scarmark/icons/gear/cloth-jar-delapouite.svg",
  "system": {
   "weight": 0.1,
   "value": 40.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Immediately cures an infection (Rot) on a wound; the wound itself remains and heals normally",
   "description": "<p>Duration: Instant</p><hr><p>Recipe: Marigold + Sage + Talc + Ointment Tube</p>"
  },
  "effects": []
 },
 {
  "name": "Curative Decoction",
  "folder": "Herbalist",
  "img": "systems/scarmark/icons/gear/square-bottle-lorc.svg",
  "system": {
   "weight": 0.1,
   "value": 50.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Cures a disease; a stronger disease needs several doses (one per severity)",
   "description": "<p>Duration: Instant</p><hr><p>Recipe: Common Herb Mix + Water + Sage + Marigold + Flask</p>"
  },
  "effects": []
 },
 {
  "name": "Opium",
  "folder": "Herbalist",
  "img": "systems/scarmark/icons/gear/smoking-pipe-Delapouite.svg",
  "system": {
   "weight": 0.01,
   "value": 80.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Smoked in a pipe. Kills pain and fear, dulls the senses. +20 to Fear and Panic tests (GM). Addiction: Will test after each use, failure = Psyche trait Addiction (Opium); each day without a dose: Fatigue +2 and -10 to all tests.",
   "description": "<p>Duration: 3 hours</p><hr><p>Recipe: 3x Poppy + Ointment Tube</p>"
  },
  "effects": [
   {
    "name": "Opium",
    "img": "systems/scarmark/icons/traits/star-swirl-lorc.svg",
    "type": "base",
    "disabled": false,
    "transfer": false,
    "description": "<p>Injury -2, AWARENESS -20, Combat -20</p>",
    "duration": {
     "value": 10800,
     "units": "seconds",
     "expiry": "turnStart"
    },
    "system": {
     "changes": [
      {
       "key": "system.mods.injury",
       "value": -2,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skill.AWARENESS",
       "value": -20,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      },
      {
       "key": "system.mods.skills.combat",
       "value": -20,
       "priority": 20,
       "type": "add",
       "phase": "initial"
      }
     ]
    }
   }
  ]
 },
 {
  "name": "Wretchbane Powder (20)",
  "folder": "Poisons",
  "img": "systems/scarmark/icons/gear/poison-bottle-lorc.svg",
  "system": {
   "weight": 0.1,
   "value": 30.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Nausea",
   "description": "<p>Delivery: Combat + Per os</p><p>Toxicity: -20</p><p>Failure: VITALITY -10, Fatigue +2, nausea 3h (non-lethal)</p><p>Critical Failure: Vomiting (lose 1 round)</p><p>Onset: 1 round / 1 day</p><hr><p>Recipe: Common Herb Mix + Talc + Wormwood + Flask</p>"
  },
  "effects": []
 },
 {
  "name": "Bloodwither Tincture (30)",
  "folder": "Poisons",
  "img": "systems/scarmark/icons/gear/poison-bottle-lorc.svg",
  "system": {
   "weight": 0.1,
   "value": 150.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Wounds gains Heavy Bleeding",
   "description": "<p>Delivery: Combat</p><p>Toxicity: -30</p><p>Failure: Struck wound gains Heavy Bleeding, VITALITY -20</p><p>Critical Failure: Open new Heavy Bleeding edged injury WL 2</p><p>Onset: 3 rounds</p><hr><p>Recipe: Common Herb Mix + Herbal Booze + Spider Venom + Flask</p>"
  },
  "effects": []
 },
 {
  "name": "Stillhand Ointment (30)",
  "folder": "Poisons",
  "img": "systems/scarmark/icons/gear/poison-bottle-lorc.svg",
  "system": {
   "weight": 0.1,
   "value": 120.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Paralysis",
   "description": "<p>Delivery: Combat</p><p>Toxicity: -30</p><p>Failure: Paralysis 1 round (defenceless), VITALITY -20</p><p>Critical Failure: Blinded</p><p>Onset: 1 round</p><hr><p>Recipe: Common Herb Mix + Essential Oil + Hemlock + Beeswax + Ointment Tube</p>"
  },
  "effects": []
 },
 {
  "name": "Ashen Draught (40)",
  "folder": "Poisons",
  "img": "systems/scarmark/icons/gear/poison-bottle-lorc.svg",
  "system": {
   "weight": 0.1,
   "value": 120.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Slow body failure",
   "description": "<p>Delivery: Per os</p><p>Toxicity: -40</p><p>Failure: Daily Mend Rate Test</p><p>Critical Failure: Open new organ wound (WL 3)</p><p>Onset: Antidote needed</p><hr><p>Recipe: Common Herb Mix + Herbal Wine + Foxglove + Flask</p>"
  },
  "effects": []
 },
 {
  "name": "Gravekiss Extract (75)",
  "folder": "Poisons",
  "img": "systems/scarmark/icons/gear/poison-bottle-lorc.svg",
  "system": {
   "weight": 0.1,
   "value": 800.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Death within the hour",
   "description": "<p>Delivery: Per os</p><p>Toxicity: -75</p><p>Failure: Mortal (WL5) + Heavy Bleeding; death within the hour without extraordinary care</p><p>Critical Failure: Immediately falls unconscious</p><p>Onset: Antidote and special care needed</p><hr><p>Recipe: Rare Herb Mix + Herbal Booze + Wolfsbane + Flask</p>"
  },
  "effects": []
 },
 {
  "name": "Staggerbane Extract (30)",
  "folder": "Poisons",
  "img": "systems/scarmark/icons/gear/poison-bottle-lorc.svg",
  "system": {
   "weight": 0.1,
   "value": 80.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Drunk effect",
   "description": "<p>Delivery: Combat + Per os</p><p>Toxicity: -30</p><p>Failure: Reeling: -20 to Combat/physical actions (as if drunk), VITALITY -10, several rounds</p><p>Critical Failure: Stumble (proned)</p><p>Onset: 3 rounds / Antidote needed</p><hr><p>Recipe: Common Herb Mix + Herbal Booze + Belladonna + Flask</p>"
  },
  "effects": []
 },
 {
  "name": "Dreadmist Oil (30)",
  "folder": "Poisons",
  "img": "systems/scarmark/icons/gear/poison-bottle-lorc.svg",
  "system": {
   "weight": 0.1,
   "value": 100.0,
   "quantity": 1,
   "consumable": true,
   "carried": true,
   "notes": "Hallucinations + Paranoia",
   "description": "<p>Delivery: Combat + Per os</p><p>Toxicity: -30</p><p>Failure: Hallucinations + panic/paranoia: WILL/Fear checks, may attack allies or flee, VITALITY -10, one scene</p><p>Critical Failure: Full breakdown (GM controls briefly) + temporary Psyche trait</p><p>Onset: 3 rounds / 1 hour</p><hr><p>Recipe: Common Herb Mix + Essential Oil + Henbane + Flask</p>"
  },
  "effects": []
 }
];

  const pack = PACK ? game.packs.get(PACK) : null;
  if ( PACK && !pack ) return ui.notifications.error(`Alchemy import: compendium ${PACK} not found.`);
  const opts = pack ? { pack: PACK } : {};
  const wasLocked = pack?.locked;
  if ( wasLocked ) await pack.configure({ locked: false });
  try {
    const folderPool = () => pack ? pack.folders : game.folders.filter(f => f.type === "Item");
    const ensureFolder = async (name, parentId) => {
      const hit = folderPool().find(f => f.name === name && (f.folder?.id ?? null) === parentId);
      if ( hit ) return hit.id;
      const [f] = await Folder.createDocuments([{ name, type: "Item", folder: parentId, sorting: "a" }], opts);
      return f.id;
    };
    const rootId = pack ? null : await ensureFolder(ROOT, null);
    const folderId = { "": rootId };
    for ( const path of FOLDERS ) {
      const parts = path.split("/");
      const parent = parts.length > 1 ? folderId[parts.slice(0, -1).join("/")] : rootId;
      folderId[path] = await ensureFolder(parts.at(-1), parent);
    }

    const existing = new Set();
    if ( pack ) {
      const idx = await pack.getIndex({ fields: ["folder"] });
      for ( const e of idx ) existing.add(`${e.folder ?? ""}|${e.name}`);
    } else {
      for ( const i of game.items ) existing.add(`${i.folder?.id ?? ""}|${i.name}`);
    }
    const todo = [], skipped = [];
    for ( const { folder, ...data } of ITEMS ) {
      const fid = folderId[folder] ?? null;
      if ( existing.has(`${fid ?? ""}|${data.name}`) ) { skipped.push(data.name); continue; }
      todo.push({ ...data, type: "gear", folder: fid });
    }
    for ( let i = 0; i < todo.length; i += 50 ) await Item.createDocuments(todo.slice(i, i + 50), opts);
    ui.notifications.info(`Alchemy import: created ${todo.length} item(s)` + (skipped.length ? `, skipped ${skipped.length} already present` : "") + ".");
    console.log("Scarmark | Alchemy import", { created: todo.map(d => d.name), skipped });
  } finally {
    if ( wasLocked ) await pack.configure({ locked: true });
  }
})();
