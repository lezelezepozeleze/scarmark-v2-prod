/**
 * Artifact and rune use: which items an actor can use, spending Will or Spirit capacity for them (also for casting and magic missiles), and recharging the capacity pools.
 * Artifact use spends the owner's capacity, never an attribute or item charge.
 */
import { fieldValue } from "./form-fields.mjs";
import { esc } from "./escape.mjs";
import { speak } from "./chat.mjs";
import { TEMPLATE_DIR } from "../constants.mjs";
import { localizer } from "./i18n.mjs";
import { ARTIFACT_CLASS_MIN, ARTIFACT_CLASS_MAX } from "../config/index.mjs";

const T = localizer("SCARMARK.CapacityUse");
const DIALOG_DIR = `${TEMPLATE_DIR}dialogs/`;
const render = (name, data) => foundry.applications.handlebars.renderTemplate(`${DIALOG_DIR}${name}.hbs`, data);

/** Uuids of the actors that have an artifact or recharge dialog open: a second one is refused (see withActor). */
const pending = new Set();
const pools = {
  will: { field: "willCapacity", attribute: "wil", label: "SCARMARK.CapacityUse.poolWill" },
  spirit: { field: "spiritCapacity", attribute: "spi", label: "SCARMARK.CapacityUse.poolSpirit" }
};
const poolLabel = (pool) => game.i18n.localize(pools[pool].label);

/**
 * The current and maximum capacity of an owner's pool. Current is read from the stored value (effects never sit in it); maximum is the effective Will or Spirit attribute.
 * @param {Actor} actor
 * @param {"will"|"spirit"} pool
 * @returns {{current: number, maximum: number}}
 * @throws when a value is missing or negative
 */
export function capacity(actor, pool) {
  const { field, attribute } = pools[pool];
  const current = Number(actor._source?.system?.resources?.[field] ?? actor.system?.resources?.[field] ?? 0);
  const maximum = Number(actor.system?.attributes?.[attribute]?.effective);
  if (!Number.isFinite(current) || current < 0 || !Number.isFinite(maximum) || maximum < 0) {
    throw new Error(T("invalidPool", { pool: poolLabel(pool) }));
  }
  return { current: Math.floor(current), maximum: Math.floor(maximum) };
}

/** Can the actor use this artifact or rune right now: attuned, carried, in stock, and (inside a bag) every bag up the chain carried too; dropped bags and container cycles are excluded. */
export function usableArtifact(actor, item) {
  if (!item || !["gear", "weapon"].includes(item.type)) return false;
  if (!(item.system?.rune || item.system?.artifact?.active) || !item.system.artifact?.attuned) return false;
  const visited = new Set();
  let current = item;
  while (current) {
    if (visited.has(current.id) || !current.system?.carried || !(current.system.quantity === undefined || current.system.quantity > 0)) return false;
    visited.add(current.id);
    const parent = current.system.container;
    if (!parent) return true;
    current = actor.items.get(parent);
    if (!current || current.type !== "container") return false;
  }
  return false;
}

/** The capacity an artifact or rune costs (its Class) and the pool it is paid from (runes: Spirit, artifacts: Will). */
function artifactCost(item) {
  const cost = Number(item.system?.artifact?.class ?? 1);
  if (!Number.isInteger(cost) || cost < ARTIFACT_CLASS_MIN || cost > ARTIFACT_CLASS_MAX) throw new Error(T("classRange", { min: ARTIFACT_CLASS_MIN, max: ARTIFACT_CLASS_MAX }));
  return { cost, pool: item.system.rune ? "spirit" : "will" };
}

/**
 * Spend `cost` from an owner's capacity pool ("will" | "spirit"). Not enough
 * capacity asks whether to go ahead anyway (the pool then empties to 0).
 * Returns { ok, before, after }; ok=false means nothing was spent or cast.
 */
export async function spendCapacity(actor, pool, cost) {
  const { field } = pools[pool];
  const label = poolLabel(pool);
  const before = Math.max(0, Math.floor(Number(actor._source?.system?.resources?.[field] ?? 0)) || 0);
  if (before < cost) {
    const go = await foundry.applications.api.DialogV2.confirm({
      window: { title: label },
      content: `<p>${esc(T("confirmShort", { actor: actor.name, pool: label, before, cost }))}</p>`,
      rejectClose: false
    });
    if (!go) return { ok: false, before, after: before };
  }
  const after = Math.max(0, before - cost);
  await actor.update({ [`system.resources.${field}`]: after });
  return { ok: true, before, after, label };
}

