/**
 * Entry point of the system: what runs when Foundry loads it. The work is in module/foundry/ (settings, documents, hooks) and the helpers; this file only calls it in order.
 */
import { artifactRuneUse, rechargeCapacity } from "./helpers/artifact-use.mjs";
import { SCARMARK } from "./config.mjs";
import { registerSettings } from "./foundry/settings.mjs";
import { alignCoreCalendar } from "./foundry/calendar.mjs";
import { registerDocuments } from "./foundry/documents.mjs";
import { registerActorHooks } from "./foundry/actor-hooks.mjs";
import { registerActionHooks } from "./foundry/action-hooks.mjs";
import { registerEffectUnique } from "./foundry/effect-unique.mjs";
import { registerChatHooks } from "./foundry/chat-hooks.mjs";
import { registerEffectExpiry, startEffectExpiry } from "./foundry/effect-expiry.mjs";
import { cacheSkillNames } from "./sheets/effect-sheet.mjs";
import { registerScarmarkCombatant, registerScarmarkQueries, initiateAttack, declareMeleeAttack, initiateRangeAttack, declareRangeAttack, rollStunTest } from "./helpers/combat.mjs";
import { registerScarmarkStatusEffects } from "./helpers/statuses.mjs";
import { skillTest, attributeTest, initiatePsionicTalent } from "./helpers/dice.mjs";
import { defaultArmorLocationItems } from "./helpers/actor-setup.mjs";
import { registerHandlebarsHelpers } from "./helpers/handlebars.mjs";
import { registerCombatHelper } from "./helpers/combat-helper.mjs";
import { registerManeuvers } from "./helpers/maneuvers.mjs";
import { registerTactics } from "./helpers/tactics.mjs";
import { registerDialogKeyboard } from "./helpers/dialog-keyboard.mjs";
import { registerItemTooltip } from "./helpers/item-tooltip.mjs";

Hooks.once("init", () => {
  console.log("Scarmark | Initializing...");
  game.scarmark = { config: SCARMARK, artifactRuneUse, rechargeCapacity, initiateAttack, declareMeleeAttack, initiateRangeAttack, declareRangeAttack, initiatePsionicTalent, skillTest, attributeTest, stunTest: rollStunTest, defaultArmorLocationItems };
  CONFIG.SCARMARK = SCARMARK;

  registerSettings();
  alignCoreCalendar();
  registerDocuments();
  registerScarmarkCombatant();
  registerScarmarkQueries();
  registerScarmarkStatusEffects();
  registerHandlebarsHelpers();
});

Hooks.once("ready", async () => {
  console.log("Scarmark | Ready.");
  registerCombatHelper();
  registerManeuvers();
  registerTactics();
  registerDialogKeyboard();
  registerItemTooltip();
  await cacheSkillNames();
  startEffectExpiry();
});

// Hooks that are registered as soon as the module loads (before init).
registerEffectExpiry();
registerActorHooks();
registerActionHooks();
registerEffectUnique();
registerChatHooks();
