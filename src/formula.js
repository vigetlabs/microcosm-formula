import Cache from './cache'
import hashcode from './hashcode'
import { mark, measure } from './profile'

class Formula {
  constructor(...params) {
    if (!this.constructor.cache) {
      this.constructor.cache = new Cache()
    }

    this._dependencies = this.track(...params)
    this._cache = Cache.install(this)
  }

  update(value, params, context) {
    // Abstract. Implement this method inside of children
  }

  track(params) {
    return { params }
  }

  compute(args) {
    return args
  }

  // Private

  calculate(state, context) {
    mark('start')

    let args = this.parameterize(state, context)
    let token = this._cache.hash(args)

    if (this._cache.has(token)) {
      this.value = this._cache.get(token)
    } else {
      this.value = this.compute(args)

      this.update(this.value, args, context)

      this._cache.set(token, this.value)
    }

    mark('end')
    measure('Calculated ' + this.constructor.name, 'start', 'end')

    return this.value
  }

  apply(_scope, args) {
    return this.calculate.apply(this, args)
  }

  call(_scope, state, context) {
    return this.calculate(state, context)
  }

  parameterize(state, context) {
    let params = {}

    for (var key in this._dependencies) {
      var value = this._dependencies[key]

      if (value instanceof Formula) {
        params[key] = value.call(null, state, context)
      } else {
        params[key] = value
      }
    }

    return params
  }
}

export default Formula
