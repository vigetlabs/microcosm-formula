import Cache from './cache'
import hashcode from './hashcode'
import { mark, measure } from './profile'

class Formula {
  constructor(...params) {
    this.params = params
    this.revision = 0
    this.dependencies = this.track(...params)

    if (!this.constructor.cache) {
      this.constructor.cache = new Cache()
    }

    this.cache = Cache.install(this)
  }

  update() {
    // Abstract. Implement this method inside of children
  }

  track() {
    return []
  }

  compute() {
    return arguments.length ? arguments[0] : null
  }

  // Private

  calculate(state, context) {
    mark('start')

    let components = this.parameterize(state, context)
    let token = this.cache.hash(this, components)

    if (this.cache.has(token)) {
      this.value = this.cache.get(token)
    } else {
      this.value = this.compute.apply(this, components)

      this.update(this.value, components, context)

      this.cache.set(token, this.value)
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
    let len = this.dependencies.length
    let params = Array(len)

    for (var i = 0; i < len; i++) {
      var value = this.dependencies[i]

      if (value instanceof Formula) {
        params[i] = value.call(null, state, context)
      } else {
        params[i] = value
      }
    }

    return params
  }
}

export default Formula
