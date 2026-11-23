/** Small helpers shared by the combat modules: the DialogV2 class and L(), the localizer for SCARMARK.CombatAuto keys. */

import { ARMOR_LOCATIONS } from "../../config/index.mjs";

export const { DialogV2 } = foundry.applications.api;

/** Localize a SCARMARK.CombatAuto key. */
export const L = (k) => game.i18n.localize(`SCARMARK.CombatAuto.${k}`);

/** Display name of a struck or chosen location: the location item's own name, else the localized canonical label of its type. */
export const locationName = (location, locType) => location.name || game.i18n.localize(ARMOR_LOCATIONS[locType]?.label ?? locType);
