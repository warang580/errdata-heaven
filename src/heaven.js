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

  apply(fn) {
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

  bind(fn) {
    this.errdata = new Promise(resolve => {
      this.errdata.then(([err, data]) => {
        if (err) {
          resolve([err, null]);
        } else {
          let [err2, data2] = fn(data);

          if (err2) {
            resolve([err2, null]);
          } else {
            resolve([null, data2]);
          }
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

    // @TODO: TDD
    return this;
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
    // @TODO: TDD
    .catch(err => {
      resolve([err, null]);
    });

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
      // @TODO: TDD
      .catch(err => {
        resolve([err, null]);
      });
    })

    return this;
  }

  promise(fn) {
    this.errdata = new Promise(resolve => {
      this.errdata.then(([err, data]) => {
        if (err) return resolve([err, null]);
        let p = fn(data);

        p.then(d => {
          resolve([null, d]);
        }).catch(e => {
          resolve([e, null]);
        });
      }).catch(err => {
        resolve([err, null]);
      });
    })

    return this;
  }

  callback(cb) {
    this.errdata = new Promise(resolve => {
      this.errdata.then(([err, data]) => {
        if (err) return resolve([err, null]);
        cb(data, (e, ...d) => {
          if (e) {
            resolve([e, null])
          } else {
            resolve([null, d]);
          }
        });
      }).catch(err => {
        console.log("e?", err);
      });
    })

    return this;
  }

  merge(strategy, ...errdatas) {
    this.errdata = new Promise(resolve => {
      this.errdata.then(([e1, d1]) => {
        if (e1) {
          return resolve([e1, null]);
        }

        let mergeRecursive = (datas = []) => {
          if (datas.length == errdatas.length) {
            resolve([null, strategy(d1, ...datas)]);
          } else {
            errdatas[datas.length].then(d => {
              mergeRecursive(datas.concat(d));
            });
          }
        }

        mergeRecursive();
      });

      errdatas.forEach(errdata => {
        errdata.catch(e => {
          resolve([e, null])
        })
      });
    })

    return this;
  }
}

module.exports = (...args) => {
  return new Heaven(...args);
}
