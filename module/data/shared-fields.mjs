/**
 * Schema field builders shared by several data models: quantity, weight, value, carried, container, artifact, the Zodiac Sign bonuses, the skill attributes and the per-aspect (B/E/P/F) block. Each call returns a new field; tests/schema.test.mjs proves every schema is unchanged. The field ORDER inside a schema stays with each model (it differs between models and is part of the stored shape).
 */
import { ARTIFACT_CLASS_MIN, ARTIFACT_CLASS_MAX, SUNSIGN_BONUS_INITIAL, DAMAGE_ASPECTS } from "../config/index.mjs";
const fields = foundry.data.fields;

/** Number of units (items that stack: gear, weapons, missiles, armor, containers). */
export const quantityField = () => new fields.NumberField({ required: true, integer: true, initial: 1, min: 0 });

/** Weight per unit, in the stored weight unit. */
export const weightField = () => new fields.NumberField({ required: true, initial: 0, min: 0 });

/** Value per unit. */
export const valueField = () => new fields.NumberField({ required: true, initial: 0, min: 0 });

/** Whether the owner carries the item. */
export const carriedField = () => new fields.BooleanField({ required: true, initial: true });

/** Id of the Container item this is stored in ("" = On Person / top level). */
export const containerField = () => new fields.StringField({ required: true, initial: "", blank: true });

/** Artifact state of a weapon or gear item: active, attuned and the artifact Class (1-5). */
export const artifactField = () => new fields.SchemaField({
  active: new fields.BooleanField({ required: true, initial: false }),
  attuned: new fields.BooleanField({ required: true, initial: false }),
  class: new fields.NumberField({ required: true, integer: true, initial: ARTIFACT_CLASS_MIN, min: ARTIFACT_CLASS_MIN, max: ARTIFACT_CLASS_MAX })
});

/** Zodiac Sign bonuses of a skill or psionic talent: a list of { sunsign, bonus }. */
export const sunsignBonusesField = (sunsigns) => new fields.ArrayField(
  new fields.SchemaField({
    sunsign: new fields.StringField({ required: true, initial: "", blank: true, choices: [...Object.keys(sunsigns), ""] }),
    bonus: new fields.NumberField({ required: true, integer: true, initial: SUNSIGN_BONUS_INITIAL })
  }),
  { required: true, initial: [] }
);

/**
 * A SchemaField with one number field per damage aspect (blunt, edged, piercing, fire; DAMAGE_ASPECTS order), e.g. the impact of a weapon or the protection of armor.
 *
 * @param {() => object} makeField builds the field of one aspect
 */
export const aspectFields = (makeField) => new fields.SchemaField(Object.fromEntries(Object.keys(DAMAGE_ASPECTS).map(aspect => [aspect, makeField()])));

/** One of the three attributes a skill or psionic talent is built on. */
export const skillAttributeField = (attributes, initial) => new fields.StringField({ required: true, initial, choices: Object.keys(attributes) });

/**
 * A list of actions: "when <when> do <kind> on <on>" ({ id, name, disabled, kind, test, alteration, message, effect, macro, on, targetItem, when }). Put it on ANY data model (item, actor or region behavior) as `actions: actionsField()`; the Actions panel (sheets/actions/action-panel.mjs) edits it wherever the field lives. `name` is a label for the list and `disabled` switches the action off. `when` is a trigger and `on` a target (config/actions.mjs ACTION_TRIGGERS and ACTION_TARGETS). `kind` says what the action does and which stored field holds it (config/actions.mjs ACTION_KINDS): "effect" (add an effect: `effect` is the id of an Active Effect of the document or the uuid of a library effect), "remove" (take the library effect `effect` off the target), "test" (roll `test`, "skill:<name>" or "attribute:<key>"), "alter" (`targetItem` is the kind of item, weapon or armor, and `alteration` the uuid of an entry of its alteration compendium), "message" (post `message` to the chat) or "macro" (run the macro `macro`). An action of no kind adds an effect (the first actions had no kind).
 */
export const actionsField = () => new fields.ArrayField(
  new fields.SchemaField({
    id: new fields.StringField({ required: true, initial: "", blank: true }),
    name: new fields.StringField({ required: true, initial: "", blank: true }),
    disabled: new fields.BooleanField({ required: true, initial: false }),
    kind: new fields.StringField({ required: true, initial: "effect", blank: true }),
    test: new fields.StringField({ required: true, initial: "", blank: true }),
    alteration: new fields.StringField({ required: true, initial: "", blank: true }),
    message: new fields.StringField({ required: true, initial: "", blank: true }),
    effect: new fields.StringField({ required: true, initial: "", blank: true }),
    macro: new fields.StringField({ required: true, initial: "", blank: true }),
    on: new fields.StringField({ required: true, initial: "", blank: true }),
    targetItem: new fields.StringField({ required: true, initial: "", blank: true }),
    when: new fields.StringField({ required: true, initial: "", blank: true })
  }),
  { required: true, initial: () => [] }
);
