const { curry, wrap, compose, pipe, delay, tap } = require("./base");

// handle data actions/transformations/promises, etc. through only [err, data]

module.exports = {
  // "constructor"
  // TODO: from, fromPromise, fromErrback (callbacks can be (err, response, body) so do something like [error, ...rest])
  errdata: (data, err = null) => [err, data],

  // Take an input->errdata function and apply it to current data if no errors
  bind: (fn, [err, data]) => {
    if (err !== null) return [err, data];

    // @NOTE: fn should return an [err, data] format
    return fn(data);
  },

  // map(fn, errdata) = bind(fn, [null, data])

  // Functionality choice : don't allow anything on errors, because they're meant to be "deadly"
  // If we take this choice, we can make directy functionnal version of each function by prefixing them with "f", like "fmap(fn), ftap(fn)"
  // It means you can't "recover" from errors, which is 99% of the usecase ... I think

  // Check errdata "state"
  success: ([err, data]) => err === null,
  failed:  ([err, data]) => err !== null,

  // Directly map data|error
  map:  (fn, [err, data]) => [err, fn(data)],
  emap: (fn, [err, data]) => [fn(err), data],

  // Directly tap data|error
  tap:  (fn, [err, data]) => [err, tap(fn, data)],
  etap: (fn, [err, data]) => [tap(fn, err), data],

  // @TODO: guard, fguard ?

  // Transform a promise so it returns an [err, data] value
  errback: promise => promise.then(data => [null, data]).catch(err => [err, null])
}
