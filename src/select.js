import { get } from 'microcosm'
import Formula from './formula'

export default class Select extends Formula {
  track(path) {
    return { path: path === '*' ? [] : path }
  }

  compute({ path }, { state }) {
    return get(state, path, null)
  }
}

export function select(path) {
  return new Select(path)
}
