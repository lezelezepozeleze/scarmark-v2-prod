/** The flags of this system on an effect given as plain data or as a document. Pure. */
import { FLAGS } from "../constants.mjs";

/** @returns {object} the effect's flags under the system scope ({} when it has none) */
export const effectFlags = (effect) => effect?.flags?.[FLAGS.scope] ?? {};

/** A copy of effect data with one flag of this system set (the other flags stay; the nested objects are new, so the copy can be changed). */
export const withEffectFlag = (data, key, value) => ({ ...data, flags: { ...(data.flags ?? {}), [FLAGS.scope]: { ...effectFlags(data), [key]: value } } });

/** Whether an effect is immediate: applying it rewrites the stored values once instead of putting it in Effects. */
export const isImmediateEffect = (effect) => effectFlags(effect)[FLAGS.immediate] === true;
