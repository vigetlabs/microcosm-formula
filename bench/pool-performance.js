import Formula from '../src/formula'
import Pool from '../src/pool'

const SIZES = [101, 101, 101, 101, 101]

for (var i = 0, len = SIZES.length; i < len; i++) {
  let SIZE = SIZES[i]
  let start = performance.now()

  for (var q = 0; q < SIZE; q++) {
    new Formula(i)
  }
}
