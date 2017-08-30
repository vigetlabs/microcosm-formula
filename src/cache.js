import hashcode from './hashcode'

const LIMIT = 30

function delayedJob(fn, scope) {
  if (typeof requestIdleCallback !== 'undefined') {
    return requestIdleCallback(fn.bind(scope))
  }

  fn.call(scope)

  return null
}

class Cache {
  static install(target) {
    let cache = new Cache()

    target.constructor.prototype._formula_cache = cache

    return cache
  }

  constructor() {
    this.parameterCache = new Map()
    this.map = new Map()
  }

  clean() {
    let diff = this.map.size - LIMIT

    if (diff > 0) {
      let keys = this.map.keys()

      while (diff > 0) {
        diff -= 1
        this.map.delete(keys.next().value)
      }
    }

    this.frame = null
  }

  queueClean() {
    if (!this.frame && this.map.size > LIMIT) {
      this.frame = delayedJob(this.clean, this)
    }
  }

  hash(components) {
    return hashcode(components, this.parameterCache)
  }

  has(key) {
    return this.map.has(key)
  }

  get(key) {
    let value = this.map.get(key)

    // Maps are ordered, so stick the value at the end to prioritize
    // frequently used formulas
    this.map.delete(key)
    this.map.set(key, value)

    return value
  }

  set(key, formula) {
    this.map.set(key, formula)
    this.queueClean()
  }
}

export default Cache
