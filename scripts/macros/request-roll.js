/**
 * Scarmark — Request Roll
 * ------------------------------------------------------------------
 * The GM asks one or more players for a Skill or Attribute test. The players
 * roll it themselves from a button in chat; the test is computed exactly like a
 * roll from the character sheet:
 *   Skill      — 1d100 vs ESL + modifier
 *   Attribute  — 1d100 vs attribute × multiplier (default 5) + modifier
 * The target is capped at 95. Multiples of 5 are critical.
 *
 * Visibility
 *   Public   — the request and the result are visible to everyone.
 *   Private  — the request and the result are visible only to the GM and the
 *              player who rolls.
 *
 * SETUP (once)
 *   1. Create a new Macro, type "Script", name it e.g. "Request Roll", paste this
 *      whole file into it and save. Keep it as a WORLD macro (not in a compendium).
 *   2. Drag it to the GM hotbar.
 *   The first time the GM runs it, the macro gives players "Limited" permission
 *   on itself. That is all a player needs to click the roll button in chat.
 *
 * HOW TO USE (GM)
 *   Run the macro, tick the players, choose Public / Private, Skill / Attribute,
 *   the skill or attribute, and a modifier. Each chosen player gets a button in
 *   the chat card ("Roll: <character>") and clicks it to roll. The GM can click
 *   any player's button to roll on their behalf (e.g. for an offline player).
 *
 * Each player rolls with their assigned character (User Configuration); without
 * one, their first owned Character actor is used. A player can roll each request
 * only once; the GM can always roll again.
 *
 * This one macro handles both sides: run from the hotbar it opens the request
 * dialog; clicked from a request card it performs the roll.
 */
