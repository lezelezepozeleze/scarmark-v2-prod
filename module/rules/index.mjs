/**
 * Authoritative game-rule CALCULATIONS (pure functions: inputs in, result out). This barrel re-exports every file of module/rules/; import from "rules/index.mjs", never from a single file.
 *
 * See docs/AGENTS.md (folder ownership) and docs/RULES_INDEX.md (where each mechanic lives).
 *
 * Lint (eslint.config.mjs) forbids Foundry globals, Math.random and imports from data/, helpers/, sheets/, foundry/ in this folder.
 */
export { strikeDice, injuryLevelFor, armorAfterPiercing, armorWears, pickWeighted } from "./strike.mjs";
export { capTarget, outcomeLevel, isFailure } from "./d100.mjs";
export { durationSeconds, isTimedDuration } from "./time.mjs";
export { getPath } from "./path.mjs";
export { whoMatches, isSpent } from "./region-actions.mjs";
export { allowedCombatChanges } from "./combat-update.mjs";
export { repairedArmor, armorRepairProblem, repairedWeapon, weaponRepairProblem } from "./armor-care.mjs";
export { itemModsOf, weaponEffective, armorEffective, applyItemMods, changeOf, effectiveStat } from "./item-mods.mjs";
export { effectFlags, withEffectFlag, isImmediateEffect } from "./effect-flags.mjs";
export { rewriteTarget, rewrittenValues, rewrittenItem } from "./rewrite.mjs";
export { chargesOf, chargesAfterHit, onHitEffects } from "./poison.mjs";
export { isUniqueEffect, effectIdentity, uniqueConflict } from "./effect-unique.mjs";
export { spendsOnUse, unfinishedActions, actionsFor, actionsFromEntry, isTestAction, isAlterAction, isMessageAction, isRemoveAction, isMacroAction, isEffectAction, kindOf, asksTarget, targetOf, effectsMatching, parseActionTest, ownedEffectChanges } from "./actions.mjs";
export { locationKey, covers, locationSide, hasSides, coversLocation, splitBothSides, legacyCoverage, entryValue, entryFromValue, pickerEntries, armorLocationLabel } from "./locations.mjs";
export { vitalWoundFor, severityKey, injuryFor, mendLabel, shockTarget, stunProtectionBonus } from "./wounds.mjs";
export { spellLevelPenalty, invocationPenalty, spellTarget, invocationTarget, invocationFpCost, spellFatigue, mendWoundLevelDelta } from "./esoterics.mjs";
export { rangedBlockShields, dodgeVsMissile, rangeBand, aimKey, aimPartKeys, aimPartKey, aimPenalty, matchesAimPart, outnumberedPenaltyFor, protectionSum } from "./combat.mjs";
export { resolveOutcome, isBlockResult } from "./outcome.mjs";
export { skillBase, enduranceOf, loadState, conditionState, conditionPctOf, conditionResourceOf, moveResourceOf, skillPenaltyOf, skillOverridesOf, sunsignBonusOf, skillCategoryMod, fatiguePenaltyOf, loadKgOf, woundLevelOf, worstVital, conditionOf, effectiveAttribute, skillEslOf, standaloneEslOf } from "./derived.mjs";
export { itemTotals, gearIsCarried, gearSummary, containerLoad, ownWeight, itemWeight, containerCapacity, directChildren, contentsWeight, containerFill, chestLayout, splitQuantity, stackSignature, mergeCandidates, buildTransferCopies } from "./inventory.mjs";
export { HELPER_GROUPS, HELPER_GROUP, isCarried, attackable, damageLetters, combatBuckets } from "./combat-helper.mjs";
export { maneuverTextValues } from "./maneuvers.mjs";
export { locationWeights, strikeLocationIndex, fumbleStumbleKind, impactBonusFor } from "./strike-helpers.mjs";
export { mendTarget, psionicTarget } from "./roll-targets.mjs";
export { blowBlocked } from "./outcome.mjs";
