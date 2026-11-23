// The skill categories of 1.0.51 (Skill / Combat / Esoterics + kind) and the fixed skill penalty of 1.0.53, as merged into the 1.0.58 architecture.
import { test } from "node:test";
import assert from "node:assert";
import { migrateSkillCategory } from "../module/data/migrations.mjs";
import { skillGroups, SKILL_TABS } from "../module/view/actor-view.mjs";
import { SKILL_CATEGORIES, LEGACY_SKILL_CATEGORIES, STATUS_SKILL_CATEGORIES, SKILL_PENALTY_PER_POINT, BASE_SKILLS } from "../module/config/index.mjs";
import { SCARMARK } from "../module/config.mjs";

test("migrateSkillCategory: the six old categories become three, religion and magic keep their kind", () => {
  const run = (category, esotericKind) => { const s = { category, esotericKind }; migrateSkillCategory(s); return s; };
  assert.deepStrictEqual(run("physical"), { category: "skill", esotericKind: undefined });
  assert.deepStrictEqual(run("communication"), { category: "skill", esotericKind: undefined });
  assert.deepStrictEqual(run("craft"), { category: "skill", esotericKind: undefined });
  assert.deepStrictEqual(run("combat"), { category: "combat", esotericKind: undefined });
  assert.deepStrictEqual(run("religion"), { category: "esoterics", esotericKind: "religion" });
  assert.deepStrictEqual(run("magic"), { category: "esoterics", esotericKind: "arcane" });
  assert.deepStrictEqual(run("magic", "religion"), { category: "esoterics", esotericKind: "religion" }, "a kind that is already set is kept");
  assert.deepStrictEqual(run("esoterics", "arcane"), { category: "esoterics", esotericKind: "arcane" }, "a current category is not touched");
});

test("the category lists agree: tabs, vocabulary, legacy map, status penalties", () => {
  assert.deepStrictEqual(SKILL_TABS.map(t => t.key), SKILL_CATEGORIES);
  assert.deepStrictEqual(SKILL_CATEGORIES, ["skill", "combat", "esoterics"]);
  assert.ok(Object.values(LEGACY_SKILL_CATEGORIES).every(c => SKILL_CATEGORIES.includes(c)));
  assert.deepStrictEqual(STATUS_SKILL_CATEGORIES, ["combat", "esoterics", "psionic"], "the general Skill category is left alone for now");
});

test("skillGroups: a show predicate hides single skills (a creature has no Religion skills)", () => {
  const skills = [
    { type: "skill", name: "A", system: { category: "esoterics", esotericKind: "religion" } },
    { type: "skill", name: "B", system: { category: "esoterics", esotericKind: "arcane" } },
    { type: "skill", name: "C", system: { category: "skill", esotericKind: "" } }
  ];
  const names = (groups, key) => groups.find(g => g.key === key).skills.map(s => s.name);
  const all = skillGroups(SKILL_TABS, skills);
  assert.deepStrictEqual([names(all, "skill"), names(all, "esoterics")], [["C"], ["A", "B"]]);
  const creature = skillGroups(SKILL_TABS, skills, s => s.system.esotericKind !== "religion");
  assert.deepStrictEqual(names(creature, "esoterics"), ["B"]);
});

test("the skill penalty constant is exposed to macros and a new actor starts with the reduced skill list", () => {
  assert.strictEqual(SKILL_PENALTY_PER_POINT, 5);
  assert.strictEqual(SCARMARK.SKILL_PENALTY_PER_POINT, 5);
  assert.deepStrictEqual(BASE_SKILLS.character, ["Vitality", "Stealth", "Close Combat", "Dodge", "Initiative", "Ranged Combat", "Unarmed Combat", "Physician"]);
  assert.deepStrictEqual(BASE_SKILLS.npc, BASE_SKILLS.character);
  assert.ok(BASE_SKILLS.creature.includes("Close Combat") && !BASE_SKILLS.creature.includes("Physician"));
  assert.ok(!BASE_SKILLS.animal.includes("Close Combat") && !BASE_SKILLS.animal.includes("Physician"));
});
