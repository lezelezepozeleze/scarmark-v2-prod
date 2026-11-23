/** Data models and sheets of the system's document types (the init hook). */
import { SYSTEM_ID } from "../constants.mjs";
import ScarmarkCharacterData from "../data/actor-character.mjs";
import ScarmarkCreatureData from "../data/actor-creature.mjs";
import ScarmarkNpcData from "../data/actor-npc.mjs";
import ScarmarkAnimalData from "../data/actor-animal.mjs";
import ScarmarkContainerActorData from "../data/actor-container.mjs";
import ScarmarkTraitData from "../data/item-trait.mjs";
import ScarmarkGearData from "../data/item-gear.mjs";
import ScarmarkSkillData from "../data/item-skill.mjs";
import ScarmarkWeaponData from "../data/item-weapon.mjs";
import ScarmarkMissileData from "../data/item-missile.mjs";
import ScarmarkArmorLocationData from "../data/item-armor-location.mjs";
import ScarmarkArmorData from "../data/item-armor.mjs";
import ScarmarkContainerData from "../data/item-container.mjs";
import ScarmarkInjuryData from "../data/item-injury.mjs";
import ScarmarkInvocationData from "../data/item-invocation.mjs";
import ScarmarkSpellData from "../data/item-spell.mjs";
import ScarmarkPsionicData from "../data/item-psionic.mjs";
import ScarmarkActionData from "../data/item-action.mjs";
import ScarmarkCharacterSheet from "../sheets/actor-character-sheet.mjs";
import ScarmarkCreatureSheet from "../sheets/actor-creature-sheet.mjs";
import ScarmarkNpcSheet from "../sheets/actor-npc-sheet.mjs";
import ScarmarkAnimalSheet from "../sheets/actor-animal-sheet.mjs";
import ScarmarkContainerActorSheet from "../sheets/actor-container-sheet.mjs";
import ScarmarkEffectSheet from "../sheets/effect-sheet.mjs";
import { registerRegionBehaviors } from "./region-behaviors.mjs";
import ScarmarkTraitSheet from "../sheets/item-trait-sheet.mjs";
import ScarmarkGearSheet from "../sheets/item-gear-sheet.mjs";
import ScarmarkSkillSheet from "../sheets/item-skill-sheet.mjs";
import ScarmarkWeaponSheet from "../sheets/item-weapon-sheet.mjs";
import ScarmarkMissileSheet from "../sheets/item-missile-sheet.mjs";
import ScarmarkArmorLocationSheet from "../sheets/item-armor-location-sheet.mjs";
import ScarmarkArmorSheet from "../sheets/item-armor-sheet.mjs";
import ScarmarkContainerSheet from "../sheets/item-container-sheet.mjs";
import ScarmarkInjurySheet from "../sheets/item-injury-sheet.mjs";
import ScarmarkInvocationSheet from "../sheets/item-invocation-sheet.mjs";
import ScarmarkSpellSheet from "../sheets/item-spell-sheet.mjs";
import ScarmarkPsionicSheet from "../sheets/item-psionic-sheet.mjs";
import ScarmarkActionSheet from "../sheets/item-action-sheet.mjs";

/** Document type -> [data model, sheet, SCARMARK.SheetLabels key]. */
const ACTORS = {
  character: [ScarmarkCharacterData, ScarmarkCharacterSheet, "character"],
  creature: [ScarmarkCreatureData, ScarmarkCreatureSheet, "creature"],
  npc: [ScarmarkNpcData, ScarmarkNpcSheet, "npc"],
  animal: [ScarmarkAnimalData, ScarmarkAnimalSheet, "animal"],
  container: [ScarmarkContainerActorData, ScarmarkContainerActorSheet, "containerActor"]
};

const ITEMS = {
  trait: [ScarmarkTraitData, ScarmarkTraitSheet, "trait"],
  gear: [ScarmarkGearData, ScarmarkGearSheet, "gear"],
  skill: [ScarmarkSkillData, ScarmarkSkillSheet, "skill"],
  weapon: [ScarmarkWeaponData, ScarmarkWeaponSheet, "weapon"],
  missile: [ScarmarkMissileData, ScarmarkMissileSheet, "missile"],
  armorLocation: [ScarmarkArmorLocationData, ScarmarkArmorLocationSheet, "armorLocation"],
  armor: [ScarmarkArmorData, ScarmarkArmorSheet, "armor"],
  container: [ScarmarkContainerData, ScarmarkContainerSheet, "container"],
  injury: [ScarmarkInjuryData, ScarmarkInjurySheet, "injury"],
  invocation: [ScarmarkInvocationData, ScarmarkInvocationSheet, "invocation"],
  spell: [ScarmarkSpellData, ScarmarkSpellSheet, "spell"],
  psionic: [ScarmarkPsionicData, ScarmarkPsionicSheet, "psionic"],
  action: [ScarmarkActionData, ScarmarkActionSheet, "action"]
};

function register(collection, dataModels, table) {
  for (const [type, [model, sheet, label]] of Object.entries(table)) {
    dataModels[type] = model;
    collection.registerSheet(SYSTEM_ID, sheet, { types: [type], makeDefault: true, label: `SCARMARK.SheetLabels.${label}` });
  }
}

/** Register the data models and the sheets of every actor and item type (the init hook). */
export function registerDocuments() {
  const { Actors, Items } = foundry.documents.collections;
  Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
  register(Actors, CONFIG.Actor.dataModels, ACTORS);
  register(Items, CONFIG.Item.dataModels, ITEMS);
  // Active Effects open in the system's own sheet (sheets/effect-sheet.mjs) instead of Foundry's.
  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.ActiveEffect, SYSTEM_ID, ScarmarkEffectSheet, { makeDefault: true, label: "SCARMARK.SheetLabels.effect" });
  registerRegionBehaviors();
}
