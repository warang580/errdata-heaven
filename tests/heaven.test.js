const H = require("../src/heaven");

// Testing deferred values (resolved/rejected)
let later = (value, fails = false) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fails) {
        reject(value);
      } else {
        resolve(value);
      }
    }, 1);
    // ^ This short delays ensure that promise have not the value right away
  })
}

describe("constructor", () => {
  test("it wraps data in an Heaven object", () => {
    expect(H("data").constructor.name).toEqual("Heaven")
  });

  test("it uses 1st param as data", async () => {
    expect(await H("data").unwrap()).toEqual([null, "data"])
  });

  test("it uses 2nd param as err when set, ignoring data", async () => {
    expect(await H("data", "error").unwrap()).toEqual(["error", null])
  });

  test("data can be a Promise+", async () => {
    expect(await H(Promise.resolve("data")).unwrap()).toEqual([null, "data"])
  });

  test("data can be a Promise-", async () => {
    expect(await H(Promise.reject("error")).unwrap()).toEqual(["error", null])
  });
});

describe("unwrap", () => {
  test("it returns the current errdata promise so you can await it", async () => {
    expect(H("data").unwrap().constructor.name).toEqual("Promise")
  })
});

describe("map", () => {
  test("it transforms data", async () => {
    expect(await H(5).map(x => x + 1).unwrap()).toEqual([null, 6])
  })

  test("it doesn't transform errors", async () => {
    expect(await H(null, "error").map(x => x + 1).unwrap()).toEqual(["error", null])
  })
});

describe("then", () => {
  test("it works like Promise.then on data", (done) => {
    H("value").then(data => {
      expect(data).toEqual("value");
      done();
    });
  });

  test("it isn't called when there's an error", async () => {
    let cb = jest.fn().mockImplementation(() => "ignored");

    await H(null, "error").then(cb).unwrap();

    expect(cb.mock.calls.length).toBe(0);
  });
});

describe("catch", () => {
  test("it works like Promise.catch on err", (done) => {
    H(null, "error").catch(err => {
      expect(err).toEqual("error");
      done();
    });
  });

  test("it isn't called when there's data", async () => {
    let cb = jest.fn().mockImplementation(() => "ignored");

    await H("data").catch(cb).unwrap();

    expect(cb.mock.calls.length).toBe(0);
  });
});

describe("tap", () => {
  test("it works like Promise.catch on err but with errdata", (done) => {
    H(null, "error").tap(errdata => {
      expect(errdata).toEqual(["error", null]);
      done();
    });
  });

  test("it works like Promise.then on data but with errdata", (done) => {
    H("data").tap(errdata => {
      expect(errdata).toEqual([null, "data"]);
      done();
    });
  });
});

describe("assert", () => {
  test("it does nothing if data matches predicate", async () => {
    expect(await H(6).assert(x => x > 5, "bad").unwrap()).toEqual([null, 6])
  })

  test("it checks that data matches predicate", async () => {
    expect(await H(4).assert(x => x > 5, "bad").unwrap()).toEqual(["bad", null])
  })
});

describe("guard", () => {
  test("it does nothing if data doesn't match predicate", async () => {
    expect(await H(6).guard(x => x < 5, "bad").unwrap()).toEqual([null, 6])
  })

  test("it checks that data matches predicate", async () => {
    expect(await H(4).guard(x => x < 5, "bad").unwrap()).toEqual(["bad", null])
  })
});

describe("promise", () => {
  test("it does nothing if error", async () => {
    expect(await H(null, "error").promise(Promise.resolve).unwrap()).toEqual(["error", null])
  })

  test("it handles promise+ on data", async () => {
    expect(await H(5).promise(x => Promise.resolve(x)).unwrap()).toEqual([null, 5])
  })

  test("it handles promise- on data", async () => {
    expect(await H(5).promise(x => Promise.reject("error")).unwrap()).toEqual(["error", null])
  })
});

describe("callback", () => {
  test("it does nothing if error", async () => {
    expect(
      await H(null, "error").callback(
        (data, cb) => { cb(null, data.length, data) }
      ).unwrap()
    ).toEqual(["error", null])
  })

  it("handles data from callback", async () => {
    expect(
      await H("hello").callback(
        (data, cb) => { cb(null, data.length, data) }
      ).unwrap()
    ).toEqual([null, [5, "hello"]])
  });

  it("handles error from callback", async () => {
    expect(
      await H("hello").callback(
        (data, cb) => { cb("failure") }
      ).unwrap()
    ).toEqual(["failure", null])
  });
});

describe("merge", () => {
  test("it merges two errdata together", async () => {
    expect(await H(1).merge((x,y) => x + y, H(2)).unwrap()).toEqual([null, 3])
  })

  test("it takes 1st error", async () => {
    expect(await H(null, "e1").merge((x,y) => x + y, H(2)).unwrap()).toEqual(["e1", null])
  })

  test("it takes 2nd error", async () => {
    expect(await H(1).merge((x,y) => x + y, H(null, "e2")).unwrap()).toEqual(["e2", null])
  })

  test("it takes 1st error even with multiple errors", async () => {
    expect(await H(null, "e1").merge((x,y) => x + y, H(null, "e2"), H(null, "e3"), H(null, "e4")).unwrap()).toEqual(["e1", null])
  })

  test("it merges multiple errdatas together", async () => {
    expect(await H(1).merge((...n) => n.reduce((s,i) => s + i), H(2), H(3), H(4), H(5)).unwrap()).toEqual([null, 15])
  })
});
