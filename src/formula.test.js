import Formula from './formula'
import Select, { select } from './select'

describe('formula', function() {
  it('computes tracked values', function() {
    class Red extends Formula {
      compute() {
        return { r: 255, b: 0, g: 0 }
      }
    }

    class Blue extends Formula {
      compute() {
        return { r: 0, b: 255, g: 0 }
      }
    }

    class Purple extends Formula {
      track() {
        return { red: new Red(), blue: new Blue() }
      }

      compute({ red, blue }) {
        return { r: red.r, b: blue.b, g: 0 }
      }
    }

    let purple = new Purple()

    expect(purple.calculate()).toEqual({ r: 255, b: 255, g: 0 })
  })

  it('is callable like a function', function() {
    class Callable extends Formula {
      track(params) {
        return { params }
      }
    }

    let formula = new Callable('one')

    expect(formula.call(null, {})).toEqual({ params: 'one' })
  })

  it('is appliable like a function', function() {
    class Appliable extends Formula {
      track(params) {
        return { params }
      }
    }
    let formula = new Appliable('one')

    expect(formula.apply(null, [{}])).toEqual({ params: 'one' })
  })

  describe('select', function() {
    it('creates a formula for a key path', function() {
      let formula = select('color')
      let answer = formula.calculate({ color: 'blue' })

      expect(answer).toEqual('blue')
    })

    it('selects all state when passed an asterisk', function() {
      let state = { color: 'blue' }
      let formula = select('*')

      let answer = formula.calculate(state)

      expect(answer).toEqual(state)
    })

    it('can track dependencies an object', function() {
      class Name extends Formula {
        track({ prefix }) {
          return { prefix, name: select('name') }
        }

        compute({ prefix, name }) {
          return prefix + ' ' + name
        }
      }

      let name = new Name({ prefix: 'Sir' })
      let answer = name.calculate({ name: 'Bob' })

      expect(answer).toBe('Sir Bob')
    })
  })
})

describe('caching', function() {
  it('caches old answers', function() {
    class Style extends Formula {
      track() {
        return [select('color')]
      }
      compute(color) {
        // Use an object to compare referential identity
        return { color }
      }
    }

    let style = new Style()

    let a = style.calculate({ color: 'blue' })
    let b = style.calculate({ color: 'red' })
    let c = style.calculate({ color: 'blue' })

    expect(a).toBe(c)
  })

  it('caches complex types', function() {
    let users = []

    let a = new Formula(users)
    let b = new Formula(users)

    expect(a.calculate()).toBe(b.calculate())
  })

  it('complex types with the same structure are considered different', function() {
    let usersA = [{ id: 'billy' }]
    let usersB = [{ id: 'billy' }]

    let a = new Formula(usersA)
    let b = new Formula(usersB)

    expect(a).not.toBe(b)
  })
})

describe('pooling', function() {
  it('remembers the last 100 formulas', function() {
    let first = new Formula(0)

    for (var i = 1; i < 101; i++) {
      new Formula(i)
    }

    // There should be now be 100 formulas, which means we've purged the first
    let last = new Formula(0)

    expect(last).not.toBe(first)
  })
})
