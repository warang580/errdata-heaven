const U = require("./utils");

// Quite ironic how "Heaven" wraps hell-ish code

module.exports = {
  /**
   * Create errdata from data
   * @param  {any} data
   * @return {errdata}
   */
  wrap: data => Promise.resolve([null, data]),

  /**
   * Transforms an errdata into another errdata with a data->errdata function
   * @param  {Function (data->errdata)} fn
   * @param  {errdata} deferredErrdata
   * @return {errdata}
   */
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

  /**
   * Transforms an errdata into another errdata with a data->data function
   * @param  {Function (data->data)} fn
   * @param  {errdata} deferredErrdata
   * @return {errdata}
   */
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

  /**
   * Transforms an errdata into another errdata with a data->err function
   * @param  {Function (data->err)} fn
   * @param  {errdata} deferredErrdata
   * @return {errdata}
   */
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

  /**
   * Apply a side-effet to errdata's data
   * @param  {Function (data->*ignored*)} fn
   * @param  {errdata} deferredErrdata
   * @return {errdata} (untouched deferredErrdata)
   */
  tap: (fn, deferredErrdata) => {
    return new Promise(resolve => {
      deferredErrdata.then(([err, data]) => {
        if (err !== null) return resolve([err, null]);

        resolve([null, U.tap(fn, data)]);
      }).catch(err => {
        resolve([err, null]);
      })
    });
  },

  /**
   * Apply a side-effet to errdata's err
   * @param  {Function (err->*ignored*)} fn
   * @param  {errdata} deferredErrdata
   * @return {errdata} (untouched deferredErrdata)
   */
  errtap: (fn, deferredErrdata) => {
    return new Promise(resolve => {
      deferredErrdata.then(([err, data]) => {
        if (err === null) return resolve([null, data]);

        resolve([U.tap(fn, err), null]);
      }).catch(err => {
        resolve([U.tap(fn, err), null]);
      })
    });
  },

  /**
   * Transforms an errdata into another errdata with a data->promise(data) function
   * Used for existing promises that behaves like : p.then(data).catch(err)
   * @param  {Function (data->promise(data))} fn
   * @param  {errdata} deferredErrdata
   * @return {errdata}
   */
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

  /**
   * Transforms an errdata into another errdata with a (data, (cb(err, ...data)) function
   * Used for existing callback-based functions that behaves like : later(..., callbackWhenDone)
   * Most NodeJS async functions are like this
   * @param  {Function (data->cb(err, ...data))} fn
   * @param  {errdata} deferredErrdata
   * @return {errdata}
   */
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

  /**
   * Apply a side-effet to errdata
   * @param  {Function (errdata->*ignored*)} fn
   * @param  {errdata} deferredErrdata
   * @return {errdata} (untouched deferredErrdata)
   */
  unwrap: (fn, deferredErrdata) => {
    deferredErrdata.then(([err, data]) => {
      fn(err, data);
    }).catch(err => {
      fn(err, null);
    });

    return deferredErrdata;
  },

  /**
   * Merges two errdata into one with a merge strategy for data
   * Errors are handled automatically
   * @param  {Function (data,data->data)} strategy
   * @param  {errdata} deferredErrdata1
   * @param  {errdata} deferredErrdata2
   * @return {errdata}
   */
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
