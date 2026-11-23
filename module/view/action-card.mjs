/**
 * The sentence of an action card, put together from a verb and a result so every kind of action says it the same way: "<actor> used <item>. <result>", with " on <target>" after the item when the item is used on one ("Mara used Whetstone on Knife. Knife is now Sharpened."). A trigger with no verb (config/actions.mjs `plain`: a region behavior) says only the result: "Watch your step, Mara!". Pure: the text comes through `format`.
 */

/**
 * @param {(key: string, data: object) => string} format the translator, a lang key formatted with values
 * @param {{verb: string|null, actor: string, item: string, on?: string|null}} who `verb` is the lang key of the trigger ("{actor} used {item}"), or null for a card of only the result; `on` the name of the one the item is used on
 * @param {string} [result] the lang key of what happened; without one the card is only the verb ("Mara used Whetstone.")
 * @param {object} [data] the values of the result ({ target, effect, message }); its `target` also fills the verb of a weapon that wounds
 * @returns {string} "" when there is neither a verb nor a result
 */
export function actionCardText(format, { verb, actor, item, on = null }, result = "", data = {}) {
  if (!verb) return result ? format(result, data) : "";
  const said = format(verb, { actor, item, target: on ?? data.target ?? "" });
  const lead = on ? format("SCARMARK.Action.verbOn", { verb: said, target: on }) : said;
  return result ? format("SCARMARK.Action.cardLine", { verb: lead, result: format(result, data) }) : format("SCARMARK.Action.cardVerbOnly", { verb: lead });
}
