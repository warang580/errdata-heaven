/**
 * Functional bases to make this project work
 */
module.exports = {
  // f(x,y) == curry(f, x, y)() == curry(f, x)(y) == curry(f)(x, y)
  curry: (fn, ...args) => fn.bind(null, ...args),
  // wrap(f)() == f(x) == wrap(f)()
  wrap:  fn => curry(fn),

  // compose(f, g)(x) == f(g(x)) // g first
  compose: (...fns) => args => fns.reduceRight((val, fn) => fn(val), args),
  // pipe(f, g)(x) == g(f(x)) // f first
  pipe:    (...fns) => args => fns.reduce     ((val, fn) => fn(val), args),

  delay(cb, time = 100) {
    setTimeout(cb, time)
  },

  tap(fn, input) {
    fn(input);

    return input;
  },
}
