/**
 * Authoritative game-rule VALUES: pure data, no Foundry globals. This barrel re-exports every file of module/config/, so
 * rules/, data/, helpers/ and sheets/ import from "config/index.mjs", never from a single file. The Foundry-facing
 * object CONFIG.SCARMARK / game.scarmark.config is assembled from these in module/config.mjs.
 */
export * from "./attributes.mjs";
export * from "./penalties.mjs";
export * from "./vocab.mjs";
export * from "./wounds.mjs";
export * from "./locations.mjs";
export * from "./combat.mjs";
export * from "./esoterics.mjs";
export * from "./tests.mjs";
export * from "./statuses.mjs";
export * from "./items.mjs";
export * from "./maneuvers.mjs";
export * from "./time.mjs";
export * from "./actors.mjs";
export * from "./ui.mjs";
export * from "./actions.mjs";
export * from "./regions.mjs";
