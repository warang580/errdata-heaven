class Heaven {
  constructor(value, err = null) {
    if (err) {
      this.errdata = Promise.resolve([err, null]);
    } else {
      if (value.constructor.name == "Promise") {
        this.errdata = new Promise(resolve => {
          value.then(data => {
            resolve([null, data]);
          }).catch(err => {
            resolve([err, null]);
          })
        });
      } else {
        this.errdata = Promise.resolve([null, value]);
      }
    }
  }

  unwrap() {
    return this.errdata;
  }

  map(fn) {
    this.errdata = new Promise(resolve => {
      this.errdata.then(([err, data]) => {
        if (err) {
          resolve([err, null]);
        } else {
          resolve([null, fn(data)]);
        }
      })
    })

    return this;
  }

  then(fn) {
    this.errdata.then(([err, data]) => {
      if (err) return;

      fn(data);
    });

    return this;
  }

  catch(fn) {
    this.errdata.then(([err, data]) => {
      if (! err) return;

      fn(err);
    });

    return this;
  }

  tap(fn) {
    this.errdata.then(errdata => {
      fn(errdata);
    })
  }

  assert(fn, error) {
    this.errdata = new Promise(resolve => {
      this.errdata.then(([err, data]) => {
        if (err) resolve([err, null]);
        let result = fn(data);

        if (! result) {
          resolve([error, null])
        } else {
          resolve([null, data]);
        }
      })
    })

    return this;
  }

  guard(fn, error) {
    this.errdata = new Promise(resolve => {
      this.errdata.then(([err, data]) => {
        if (err) resolve([err, null]);
        let result = fn(data);

        if (result) {
          resolve([error, null])
        } else {
          resolve([null, data]);
        }
      })
    })

    return this;
  }

  promise(fn) {
    this.errdata = new Promise(resolve => {
      this.errdata.then(([err, data]) => {
        if (err) resolve([err, null]);
        let p = fn(data);

        p.then(d => {
          resolve([null, d]);
        }).catch(e => {
          resolve([e, null]);
        });
      })
    })

    return this;
  }

  callback(cb) {
    this.errdata = new Promise(resolve => {
      this.errdata.then(([err, data]) => {
        if (err) resolve([err, null]);
        cb(data, (e, ...d) => {
          if (e) {
            resolve([e, null])
          } else {
            resolve([null, d]);
          }
        });
      })
    })

    return this;
  }

  merge(strategy, ...errdatas) {
    this.errdata = new Promise(resolve => {
      this.errdata.then(([e1, d1]) => {
        if (e1) {
          return resolve([e1, null]);
        }

        let rec = (datas = []) => {
          if (datas.length == errdatas.length) {
            resolve([null, strategy(d1, ...datas)]);
          } else {
            errdatas[datas.length].then(d => {
              rec(datas.concat(d));
            });
          }
        }

        rec();
        errdata.then(d2 => {
          resolve([null, strategy(d1, d2)])
        });
      });

      errdatas.forEach(errdata => {
        errdata.catch(e2 => {
          resolve([e2, null])
        })
      });
    })

    return this;
  }
}

module.exports = (...args) => {
  return new Heaven(...args);
}
