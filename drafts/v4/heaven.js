// https://stackoverflow.com/questions/27746304/how-do-i-tell-if-an-object-is-a-promise/38339199#38339199
let isPromise = (obj) => (Promise.resolve(obj) == obj)

// Promises everywhere

module.exports = {
    from: (data) => Promise.resolve([null, data]),

    map: (fn, value) => {
      if (isPromise(value)) {
        value.then(([err, data]) => {
          return [null, fn(data)];
        })
      } else {
        let [err, data] = value;

        return [null, fn(data)];
      }
    },

    // Implied bind (maybe you want tap ?)
    // => maybe hide promise because it's implied they can be there, and just bind/map/tap with dynamic types as inputs
    promise: (fn, [err, data]) => {
      return new Promise((resolve, reject) => {
        return fn(data)
          .then(data => resolve([null, data]))
          .catch(err => resolve([err, null]));
      });
    },
}
