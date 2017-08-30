/**
 * @fileoverview Formulas are memoized. The key for this memo is a
 * string summary the formula's parameters.
 */

function generateKey(value, cache) {
  if (cache.has(value) === false) {
    cache.set(value, `${cache.size}`)
  }

  return cache.get(value)
}

export default function hashcode(values, cache) {
  let code = ''

  if (Array.isArray(values)) {
    for (var i = 0, len = values.length; i < len; i++) {
      code += '-' + generateKey(values[i], cache)
    }
  } else {
    for (var key in values) {
      code += '-' + generateKey(values[key], cache)
    }
  }

  return `$${code}`
}
