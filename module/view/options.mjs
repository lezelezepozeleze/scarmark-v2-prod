/** The roll-down option the view models of the sheets share. Pure. */

/** One option of a roll-down: its value, its label, and whether it is the one chosen. */
export const option = (value, label, current) => ({ value, label, selected: value === current });
