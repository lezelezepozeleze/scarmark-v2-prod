/**
 * Deterministic randomness for tests.
 *  - seededRandom(seed): mulberry32 generator, returns a function giving floats in [0, 1).
 *  - withRandom(source, fn): run fn (sync or async) with Math.random replaced, then restore it.
 *    `source` is an array of values handed out in order (running out throws, so a golden case cannot silently depend on an extra random call) or a generator function.
 */

export function seededRandom(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export async function withRandom(source, fn) {
  const original = Math.random;
  let next;
  if (Array.isArray(source)) {
    const queue = [...source];
    next = () => {
      if (!queue.length) throw new Error("withRandom: Math.random called more often than scripted");
      return queue.shift();
    };
  } else {
    next = source;
  }
  Math.random = next;
  try {
    return await fn();
  } finally {
    Math.random = original;
  }
}
