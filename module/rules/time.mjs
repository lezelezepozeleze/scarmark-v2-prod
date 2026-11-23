/**
 * Effect durations in world-time seconds.
 *
 * Pure: no Foundry globals. The seconds per unit are config/time.mjs UNIT_SECONDS; rounds and turns are combat time and have no entry, so they give null.
 */
import { UNIT_SECONDS } from "../config/index.mjs";


/**
 * Length of a timed duration in seconds, or null when it has no world-time length (no duration, rounds/turns, or a value of 0 or less).
 *
 * @param {{value?: number, units?: string}|undefined} duration an ActiveEffect duration
 * @returns {number|null}
 */
export function durationSeconds(duration) {
  if (duration && UNIT_SECONDS[duration.units] && duration.value > 0) return duration.value * UNIT_SECONDS[duration.units];
  return null;
}

/** Whether an effect duration is a timed one (world time, or combat rounds and turns) as opposed to permanent. */
export function isTimedDuration(duration) {
  return Boolean(durationSeconds(duration) !== null || duration?.rounds > 0 || duration?.turns > 0 || (duration?.value > 0 && duration?.units));
}
