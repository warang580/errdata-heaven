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
    let cb = jest.fn().mockImplementation(() => "unusedReturn");

    expect(await H.tap(cb, later([null, "value"]))).toEqual([null, "value"]);

    expect(cb.mock.calls.length).toBe(1);
    expect(cb.mock.calls[0][0]).toEqual("value");
  });

  test("Promise+(Errdata-)", async () => {
    let cb = jest.fn().mockImplementation(() => "unusedReturn");

    expect(await H.tap(cb, later(["error", null]))).toEqual(["error", null]);

    expect(cb.mock.calls.length).toBe(0);
  });

  test("Promise-(Errdata)", async () => {
    let cb = jest.fn().mockImplementation(() => "unusedReturn");

    expect(await H.tap(cb, later("failure", true))).toEqual(["failure", null]);

    expect(cb.mock.calls.length).toBe(0);
  });
});

describe("errtap (err->[ignored])", () => {
  test("Promise+(Errdata+)", async () => {
    let cb = jest.fn().mockImplementation(() => "unusedReturn");

    expect(await H.errtap(cb, later([null, "value"]))).toEqual([null, "value"]);

    expect(cb.mock.calls.length).toBe(0);
  });

  test("Promise+(Errdata-)", async () => {
    let cb = jest.fn().mockImplementation(() => "unusedReturn");

    expect(await H.errtap(cb, later(["error", null]))).toEqual(["error", null]);

    expect(cb.mock.calls.length).toBe(1);
    expect(cb.mock.calls[0][0]).toEqual("error");
  });

  test("Promise-(Errdata)", async () => {
    let cb = jest.fn().mockImplementation(() => "unusedReturn");

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

describe("partial", () => {
  let sum = (x, y) => (x + y);

  test("applies partially arguments", () => {
    expect(sum(1, 2)).toEqual(3);

    expect(H.partial(sum)(1, 2))  .toEqual(3);
    expect(H.partial(sum, 1)(2))  .toEqual(3);
    expect(H.partial(sum, 1, 2)()).toEqual(3);
  });
});

describe("pipe", () => {
  let add = (x, y) => (x + y);
  let mul = (x, y) => (x * y);

  test("transforms list of [fn, ...args] into one function", () => {
    expect(H.pipe(
      [add, 1],
      [mul, 2],
      [add, 2],
    )(1)).toEqual(6);
  });
});

// describe.skip("error", () => {
//   test("convert err into errdata", () => {
//     expect(H.error("something bad happened")).toEqual(["something bad happened", null]);
//   });
// });

// describe.skip("callback", () => {
//   let readFile = (path, callback) => {
//     if (path == "path/to/file") {
//       callback(null, "contents");
//       return;
//     }
//
//     callback("file not found");
//   };
//
//   test("takes a data,cb->(nothing) fn and return [null, value] with cb(null, value)", async () => {
//     expect(await H.callback(readFile, [null, "path/to/file"])).toEqual([null, "contents"]);
//   });
//
//   test("takes a data,cb->(nothing) fn and return [err, null] with cb(err, null)", async () => {
//     expect(await H.callback(readFile, [null, "unknown"])).toEqual(["file not found", null]);
//   });
//
//   test("does nothing with errors", async () => {
//     let fakeReadFile = jest.fn();
//     expect(await H.callback(readFile, ["error", null])).toEqual(["error", null]);
//     expect(fakeReadFile).toHaveBeenCalledTimes(0);
//   });
// });
