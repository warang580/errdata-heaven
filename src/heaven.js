const F = require("./utils");

module.exports = {
  // data => P(errdata)
  wrap: v => Promise.resolve([null, v]),

  // fn: (data->errdata)
  bind: (fn, deferredErrdata) => {
    return new Promise(resolve => {
      deferredErrdata.then(([err, data]) => {
        if (err !== null) return resolve([err, null]);
        resolve(fn(data));
      });/*.catch(err => {
        resolve([err, null]);
      })*/
    });
  },

  // fn: (data->data)
  map: (fn, deferredErrdata) => {
    return new Promise(resolve => {
      deferredErrdata.then(([err, data]) => {
        if (err !== null) return resolve([err, null]);

        resolve([null, fn(data)]);
      }).catch(err => {
        resolve([err, null]);
      })
    });
  },

  // fn: (data->data)
  guard: (fn, deferredErrdata) => {
    return new Promise(resolve => {
      deferredErrdata.then(([err, data]) => {
        if (err !== null) return resolve([err, null]);
        let err2 = fn(data);

        if (err2) {
          resolve([err2, null]);
          return;
        }

        resolve([null, data]);
        return;
      });/*.catch(err => {
        resolve([err, null]);
      })*/
    });
  },

  // fn: (data->[ignored])
  tap: (fn, deferredErrdata) => {
    return new Promise(resolve => {
      deferredErrdata.then(([err, data]) => {
        if (err !== null) return resolve([err, null]);

        resolve([null, F.tap(fn, data)]);
      })/*.catch(err => {
        resolve([err, null]);
      })*/
    });
  },

  // fn: (err->[ignored])
  errtap: (fn, deferredErrdata) => {
    return new Promise(resolve => {
      deferredErrdata.then(([err, data]) => {
        if (err === null) return resolve([null, data]);

        resolve([F.tap(fn, err), null]);
      })/*.catch(err => {
        resolve([err, null]);
      })*/
    });
  },

  // fn: (data->promise)
  promise: (fn, deferredErrdata) => {
    return new Promise(resolve => {
      deferredErrdata.then(([err, data]) => {
        // if (err !== null) return resolve([err, null]);
        fn(data).then(data => {
          resolve([null, data]);
        })/*.catch(err => {
          resolve([err, null]);
        })*/
      });
    });
  },

  // // Transform (data, cb(err, data)) into a "errdata promise"
  // callback: async (fn, [err, data]) => {
  //   return promise((data) => {
  //     return new Promise((resolve, reject) => {
  //       fn(data, (err, data) => {
  //         if (err !== null) reject(err);
  //         resolve(data);
  //       });
  //     })
  //   }, [err, data]);
  //
  //   // is equivalent to (with promise dependency)
  //
  //   // if (err != null) return [err, null];
  //   // return new Promise((resolve, reject) => {
  //   //   fn(data, (err, data) => {
  //   //     if (err !== null) reject([err, null]);
  //   //     resolve([null, data]);
  //   //   });
  //   // }).then(id).catch(id);
  // },

  // partial application
  // fn(x,y) == p(fn, x, y)() == p(fn, x)(y) == p(fn)(x, y)
  partial: F.partial,

  // pipe([f, 1], [g, true])(x) == g(f(1, x), true) // Note that f applied first
  pipe: (...fns) => args => {
    return fns.reduce((val, [fn, ...args]) => {
      return F.partial(fn, ...args)(val);
    }, args);
  }
}
