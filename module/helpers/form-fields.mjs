/**
 * Reading the fields of a dialog form. Always read a field through these, never as `form.elements.<name>`: a field named like a member of the elements collection (item, namedItem, length) is hidden by that member, and the read quietly gives a function instead of the field (the alter picker lost its answer this way). `namedItem` is the collection's own lookup by name, so no name can clash, and it returns the checked value of a radio group like `elements.<name>` did.
 */

/** The field (or radio group) of the form with this name, or null. Plain objects with an `elements` map work too (tests). */
function field(form, name) {
  const elements = form?.elements;
  return (typeof elements?.namedItem === "function" ? elements.namedItem(name) : elements?.[name]) ?? null;
}

/** Whether the form has a field of this name. */
export const hasField = (form, name) => field(form, name) !== null;

/** The value of the field, or `fallback` (undefined unless given) when the form has no such field. */
export const fieldValue = (form, name, fallback) => field(form, name)?.value ?? fallback;

/** The value of the field as a number; `fallback` (0 unless given) when it is empty, not a number or missing. */
export const fieldNumber = (form, name, fallback = 0) => Number(fieldValue(form, name, "")) || fallback;
