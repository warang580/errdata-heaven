const F = require("./utils");

// Quite ironic how "Heaven" wraps hell-ish code

module.exports = {
  // data => Promise(errdata)
  wrap: v => Promise.resolve([null, v]),

  // fn: (data->errdata)
  bind: (fn, deferredErrdata) => {
    return new Promise(resolve => {
      deferredErrdata.then(([err, data]) => {
        if (err !== null) return resolve([err, null]);
        resolve(fn(data));
      }).catch(err => {
        resolve([err, null]);
      })
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
      }).catch(err => {
        resolve([err, null]);
      });
    });
  },

  // fn: (data->*ignored*)
  tap: (fn, deferredErrdata) => {
    return new Promise(resolve => {
      deferredErrdata.then(([err, data]) => {
        if (err !== null) return resolve([err, null]);

        resolve([null, F.tap(fn, data)]);
      }).catch(err => {
        resolve([err, null]);
      })
    });
  },

  // fn: (err->*ignored*)
  errtap: (fn, deferredErrdata) => {
    return new Promise(resolve => {
      deferredErrdata.then(([err, data]) => {
        if (err === null) return resolve([null, data]);

        resolve([F.tap(fn, err), null]);
      }).catch(err => {
        resolve([F.tap(fn, err), null]);
      })
    });
  },

  // fn: (data->promise(data))
  promise: (fn, deferredErrdata) => {
    return new Promise(resolve => {
      deferredErrdata.then(([err, data]) => {
        if (err !== null) return resolve([err, null]);
        fn(data).then(data => {
          resolve([null, data]);
        }).catch(err => {
          resolve([err, null]);
        })
      }).catch(err => {
        resolve([err, null]);
      });
    });
  },

  // Transform (data, cb(err, data)) into a "errdata promise"
  // fn: ((data, cb) => { cb(err, data) })
  callback: async (fn, deferredErrdata) => {
    return new Promise(resolve => {
      deferredErrdata.then(([err, data]) => {
        if (err !== null) return resolve([err, null]);
        fn(data, (err, ...data2) => {
          if (err !== null) return resolve([err, null]);
          return resolve([err, data2]);
        });
      }).catch(err => {
        resolve([err, null]);
      });
    });
  },

  // @NOTE: not tested, for debug only ... might be useful
  // transforming into "unwrap"
  unwrap: (fn, deferredErrdata) => {
    deferredErrdata.then(([err, data]) => {
      fn(err, data);
    }).catch(err => {
      fn(err, null);
    });

    return deferredErrdata;
  },

  merge: (strategy, deferredErrdata1, deferredErrdata2) => {
    return new Promise(resolve => {
      deferredErrdata1.then(([err1, data1]) => {
        if (err1 !== null) return resolve([err1, null]);
        deferredErrdata2.then(([err2, data2]) => {
          if (err2 !== null) return resolve([err2, null]);
          return resolve([null, strategy(data1, data2)]);
        })
        // @NOTE: .catch(err2) is outside because it can fail before
        // getting here and it stops everything
      }).catch(err1 => {
        return resolve([err1, null]);
      });

      deferredErrdata2.catch(err2 => {
        return resolve([err2, null]);
      });
    });
  },
}
