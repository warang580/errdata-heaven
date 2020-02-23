
let id = (x) => x;

let promise = async (fn, [err, data]) => {
  if (err !== null) return [err, data];

  return fn(data)
    .then (data => [null, data])
    .catch(err  => [err, null]);
}

module.exports = {
  // data => errdata
  from: (data) => [null, data],

  // err => errdata
  error: (err) => [err, null],

  // fn: data -> errdata
  bind: (fn, [err, data]) => {
    if (err !== null) return [err, null];

    return fn(data);
  },

  // fn: data -> data
  map: (fn, [err, data]) => {
    if (err !== null) return [err, data];

    return [null, fn(data)];
  },

  // fn: data -> (return value is ignored, just side-effects)
  tap: (fn, [err, data]) => {
    if (err !== null) return [err, data];

    fn(data);

    return [null, data];
  },

  promise,

  // Transform (data, cb(err, data)) into a "errdata promise"
  callback: async (fn, [err, data]) => {
    return promise((data) => {
      return new Promise((resolve, reject) => {
        fn(data, (err, data) => {
          if (err !== null) reject(err);
          resolve(data);
        });
      })
    }, [err, data]);

    // is equivalent to (with promise dependency)

    // if (err != null) return [err, null];
    // return new Promise((resolve, reject) => {
    //   fn(data, (err, data) => {
    //     if (err !== null) reject([err, null]);
    //     resolve([null, data]);
    //   });
    // }).then(id).catch(id);
  },
}
