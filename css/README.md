# Scarmark stylesheets

Registered in `system.json` → `styles`. **The order of that list is the load order, and the load order is the cascade precedence**: for rules of equal specificity the file listed later wins. No `@import` is used. Keep the order below when adding or moving rules.

| # | File | Area |
|---|------|------|
| 1 | `base/tokens.css` | Design tokens and the dark/light palette (`--sm-*`). |
| 2 | `base/sheet.css` | Sheet shell (incl. the actor `.window-content` flex column), tabs, dividers, section headings, hidden scrollbars, fieldset boxes (Combat / Armor), drag markers (`.sort-drop-*`, `.sm-drop-target`). |
| 3 | `base/controls.css` | Checkboxes, checkbox rows, Artifact toggle. |
| 4 | `base/tooltips.css` | Floating tooltip with the item details shown on gear rows. |
| 5 | `actor/header.css` | Actor header and condition bar. |
| 6 | `actor/attributes.css` | Attributes, profile row, traits, Special Abilities (profile tab). |
| 7 | `actor/skills.css` | Skills tab. |
| 8 | `actor/gear.css` | Gear tab, Containers tab and the Gear tab containers section. |
| 9 | `actor/container-sheet.css` | Chest list on the Container actor sheet. |
| 10 | `actor/combat.css` | Combat tab and the shared action cells of Combat and Esoterics tables, heavy-bleeding marker. |
| 11 | `actor/esoterics.css` | Esoterics tab. |
| 12 | `actor/effects.css` | Effects tab, the Add drop-down (effect library), light-theme effect icons. |
| 13 | `actor/journal.css` | Journal tab. |
| 14 | `item/common.css` | Shared item sheet parts (header, Details field recipe, `.plain-label`), Description editors. |
| 15 | `item/skill-trait.css` | Skill and Trait sheets. |
| 16 | `item/effects-flat.css` | Flat Effects list on items. |
| 16a | `item/actions.css` | Actions list on items. |
| 17 | `item/esoteric.css` | Spell and Invocation sheets. |
| 18 | `item/equipment.css` | Gear, Weapon, Armor, Armor Location, Missile, Container, Injury sheets. |
| 18a | `item/effect-sheet.css` | The effect sheet (header, boxes, grid of the change rows). |
| 18b | `foundry/region-behavior.css` | The sheet of the region behavior. |
| 19 | `chat/cards.css` | Chat cards. |
| 20 | `dialogs/dialogs.css` | Combat helper (`.smch`) and the Tactics window (`.sm-tactics`), both outside `.scarmark`, so they use their own `--smch-*` variables instead of the `--sm-*` tokens. |
| 21 | `foundry/compendium-sidebar.css` | Compendium sidebar rows (outside `.scarmark`, uses core variables). |

Exceptions: the `--smch-*` variables (combat helper colours in `dialogs/dialogs.css`) are defined on `.smch`, outside `.scarmark`, on purpose. `--sm-cols` (inventory row columns) is set per section in `actor/gear.css`, not in `tokens.css`.

Rules: colours and repeated values are `--sm-*` tokens; no `!important`; selectors stay at the lowest specificity that works; class names used by templates, modules and macros are not renamed.
