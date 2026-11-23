// The tabs and parts of each actor sheet, as they were written out by hand before module/sheets/sheet-layout.mjs built them.
import "./support/foundry-stub.mjs";
import { test } from "node:test";
import assert from "node:assert";
import ScarmarkCharacterSheet from "../module/sheets/actor-character-sheet.mjs";
import ScarmarkNpcSheet from "../module/sheets/actor-npc-sheet.mjs";
import ScarmarkCreatureSheet from "../module/sheets/actor-creature-sheet.mjs";
import ScarmarkAnimalSheet from "../module/sheets/actor-animal-sheet.mjs";
import ScarmarkContainerActorSheet from "../module/sheets/actor-container-sheet.mjs";
import { ACTIONS_PANEL_TEMPLATES } from "../module/sheets/actions/action-panel.mjs";
import { visibleTo } from "../module/sheets/sheet-layout.mjs";

const DIR = "systems/scarmark/templates/actor/parts/";
const NAV = "templates/generic/tab-navigation.hbs";
const tab = (id) => ({ id, label: `SCARMARK.Tabs.${id}` });
const PLAY = ["profile", "skills", "combat", "esoterics", "gear", "containers", "effects"];

const PARTIAL = (name) => `systems/scarmark/templates/actor/partials/${name}.hbs`;
const PART_PARTIALS = { header: ["header-identity"], profile: ["attribute-rows", "trait-column"], combat: ["combat-section", "table"], esoterics: ["esoteric-section", "table"], gear: ["gear-section", "container-section", "chest-section", "chest-row"] };
const parts = (header, entries) => ({ header: { template: DIR + header, templates: PART_PARTIALS.header.map(PARTIAL) }, tabs: { template: NAV }, ...Object.fromEntries(entries.map(([id, file]) => [id, { template: DIR + file, ...(PART_PARTIALS[id] && { templates: PART_PARTIALS[id].map(PARTIAL) }) }])) });
const play = (profile) => PLAY.map(id => [id, id === "profile" ? profile : `${id}.hbs`]);

test("Character sheet: Journal first, then the play tabs", () => {
  assert.deepStrictEqual(ScarmarkCharacterSheet.TABS, { primary: { tabs: ["journal", ...PLAY].map(tab), initial: "profile" } });
  assert.deepStrictEqual(ScarmarkCharacterSheet.PARTS, parts("header.hbs", [["journal", "journal.hbs"], ...play("profile.hbs")]));
});

test("NPC sheet: the play tabs", () => {
  assert.deepStrictEqual(ScarmarkNpcSheet.TABS, { primary: { tabs: PLAY.map(tab), initial: "profile" } });
  assert.deepStrictEqual(ScarmarkNpcSheet.PARTS, parts("header.hbs", play("profile.hbs")));
});

test("Creature and Animal sheets: the play tabs", () => {
  assert.deepStrictEqual(ScarmarkCreatureSheet.TABS, { primary: { tabs: PLAY.map(tab), initial: "profile" } });
  assert.deepStrictEqual(ScarmarkCreatureSheet.PARTS, parts("header.hbs", play("profile.hbs")));
  assert.strictEqual(ScarmarkAnimalSheet.PARTS, ScarmarkCreatureSheet.PARTS);
  assert.strictEqual(ScarmarkAnimalSheet.TABS, ScarmarkCreatureSheet.TABS);
});

test("Container sheet: a Contents tab that reuses the gear part, then Actions", () => {
  assert.deepStrictEqual(ScarmarkContainerActorSheet.TABS, { primary: { tabs: [{ id: "gear", label: "SCARMARK.Tabs.contents" }, tab("actions")], initial: "gear" } });
  assert.deepStrictEqual(ScarmarkContainerActorSheet.PARTS, {
    ...parts("container-header.hbs", [["gear", "gear.hbs"]]),
    actions: { template: DIR + "actions.hbs", templates: ACTIONS_PANEL_TEMPLATES }
  });
});

test("visibleTo: the GM sees every tab and part, anybody else only those that are not the GM's", () => {
  const tabs = { gear: { id: "gear" }, actions: { id: "actions" } };
  assert.strictEqual(visibleTo(tabs, ["actions"], true), tabs);
  assert.deepStrictEqual(visibleTo(tabs, ["actions"], false), { gear: { id: "gear" } });
  assert.deepStrictEqual(visibleTo(["header", "tabs", "gear", "actions"], ["actions"], false), ["header", "tabs", "gear"]);
  assert.deepStrictEqual(visibleTo(["gear", "actions"], ["actions"], true), ["gear", "actions"]);
});
