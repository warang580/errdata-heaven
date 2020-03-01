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

describe("wrap", () => {
  test("data => Promise+(errdata+)", async () => {
    expect(await H.wrap("hello")).toEqual([null, "hello"]);
  });
});

describe("map (data->data)", () => {
  test("Map(Promise+(Errdata+)) => Errdata+", async () => {
    expect(await H.map(x => (x + 1), later([null, 5]))).toEqual([null, 6]);
  });

  test("Map(Promise+(Errdata-)) => Errdata-", async () => {
    expect(await H.map(x => (x + 1), later(["error", null]))).toEqual(["error", null]);
  });

  test("Map(Promise-(Errdata)) => Errdata", async () => {
    expect(await H.map(x => (x + 1), later("failure", true))).toEqual(["failure", null]);
  });
});

describe("bind (data->errdata)", () => {
  test("Bind+(Promise+(Errdata+)) => Errdata+", async () => {
    expect(await H.bind(x => [null, x + 1], later([null, 5]))).toEqual([null, 6]);
  });

  test("Bind+(Promise+(Errdata-)) => Errdata-", async () => {
    expect(await H.bind(x => [null, x + 1], later(["error", null]))).toEqual(["error", null]);
  });

  test("Bind+(Promise-(Errdata)) => Errdata-", async () => {
    expect(await H.bind(x => [null, x + 1], later("failure", true))).toEqual(["failure", null]);
  });

  test("Bind-(Promise+(Errdata+)) = Errdata-", async () => {
    expect(await H.bind(x => ["error", null], later([null, 5]))).toEqual(["error", null]);
  });

  test("Bind-(Promise+(Errdata-)) = Errdata-", async () => {
    expect(await H.bind(x => ["error", null], later(["bad", null]))).toEqual(["bad", null]);
  });

  test("Bind-(Promise-(Errdata)) => Errdata-", async () => {
    expect(await H.bind(x => ["error", null], later("failure", true))).toEqual(["failure", null]);
  });
});

describe("guard (data->err)", () => {
  test("Guard+(Promise+(Errdata+)) => Errdata+", async () => {
    expect(await H.guard(x => null, later([null, 5]))).toEqual([null, 5]);
  });

  test("Guard+(Promise+(Errdata-)) => Errdata-", async () => {
    expect(await H.guard(x => null, later(["error", null]))).toEqual(["error", null]);
  });

  test("Guard-(Promise+(Errdata+)) => Errdata+", async () => {
    expect(await H.guard(x => "error", later([null, 5]))).toEqual(["error", null]);
  });

  test("Guard-(Promise+(Errdata-)) => Errdata+", async () => {
    expect(await H.guard(x => "error", later(["failure", null]))).toEqual(["failure", null]);
  });

  test("Guard+(Promise-(Errdata)) => Errdata+", async () => {
    expect(await H.guard(x => null, later("failure", true))).toEqual(["failure", null]);
  });

  test("Guard-(Promise-(Errdata)) => Errdata+", async () => {
    expect(await H.guard(x => "error", later("failure", true))).toEqual(["failure", null]);
  });
});

describe("tap (data->[ignored])", () => {
  test("Promise+(Errdata+)", async () => {
    let cb = jest.fn().mockImplementation(() => "ignored");

    expect(await H.tap(cb, later([null, "value"]))).toEqual([null, "value"]);

    expect(cb.mock.calls.length).toBe(1);
    expect(cb.mock.calls[0][0]).toEqual("value");
  });

  test("Promise+(Errdata-)", async () => {
    let cb = jest.fn().mockImplementation(() => "ignored");

    expect(await H.tap(cb, later(["error", null]))).toEqual(["error", null]);

    expect(cb.mock.calls.length).toBe(0);
  });

  test("Promise-(Errdata)", async () => {
    let cb = jest.fn().mockImplementation(() => "ignored");

    expect(await H.tap(cb, later("failure", true))).toEqual(["failure", null]);

    expect(cb.mock.calls.length).toBe(0);
  });
});

describe("unwrap (errdata->[ignored])", () => {
  test("Promise+(Errdata+)", async () => {
    let cb = jest.fn().mockImplementation(() => "ignored");

    expect(await H.unwrap(cb, later([null, "value"]))).toEqual([null, "value"]);

    expect(cb.mock.calls.length).toBe(1);
    expect(cb.mock.calls[0][0]).toEqual(null);
    expect(cb.mock.calls[0][1]).toEqual("value");
  });

  test("Promise+(Errdata-)", async () => {
    let cb = jest.fn().mockImplementation(() => "ignored");

    expect(await H.unwrap(cb, later(["error", null]))).toEqual(["error", null]);

    expect(cb.mock.calls.length).toBe(1);
    expect(cb.mock.calls[0][0]).toEqual("error");
    expect(cb.mock.calls[0][1]).toEqual(null);
  });

  test("Promise-(Errdata)", done => {
    let cb = jest.fn().mockImplementation(() => "ignored");

    H.unwrap((err, data) => {
      expect(err) .toEqual("failure");
      expect(data).toEqual(null);

      done();
    }, later("failure", true));
  });
});

