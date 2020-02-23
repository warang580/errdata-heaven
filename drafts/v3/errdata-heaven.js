const { curry, wrap, compose, pipe, delay, tap } = require("./futils");

module.exports = {
  from: (value) => [null, value],
  // fromError: (err) => [err],

  // fn: data -> errdata
  bind: (fn, [err, data]) => {
    // @REFACT: if (_failed(errdata)) return errdata;
    if (err !== null) return [err, data];

    // @REFACT: fn(_data(errdata))
    // @NOTE: the dev might have err+data set in fn ... do we "normalize" it ?
    return fn(data);
  },

  // fn: data -> err
  guard: (fn, [err, data]) => {
    if (err !== null) return [err, data];

    let error = fn(data);
    if (! error) return [null, data];

    return [error, null];
  },

  // fn: data -> data
  map: (fn, [err, data]) => {
    if (err !== null) return [err, data];

    return [null, fn(data)];
  },

  // fn: data -> (nothing, just side-effects)
  tap: (fn, [err, data]) => {
    if (err !== null) return [err, data];

    return [null, tap(fn, data)];
  },

  // fn: data -> promise
  // takes a promises and ensure it will return errdata later
  promise: (fn, data) => ((fn(data)).then(data => [null, data]).catch(err => [err, null]))

  // // Use this for Node.js-like "callback" argument
  // callbackToPromise: (err, data) => {
  //   // @TODO: return a promise
  //   return [err, data];
  // },

  // fn: (errdata, errdata
  // merge: (fn, [err, data]) => {
  //   let [err2, data2] = fn([err, data]);
  //
  //   if (err !== null || err2 ==)
  // },
}
