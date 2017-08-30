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
  static install(instance) {
    let target = instance.constructor.prototype

    if (!target._formula_cache) {
      target.constructor.prototype._formula_cache = new Cache()
    }

    return target._formula_cache
  }

  constructor() {
    this.params = new Map()
    this.answers = new Map()
  }

  clean() {
    let diff = this.answers.size - LIMIT

    if (diff > 0) {
      let keys = this.answers.keys()

      while (diff > 0) {
        diff -= 1
        this.answers.delete(keys.next().value)
      }
    }

    this.frame = null
  }

  queueClean() {
    if (!this.frame && this.answers.size > LIMIT) {
      this.frame = delayedJob(this.clean, this)
    }
  }

  hash(components) {
    return hashcode(components, this.params)
  }

  has(key) {
    return this.answers.has(key)
  }

  get(key) {
    let value = this.answers.get(key)

    // Maps are ordered, so stick the value at the end to prioritize
    // frequently used formulas
    this.answers.delete(key)
    this.answers.set(key, value)

    return value
  }

  set(key, answer) {
    this.answers.set(key, answer)
    this.last = answer
    this.queueClean()
  }
}

export default Cache
