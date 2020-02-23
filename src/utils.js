
module.exports = {
  // f(x,y) == partial(f, x, y)() == partial(f, x)(y) == partial(f)(x, y)
  partial: (fn, ...args) => fn.bind(null, ...args),

  // side-effects on input
  tap(fn, input) {
    fn(input);

    return input;
  },
}
