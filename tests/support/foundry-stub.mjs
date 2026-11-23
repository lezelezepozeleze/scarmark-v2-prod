/**
 * Minimum Foundry globals needed to import Scarmark modules in Node and run the code paths covered by tests/golden.
 * Every stub below is documented with the reason it exists. Do not add behavior the tested code does not call.
 *
 * Load it before any module/ import: "node --import ./tests/support/foundry-stub.mjs ..." or as the first import of a test file.
 *
 * The exported `stubState` lets adapters configure the stubs per case (settings values, scripted dice totals, uuid lookup) and read what the code posted (chat messages).
 */

/** Per-case configuration and capture, reset by resetStubState(). */
export const stubState = {
  settings: new Map(),   // "scope.key" -> value, read by game.settings.get
  rolls: [],             // queue of totals handed out by Roll#evaluate, in call order
  rollFormulas: [],      // formulas of the evaluated rolls, in call order
  chat: [],              // data passed to ChatMessage.create
  uuids: new Map()       // uuid -> document, read by fromUuidSync
};

export function resetStubState() {
  stubState.settings.clear();
  stubState.rolls.length = 0;
  stubState.rollFormulas.length = 0;
  stubState.chat.length = 0;
  stubState.uuids.clear();
}

/** Field class that only stores its options. Data models reference foundry.data.fields at module load and build schemas from them in defineSchema. */
class StubField {
  constructor(...args) { this.args = args; this.options = args.at(-1) ?? {}; }
}
const fieldClass = (name) => ({ [name]: class extends StubField {} })[name];

globalThis.foundry = {
  abstract: {
    // Every data model extends foundry.abstract.TypeDataModel. Empty: adapters assign the system data onto an instance and call prepareBaseData / prepareDerivedData themselves.
    TypeDataModel: class TypeDataModel {
      // super.migrateData(source) is called by migrateData overrides; the real one returns the source.
      static migrateData(source) { return source; }
    }
  },
  data: {
    // `const fields = foundry.data.fields` at module load of data/*.mjs; only the field types the schemas use.
    fields: Object.fromEntries(["ArrayField", "BooleanField", "HTMLField", "NumberField", "ObjectField", "SchemaField", "SetField", "StringField"].map(n => [n, fieldClass(n)])),
    // foundry/region-behaviors.mjs extends the base of the region behaviors at module load; only the events field helper it calls.
    regionBehaviors: { RegionBehaviorType: class RegionBehaviorType { static _createEventsField(options) { return new (fieldClass("SetField"))(options); } } }
  },
  applications: {
    api: {
      // helpers/combat/util.mjs destructures DialogV2 at module load; the tested paths never open a dialog (inputs avoid them), so any call fails loudly.
      DialogV2: {
        prompt: () => { throw new Error("stub: DialogV2.prompt called in a golden path"); },
        confirm: () => { throw new Error("stub: DialogV2.confirm called in a golden path"); }
      },
      // sheets/actions/action-editor.mjs extends it at module load.
      ApplicationV2: class ApplicationV2 {},
      // sheets/actor-sheet-base.mjs: `HandlebarsApplicationMixin(ActorSheetV2)` at module load. Identity mixin.
      HandlebarsApplicationMixin: (Base) => class extends Base {},
      // sheets/region-behavior-sheet.mjs extends it at module load.
      DocumentSheetV2: class DocumentSheetV2 {
        constructor(options = {}) { this.document = options.document; }
        async _prepareContext() { return {}; }
      }
    },
    sheets: {
      // sheets/actor-sheet-base.mjs extends it; the sheet's _prepareContext calls super._prepareContext, this._prepareTabs and this.document.
      ActorSheetV2: class ActorSheetV2 {
        constructor(options = {}) { this.document = options.document; }
        async _prepareContext() { return {}; }
        _prepareTabs() { return {}; }
      },
      // sheets/item-sheet-base.mjs extends it at module load (tests/sheet-actions.test.mjs reads the sheets' action tables).
      ItemSheetV2: class ItemSheetV2 {
        constructor(options = {}) { this.document = options.document; }
        async _prepareContext() { return {}; }
        _prepareTabs() { return {}; }
      }
    }
  },
  // No foundry.utils function is called by the tested code paths.
  utils: {}
};

globalThis.game = {
  i18n: {
    // Labels and chat text: the key itself, so outputs stay independent of lang/en.json.
    localize: (key) => key,
    // Same, with the data appended so the numbers in formatted strings (e.g. the shock request target) stay visible.
    format: (key, data) => `${key}${JSON.stringify(data ?? {})}`
  },
  settings: {
    // SCARMARK.weightUnitsPerKg reads the metricUnits setting; values come from stubState.settings. An unset key throws like an unregistered Foundry setting.
    get: (scope, key) => {
      const k = `${scope}.${key}`;
      if (!stubState.settings.has(k)) throw new Error(`stub: setting ${k} not registered`);
      return stubState.settings.get(k);
    }
  },
  // helpers/effect-library.mjs listEffectLibrary (the Actions panel) reads game.packs: no compendia.
  packs: [],
  // helpers/macros.mjs listMacros (the Actions panel of the item sheets) reads game.macros: no macros.
  macros: [],
  // helpers/combat/wounds.mjs hasShockGrit and helpers/dice.mjs rollShock read game.combat: no combat running.
  combat: null
};

// Module top-level hook registrations (scarmark.mjs only; not imported by the golden paths).
globalThis.Hooks = { on: () => {}, once: () => {} };

// CONFIG.SCARMARK is assigned at init in Foundry; the tested paths import SCARMARK directly. wounds.mjs reads CONFIG.specialStatusEffects (optional chained).
globalThis.CONFIG = {};

/** Dice: totals come from stubState.rolls in order (no Math.random use, so the location / wear random values stay aligned). Runs out = error. */
globalThis.Roll = class Roll {
  constructor(formula) { this.formula = formula; }
  async evaluate() {
    if (!stubState.rolls.length) throw new Error(`stub: no scripted total left for Roll("${this.formula}")`);
    this.total = stubState.rolls.shift();
    stubState.rollFormulas.push(this.formula);
    return this;
  }
};

/** Chat: the tested rolls / strikes post their result as a chat card; the adapters read the card content. */
globalThis.ChatMessage = {
  getSpeaker: ({ actor } = {}) => ({ actor: actor?.id ?? null }),
  create: async (data) => { stubState.chat.push(data); return data; }
};

/** helpers/combat/resolve.mjs resolves the attacker / target from uuids in the attack data. */
globalThis.fromUuidSync = (uuid) => stubState.uuids.get(uuid) ?? null;

/** helpers/combat/wounds.mjs escapes the actor name with it. Same character map as Handlebars.Utils.escapeExpression. */
const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;", "`": "&#x60;", "=": "&#x3D;" };
globalThis.Handlebars = {
  escapeExpression: (s) => (s == null ? "" : String(s).replace(/[&<>"'`=]/g, c => ESCAPES[c]))
};

/** Warnings in the roll helpers (e.g. no matching skill) go to ui.notifications; record nothing, never throw. */
globalThis.ui = { notifications: { info: () => {}, warn: () => {}, error: () => {} } };
