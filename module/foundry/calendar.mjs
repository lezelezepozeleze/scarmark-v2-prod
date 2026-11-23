/**
 * Core calendar fix (the init hook): the default Simplified Gregorian has leapStart 8, but core's _decomposeTimeYears starts leap cycles at leapStart-1 (year 7), so worldTime -> date drifts vs Simple Calendar (leap years 0,4,8...). leapStart 0 is self-consistent and matches SC, so SmallTime (reads game.time.calendar) shows the same date as Simple Calendar.
 */
export function alignCoreCalendar() {
  const worldCal = foundry.utils.deepClone(CONFIG.time.worldCalendarConfig);
  if (worldCal?.years?.leapYear) {
    worldCal.years.leapYear.leapStart = 0;
    CONFIG.time.worldCalendarConfig = worldCal;
  }
}
