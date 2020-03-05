
// f(x,y) == partial(f, x, y)() == partial(f, x)(y) == partial(f)(x, y)
let partial = (fn, ...args) => fn.bind(null, ...args)

// side-effects on input
let tap = (fn, input) => { fn(input); return input; }

// pipe([f, 1], [g, true])(x) == g(f(1, x), true) // Note that f applied first
let pipe = (...fns) => args => {
  return fns.reduce((val, [fn, ...args]) => {
    return partial(fn, ...args)(val);
  }, args);
}

module.exports = {
  partial,
  pipe,
  tap,
}