(async () => {
  const FLAG_SCOPE = "world";
  const REQ_FLAG = "scarmarkRollRequest";
  const RES_FLAG = "scarmarkRollResult";
  const macro = this;
  const esc = (s) => Handlebars.escapeExpression(String(s ?? ""));
  const loc = (key, fallback) => (game.i18n.has(key) ? game.i18n.localize(key) : fallback);
  const signed = (n) => (n > 0 ? `+${n}` : n < 0 ? `&minus;${Math.abs(n)}` : "&plusmn;0");
  const ESL_CAP = CONFIG.SCARMARK?.ESL_CAP ?? 95;
  const ATTRS = CONFIG.SCARMARK?.attributes ?? {};
  const attrLabel = (key) => loc(ATTRS[key]?.label, key.toUpperCase());
  const findSkill = (actor, name) =>
    actor?.items.find(i => i.type === "skill" && i.name.trim().toLowerCase() === name.trim().toLowerCase());

  // ------------------------------------------------------------------
  // PLAYER SIDE: the macro was run by clicking a roll button in a request card
  // ------------------------------------------------------------------
  const link = scope.event?.target?.closest?.("a[data-request-user]");
  if ( link ) {
    const messageId = link.closest("[data-message-id]")?.dataset.messageId;
    const request = game.messages.get(messageId);
    const req = request?.getFlag(FLAG_SCOPE, REQ_FLAG);
    if ( !req ) return ui.notifications.warn("Request Roll: this roll request could not be found.");

    const userId = link.dataset.requestUser;
    if ( !game.user.isGM && (game.user.id !== userId) ) {
      return ui.notifications.warn("Request Roll: this roll was requested from another player.");
    }
    const actorUuid = req.actors?.[userId];
    const actor = actorUuid ? fromUuidSync(actorUuid) : null;
    if ( !actor ) return ui.notifications.warn("Request Roll: this player's character no longer exists.");
    if ( !actor.isOwner ) return ui.notifications.warn("Request Roll: you don't own this character.");

    const already = game.messages.contents.some(m => {
      const r = m.getFlag(FLAG_SCOPE, RES_FLAG);
      return (r?.requestId === request.id) && (r?.userId === userId);
    });
    if ( already && !game.user.isGM ) return ui.notifications.warn("Request Roll: you have already rolled this.");

    let title, base;
    if ( req.kind === "skill" ) {
      const skill = findSkill(actor, req.key);
      if ( !skill ) return ui.notifications.warn(`Request Roll: ${actor.name} doesn't have the skill "${req.key}".`);
      title = skill.name;
      base = Number(skill.system.esl) || 0;
    } else {
      const attr = actor.system.attributes?.[req.key];
      if ( !attr ) return ui.notifications.warn(`Request Roll: ${actor.name} has no ${attrLabel(req.key)}.`);
      title = attrLabel(req.key);
      base = (Number(attr.effective) || 0) * req.multiplier;
    }

    const target = Math.min(ESL_CAP, base + req.modifier);
    const roll = await new Roll("1d100").evaluate();
    const crit = roll.total % 5 === 0;
    const level = roll.total <= target ? (crit ? "cs" : "ms") : (crit ? "cf" : "mf");
    const labels = { cs: "Critical Success", ms: "Success", mf: "Failure", cf: "Critical Failure" };
    const outcome = loc(`SCARMARK.CombatAuto.level.${level}`, labels[level]);
    const testWord = loc("SCARMARK.Test", "Test");
    const mult = req.kind === "attribute" ? ` &times;${req.multiplier}` : "";

    const content = `
      <div class="scarmark-card test-card">
        <div class="test-block">
          <div class="card-title">${esc(title)} ${testWord}</div>
          <div class="card-line">Requested roll${mult} &middot; modifier ${signed(req.modifier)}</div>
          <div class="card-line">${loc("SCARMARK.Target", "Target")}: ${target}</div>
          <div class="card-line">${loc("SCARMARK.Roll", "Roll")}: ${roll.total}</div>
          <hr class="card-sep">
          <div class="test-outcome outcome-${level}">${outcome}</div>
        </div>
      </div>`;

    const data = {
      speaker: ChatMessage.getSpeaker({ actor }),
      content,
      rolls: [roll],
      flags: { [FLAG_SCOPE]: { [RES_FLAG]: { requestId: request.id, userId } } }
    };
    // Private: GM(s) + the requested player, even when the GM rolls on their behalf.
    if ( req.mode === "gm" ) data.whisper = [...new Set([...game.users.filter(u => u.isGM).map(u => u.id), userId])];
    return ChatMessage.create(data, { messageMode: req.mode });
  }

  // ------------------------------------------------------------------
  // GM SIDE: build a request
  // ------------------------------------------------------------------
  if ( !game.user.isGM ) return ui.notifications.warn("Request Roll: only the GM can request rolls.");
  if ( !(macro instanceof Macro) || macro.pack ) {
    return ui.notifications.warn("Request Roll: save this as a world Script macro and run it from the hotbar.");
  }

  // Players need Limited permission on this macro to click its roll buttons.
  const LIMITED = CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED;
  if ( (macro.ownership.default ?? 0) < LIMITED ) {
    await macro.update({ "ownership.default": LIMITED });
    ui.notifications.info("Request Roll: players can now use the roll buttons of this macro.");
  }

  // Players and the character each one rolls with.
  const players = game.users.filter(u => !u.isGM).map(u => {
    const actor = u.character ?? game.actors.find(a => (a.type === "character") && a.testUserPermission(u, "OWNER"));
    return { user: u, actor };
  }).sort((a, b) => (b.user.active - a.user.active) || a.user.name.localeCompare(b.user.name));
  if ( !players.some(p => p.actor) ) return ui.notifications.warn("Request Roll: no player has a character.");

  const skillNames = [...new Map(players.flatMap(p => p.actor?.items.filter(i => i.type === "skill") ?? [])
    .map(s => [s.name.trim().toLowerCase(), s.name.trim()])).values()].sort((a, b) => a.localeCompare(b));
  const attrKeys = Object.keys(ATTRS);

  const playerRows = players.map(({ user, actor }) => `
    <label style="display:flex;align-items:center;gap:.4rem;margin:.1rem 0;${actor ? "" : "opacity:.5"}">
      <input type="checkbox" name="user" value="${user.id}" ${actor ? "" : "disabled"} ${actor && user.active ? "checked" : ""}>
      <span>${user.active ? "&#9679;" : "&#9675;"} <strong>${esc(user.name)}</strong>
        &mdash; ${actor ? esc(actor.name) : "<em>no character</em>"}</span>
    </label>`).join("");

  const res = await foundry.applications.api.DialogV2.prompt({
    window: { title: "Request Roll" },
    position: { width: 420 },
    content: `
      <fieldset>
        <legend>Players</legend>
        ${playerRows}
      </fieldset>
      <div class="form-group">
        <label>Visibility</label>
        <div class="form-fields">
          <label><input type="radio" name="mode" value="public" checked> Public</label>
          <label><input type="radio" name="mode" value="gm"> Private (GM + player)</label>
        </div>
      </div>
      <div class="form-group">
        <label>Roll type</label>
        <div class="form-fields">
          <label><input type="radio" name="kind" value="skill" ${skillNames.length ? "checked" : "disabled"}> Skill</label>
          <label><input type="radio" name="kind" value="attribute" ${skillNames.length ? "" : "checked"}> Attribute</label>
        </div>
      </div>
      <div class="form-group" data-kind="skill">
        <label>Skill</label>
        <select name="skill">${skillNames.map(n => `<option value="${esc(n)}">${esc(n)}</option>`).join("")}</select>
      </div>
      <div class="form-group" data-kind="attribute">
        <label>Attribute</label>
        <select name="attr">${attrKeys.map(k => `<option value="${k}">${esc(attrLabel(k))}</option>`).join("")}</select>
      </div>
      <div class="form-group" data-kind="attribute">
        <label>Multiplier</label>
        <input type="number" name="multiplier" value="5" min="1" step="1">
      </div>
      <div class="form-group">
        <label>Modifier</label>
        <input type="number" name="modifier" value="0" step="5" autofocus>
      </div>`,
    render: (event, dialog) => {
      const form = dialog.element.querySelector("form");
      const sync = () => {
        const kind = form.elements.kind.value;
        for ( const el of form.querySelectorAll("[data-kind]") ) el.hidden = el.dataset.kind !== kind;
      };
      for ( const r of form.querySelectorAll('input[name="kind"]') ) r.addEventListener("change", sync);
      sync();
    },
    ok: {
      label: "Request",
      icon: "fa-solid fa-dice-d20",
      callback: (event, button) => {
        const f = button.form.elements;
        return {
          userIds: [...button.form.querySelectorAll('input[name="user"]:checked')].map(i => i.value),
          mode: f.mode.value,
          kind: f.kind.value,
          key: f.kind.value === "skill" ? f.skill.value : f.attr.value,
          multiplier: Math.max(1, Number(f.multiplier.value) || 5),
          modifier: Number(f.modifier.value) || 0
        };
      }
    },
    rejectClose: false
  });
  if ( !res ) return;
  if ( !res.userIds.length ) return ui.notifications.warn("Request Roll: choose at least one player.");
  if ( !res.key ) return ui.notifications.warn("Request Roll: choose a skill or an attribute.");

  // One roll button per chosen player; a player without the skill gets a note instead.
  const chosen = players.filter(p => res.userIds.includes(p.user.id) && p.actor);
  const actors = {};
  const rows = chosen.map(({ user, actor }) => {
    if ( (res.kind === "skill") && !findSkill(actor, res.key) ) {
      return `<div class="card-line"><strong>${esc(actor.name)}</strong> (${esc(user.name)}): doesn't have this skill</div>`;
    }
    actors[user.id] = actor.uuid;
    return `<a class="content-link" data-link data-uuid="${macro.uuid}" data-request-user="${user.id}">`
      + `<i class="fa-solid fa-dice-d20"></i> Roll: ${esc(actor.name)} (${esc(user.name)})</a>`;
  });

  const label = res.kind === "skill" ? res.key : attrLabel(res.key);
  const mult = res.kind === "attribute" ? ` &times;${res.multiplier}` : "";
  const content = `
    <div class="scarmark-card test-card">
      <div class="card-title">Roll Request: ${esc(label)} ${loc("SCARMARK.Test", "Test")}</div>
      <div class="card-line">${res.mode === "gm" ? "Private" : "Public"} roll${mult} &middot; modifier ${signed(res.modifier)}</div>
      <hr class="card-sep">
      <div class="card-buttons" style="flex-direction:column;align-items:flex-start">${rows.join("")}</div>
    </div>`;

  const data = {
    speaker: { alias: game.user.name },
    content,
    flags: { [FLAG_SCOPE]: { [REQ_FLAG]: {
      kind: res.kind, key: res.key, multiplier: res.multiplier, modifier: res.modifier, mode: res.mode, actors
    } } }
  };
  if ( res.mode === "gm" ) data.whisper = [...new Set([...game.users.filter(u => u.isGM).map(u => u.id), ...chosen.map(p => p.user.id)])];
  await ChatMessage.create(data);
})();
