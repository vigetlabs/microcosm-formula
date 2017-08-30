/**
 * @fileoverview Formulas are memoized. The key for this memo is a
 * string summary the formula's parameters.
 *
 * Since we can't uniquely stringify complex types (like objects), a
 * map maintains a translation of object references to unique string keys.
 */

import uid from 'uid'

function generateKey(parameterCache, value) {
  if (value != null && typeof value === 'object') {
    if (parameterCache.has(value) === false) {
      parameterCache.set(value, 'object-' + uid())
    }

    return parameterCache.get(value)
  }

  return value
}

export default function hashcode(values, cache) {
  let key = ''
  for (var i = 0, len = values.length; i < len; i++) {
    key += '-' + generateKey(cache, values[i])
  }

  return `$${key}`
}
