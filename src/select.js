import { get } from 'microcosm'
import Formula from './formula'

export default class Select extends Formula {
  constructor(path) {
    super(...arguments)

    this._path = path === '*' ? [] : path
  }

  calculate(state, context) {
    this.value = get(state, this._path, null)

    return this.value
  }
}

export function select(path) {
  return new Select(path)
}