describe("errtap (err->[ignored])", () => {
  test("Promise+(Errdata+)", async () => {
    let cb = jest.fn().mockImplementation(() => "ignored");

    expect(await H.errtap(cb, later([null, "value"]))).toEqual([null, "value"]);

    expect(cb.mock.calls.length).toBe(0);
  });

  test("Promise+(Errdata-)", async () => {
    let cb = jest.fn().mockImplementation(() => "ignored");

    expect(await H.errtap(cb, later(["error", null]))).toEqual(["error", null]);

    expect(cb.mock.calls.length).toBe(1);
    expect(cb.mock.calls[0][0]).toEqual("error");
  });

  test("Promise-(Errdata)", async () => {
    let cb = jest.fn().mockImplementation(() => "ignored");

    expect(await H.errtap(cb, later("failure", true))).toEqual(["failure", null]);

    expect(cb.mock.calls.length).toBe(1);
    expect(cb.mock.calls[0][0]).toEqual("failure");
  });
});

describe("promise (data->promise)", () => {
  test("Callback+(Promise+(Errdata+)) => Errdata+", async () => {
    expect(await H.promise(x => later(x + 1), later([null, 2]))).toEqual([null, 3]);
  });

  test("Callback+(Promise+(Errdata-)) => Errdata-", async () => {
    expect(await H.promise(x => later(x + 1), later(["error", null]))).toEqual(["error", null]);
  });

  test("Callback+(Promise-(Errdata)) => Errdata-", async () => {
    expect(await H.promise(x => later(x + 1), later("failure", true))).toEqual(["failure", null]);
  });

  test("Callback-(Promise+(Errdata+)) => Errdata-", async () => {
    expect(await H.promise(x => later("error", true), later([null, 2]))).toEqual(["error", null]);
  });

  test("Callback-(Promise+(Errdata-)) => Errdata-", async () => {
    expect(await H.promise(x => later("error2", true), later(["error", null]))).toEqual(["error", null]);
  });

  test("Callback-(Promise-(Errdata)) => Errdata-", async () => {
    expect(await H.promise(x => later("failure2", true), later("failure", true))).toEqual(["failure", null]);
  });
});

describe("callback ((data, cb)->promise)", () => {
  test("Callback+(Promise+(Errdata+)) => Errdata+", async () => {
    expect(
      await H.callback(
        (data, cb) => { cb(null, data.length, data) },
        later([null, "hello"])
      )
    ).toEqual([null, [5, "hello"]]);
  });

  test("Callback+(Promise+(Errdata-)) => Errdata-", async () => {
    expect(
      await H.callback(
        (data, cb) => { cb(null, data.length, data) },
        later(["error", null])
      )
    ).toEqual(["error", null]);
  });

  test("Callback-(Promise+(Errdata+)) => Errdata-", async () => {
    expect(
      await H.callback(
        (data, cb) => { cb("failure") },
        later([null, "hello"])
      )
    ).toEqual(["failure", null]);
  });

  test("Callback-(Promise+(Errdata-)) => Errdata-", async () => {
    expect(
      await H.callback(
        (data, cb) => { cb("failure") },
        later(["error", null])
      )
    ).toEqual(["error", null]);
  });

  test("Callback-(Promise-(Errdata)) => Errdata-", async () => {
    expect(
      await H.callback(
        (data, cb) => { cb("failure2") },
        later("failure", true)
      )
    ).toEqual(["failure", null]);
  });
});

describe("merge", () => {
  test("Merge(Promise+(Errdata1+), Promise+(Errdata2+)) => strategy(d1, d2)", async () => {
    expect(await H.merge(
      (d1, d2) => ({d1, d2}),
      later([null, 1]),
      later([null, 2])
    )).toEqual([null, {d1: 1, d2: 2}]);
  });

  test("Merge(Promise+(Errdata1+), Promise+(Errdata2-)) => Errdata2-", async () => {
    expect(await H.merge(
      (d1, d2) => ({d1, d2}),
      later([null, 1]),
      later(["error2", null])
    )).toEqual(["error2", null]);
  });

  test("Merge(Promise+(Errdata1-), Promise+(Errdata2+)) => Errdata1-", async () => {
    expect(await H.merge(
      (d1, d2) => ({d1, d2}),
      later(["error1", null]),
      later([null, 2])
    )).toEqual(["error1", null]);
  });

  test("Merge(Promise+(Errdata1-), Promise+(Errdata2-)) => Errdata1-", async () => {
    expect(await H.merge(
      (d1, d2) => ({d1, d2}),
      later(["error1", null]),
      later(["error2", null])
    )).toEqual(["error1", null]);
  });

  test("Merge(Promise-(Errdata1), Promise+(Errdata2)) => Errdata1-", async () => {
    expect(await H.merge(
      (d1, d2) => ({d1, d2}),
      later("failure1", true),
      later(["error2", null])
    )).toEqual(["failure1", null]);
  });

  test("Merge(Promise+(Errdata1-), Promise-(Errdata2)) => Errdata1-", async () => {
    expect(await H.merge(
      (d1, d2) => ({d1, d2}),
      later(["error1", null]),
      later("failure2", true)
    )).toEqual(["error1", null]);
  });

  test("Merge(Promise-(Errdata1), Promise-(Errdata2)) => Errdata1-", async () => {
    expect(await H.merge(
      (d1, d2) => ({d1, d2}),
      later("failure1", true),
      later("failure2", true)
    )).toEqual(["failure1", null]);
  });
});
