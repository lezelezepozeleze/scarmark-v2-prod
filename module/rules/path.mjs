/** Read a value by its dotted path ("system.attributes.str.base") from plain data; undefined when a step is missing. Pure. */
export const getPath = (data, path) => path.split(".").reduce((value, step) => value?.[step], data);
