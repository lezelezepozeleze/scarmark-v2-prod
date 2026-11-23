/**
 * Shared chat formatting for any success test. Standard layout:
 *
 *   Test Name            (bold title)
 *   Target: <n>
 *   Roll:   <n>
 *   ------------------
 *   <Outcome>            (CS bold green / MS green / MF red / CF bold red)
 */

import { esc } from "./escape.mjs";

/** The rule between the blocks of a card. */
export const cardSep = '<hr class="card-sep">';

/** Localized name of a success level (cs, ms, mf, cf). */
export const outcomeLabel = (level) => game.i18n.localize(`SCARMARK.CombatAuto.level.${level}`);

/**
 * One test block (title + Target/Roll + coloured outcome). Pass `level`
 * (cs/ms/mf/cf) for a standard test, or `label`+`cls` for a custom pass/fail.
 * `title` is plain text (a name, a test): the block escapes it. `label` is HTML, and so are `before` (lines between the title and the target) and `after` (what follows the outcome).
 */
export function testBlock({ title, target, roll, level, label, cls, before = "", after = "" }) {
  const outLabel = label ?? outcomeLabel(level);
  const outClass = cls ?? `outcome-${level}`;
  return `
    <div class="test-block">
      <div class="card-title">${esc(title)}</div>
      ${before}
      <div class="card-line">${game.i18n.localize("SCARMARK.Target")}: ${target}</div>
      <div class="card-line">${game.i18n.localize("SCARMARK.Roll")}: ${roll}</div>
      ${cardSep}
      <div class="test-outcome ${outClass}">${outLabel}</div>
      ${after}
    </div>`;
}

/** A standalone test card (one block wrapped in a Scarmark chat card). Takes the testBlock arguments; `title` is plain text. */
export function testCard(args) {
  return `<div class="scarmark-card test-card">${testBlock(args)}</div>`;
}

/** One line of a card; `cls` adds a class ("broken", "armor-wear"). `html` goes in as it is: it must already be HTML-safe. */
export const cardLine = (html, cls = "") => `<div class="card-line${cls ? ` ${cls}` : ""}">${html}</div>`;

/** A row of buttons of a card. `html` is the buttons and must already be HTML-safe. */
export const cardButtons = (html) => `<div class="card-buttons">${html}</div>`;

/** The question a card asks ("Defender, choose a reaction:"). `html` must already be HTML-safe. */
export const cardPrompt = (html) => `<div class="card-prompt">${html}</div>`;

/** A block of a card that has a title of its own but no roll (a test block without the roll). `title` is plain text and is escaped; `body` is HTML and must already be HTML-safe. */
export const cardBlock = (title, body) => `<div class="test-block"><div class="card-title">${esc(title)}</div>${body}</div>`;

/**
 * The frame every Scarmark chat card shares: the `scarmark-card` wrapper (plus a marker class such as "strike-card"), an optional title, the body, and an optional row of buttons. `title`, `body`, `buttons` and `attrs` are HTML and must already be HTML-safe. `attrs` are more attributes of the wrapper (the attack card carries its declared attack in `data-combat`).
 *
 * @param {{cls?: string, title?: string, body?: string, buttons?: string, attrs?: string}} parts
 */
export const cardHtml = ({ cls = "", title = "", body = "", buttons = "", attrs = "" } = {}) =>
  `<div class="scarmark-card${cls ? ` ${cls}` : ""}"${attrs ? ` ${attrs}` : ""}>${title ? `<div class="card-title">${title}</div>` : ""}${body}${buttons ? cardButtons(buttons) : ""}</div>`;

/**
 * Post a chat card spoken by an actor: its HTML, and the dice rolled for it (Foundry, and a dice module, show them with the card). `flags` are the message's flags, `whisper` the ids of the users that may read it (everybody when missing). A card nobody says (the fatigue tick of a round) has no actor and is spoken by the `alias`.
 *
 * @param {Actor|null} actor who speaks
 * @param {string} content the card
 * @param {{rolls?: Roll[], flags?: object, whisper?: string[], alias?: string}} [options]
 */
export const speak = (actor, content, { rolls = [], flags, whisper, alias } = {}) => ChatMessage.create({ speaker: actor ? ChatMessage.getSpeaker({ actor }) : { alias }, content, rolls, ...(flags && { flags }), ...(whisper && { whisper }) });

/**
 * A public chat card of one line of text (escaped), spoken by the actor. `html` is what goes below the line (the blocks of a test); `rolls` are the dice of the card, which Foundry (and a dice module) show with it.
 *
 * @param {Actor} actor who speaks
 * @param {string} text the line
 * @param {{html?: string, rolls?: Roll[]}} [extras]
 */
export const sayText = (actor, text, { html = "", rolls = [] } = {}) => speak(actor, cardHtml({ body: (text ? cardLine(esc(text)) : "") + html }), { rolls });

/** A public chat card of one line: the lang key formatted with `data`, spoken by the actor. */
export const say = (actor, key, data) => sayText(actor, game.i18n.format(key, data));
