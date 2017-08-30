/**
 * @fileoverview Formulas are memoized. The key for this memo is a
 * string summary the formula's parameters.
 *
 * Since we can't uniquely stringify complex types (like objects), a
 * map maintains a translation of object references to unique string keys.
 */

function isObject(value) {
  return value !== null && typeof value === 'object'
}

function generateKey(value, cache) {
  if (isObject(value) === false) {
    return value
  }

  if (cache.has(value) === false) {
    var key = 'o' + cache.size
    cache.set(value, key)
    return key
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