/** The actor the macro acts for: the one controlled token's actor, else the user's character; throws (with a message for the user) when there is none or it cannot be used. */
function selectedActor() {
  const controlled = canvas.tokens?.controlled ?? [];
  if (controlled.length > 1) throw new Error(T("selectOne"));
  const actor = controlled[0]?.actor ?? game.user.character;
  if (!actor) throw new Error(T("noActor"));
  if (!actor.isOwner) throw new Error(T("notOwner"));
  if (!actor.system?.attributes?.wil || !actor.system?.attributes?.spi) throw new Error(T("noWillSpirit"));
  return actor;
}

/** Run `action(actor)` for the selected actor, one dialog per actor at a time; problems are shown as notifications. */
async function withActor(action) {
  let actor;
  let key;
  try {
    actor = selectedActor();
    key = actor.uuid;
    if (pending.has(key)) return ui.notifications.warn(T("alreadyOpen"));
    pending.add(key);
  } catch (error) {
    return ui.notifications.warn(error.message);
  }
  try {
    return await action(actor);
  } catch (error) {
    ui.notifications.error(error.message);
  } finally {
    pending.delete(key);
  }
}

/**
 * Spend an artifact's or rune's Class from the owner's Will or Spirit Capacity.
 *
 * @param {{preselect?: string}} [options] preselect: id of the item the dialog should offer first (the combat helper passes the one the user clicked)
 */
export async function artifactRuneUse({ preselect = null } = {}) {
  return withActor(async actor => {
    const items = [...actor.items].filter(item => usableArtifact(actor, item)).sort((a, b) => a.name.localeCompare(b.name));
    if (!items.length) return ui.notifications.warn(T("noneAvailable"));
    const options = items.map(item => {
      const { cost, pool } = artifactCost(item);
      return { id: item.id, selected: item.id === preselect, label: T("optionLabel", { name: item.name, cost, pool: poolLabel(pool) }) };
    });
    const id = await foundry.applications.api.DialogV2.prompt({
      window: { title: T("useTitle") },
      content: await render("artifact-use", {
        actor: actor.name,
        summary: T("useSummary", { will: capacity(actor, "will").current, spirit: capacity(actor, "spirit").current }),
        options
      }),
      ok: { label: T("ok"), callback: (_event, button) => fieldValue(button.form, "itemId") },
      rejectClose: false
    });
    if (!id) return;
    // Read again after the dialog: attunement, inventory and pools can change.
    const item = actor.items.get(id);
    if (!actor.isOwner || !usableArtifact(actor, item)) throw new Error(T("noLongerReady"));
    const { cost, pool } = artifactCost(item);
    const { current } = capacity(actor, pool);
    if (current < cost) return ui.notifications.warn(T("notEnough", { pool: poolLabel(pool), current, cost }));
    await actor.update({ [`system.resources.${pools[pool].field}`]: current - cost });
    await speak(actor, await render("capacity-card", {
      title: T("useCard", { name: item.name }),
      lines: [T("useCardLine", { cost, pool: poolLabel(pool), before: current, after: current - cost })]
    }));
  });
}

/** Recharge macro (game.scarmark.rechargeCapacity): the selected actor refills Will, Spirit or both to their maximum; a chat card tells what changed. */
export async function rechargeCapacity() {
  return withActor(async actor => {
    const choice = await foundry.applications.api.DialogV2.prompt({
      window: { title: T("rechargeTitle") },
      content: await render("recharge", { actor: actor.name }),
      ok: { label: T("ok"), callback: (_event, button) => fieldValue(button.form, "pool") },
      rejectClose: false
    });
    if (!choice) return;
    if (!actor.isOwner) throw new Error(T("noLongerOwn"));
    if (!["will", "spirit", "both"].includes(choice)) throw new Error(T("invalidRecharge"));
    const chosen = choice === "both" ? ["will", "spirit"] : [choice];
    const updates = {};
    const lines = chosen.map(pool => {
      const { current, maximum } = capacity(actor, pool);
      updates[`system.resources.${pools[pool].field}`] = maximum;
      return T("rechargeLine", { pool: poolLabel(pool), from: current, to: maximum });
    });
    await actor.update(updates);
    await speak(actor, await render("capacity-card", { title: T("rechargeTitle"), lines }));
  });
}
