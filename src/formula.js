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

  update(value, params, repo) {
    // Abstract. Implement this method inside of children
  }

  track(params) {
    return { params }
  }

  compute(args) {
    return args
  }

  // Private

  calculate(state, repo) {
    mark('start')

    let args = this.parameterize(state, repo)
    let token = this._cache.hash(args)
    let value = null

    if (this._cache.has(token)) {
      value = this._cache.get(token)
    } else {
      value = this.compute(args, { repo, state })

      this.update(value, args, repo)

      this._cache.set(token, value)
    }

    mark('end')
    measure('Calculated ' + this.constructor.name, 'start', 'end')

    return value
  }

  apply(_scope, args) {
    return this.calculate.apply(this, args)
  }

  call(_scope, state, repo) {
    return this.calculate(state, repo)
  }

  parameterize(state, repo) {
    let params = {}

    for (var key in this._dependencies) {
      var value = this._dependencies[key]

      if (value instanceof Formula) {
        params[key] = value.call(null, state, repo)
      } else {
        params[key] = value
      }
    }

    return params
  }
}

export default Formula
