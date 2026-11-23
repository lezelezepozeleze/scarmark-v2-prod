/** Timings and sizes of the user interface (not game rules). Pure data. */

/** A click counts as a plain click when it is released within this many ms and px of where it started. */
export const CLICK_MAX_MS = 400;
export const CLICK_MAX_PX = 6;

/** The sheet of a stackable item opens this long after a click, so a second click (a stack split) can cancel it. A split waits this long for a third click (a merge). */
export const OPEN_DELAY_MS = 350;
export const SPLIT_DELAY_MS = 450;

/** Scroll positions are put back at once, after two frames, and again after this long (late layout). */
export const SCROLL_RESTORE_MS = 100;

/** A new dialog focuses its first control after this long. */
export const DIALOG_FOCUS_DELAY_MS = 50;

/** Width of one column of the combat helper dialog. */
export const HELPER_COLUMN_WIDTH = 163;
