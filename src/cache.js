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
    this._params = new Map()
    this._answers = new Map()
  }

  hash(components) {
    return hashcode(components, this._params)
  }

  has(key) {
    return this._answers.has(key)
  }

  get(key) {
    let value = this._answers.get(key)

    // Maps are ordered, so stick the value at the end to prioritize
    // frequently used formulas
    this._answers.delete(key)
    this._answers.set(key, value)

    return value
  }

  set(key, answer) {
    this._answers.set(key, answer)
    this._queueClean()
  }

  // Private

  _clean() {
    let diff = this._answers.size - LIMIT

    if (diff > 0) {
      let keys = this._answers.keys()

      while (diff > 0) {
        diff -= 1
        this._answers.delete(keys.next().value)
      }
    }

    this._frame = null
  }

  _queueClean() {
    if (!this._frame && this._answers.size > LIMIT) {
      this._frame = delayedJob(this._clean, this)
    }
  }
}

export default Cache
