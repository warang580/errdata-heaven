const H = require("../src/heaven");

// Testing promise values not available at start
let later = (value) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, 100);
  })
}

describe("from", () => {
  test("convert data into P(errdata)", async () => {
    expect(await H.from("hello")).toEqual([null, "hello"]);
  });
});

describe("promise", () => {
  let slowInc = (x) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(x + 1), 100);
    });
  };

  test("data->promise", async () => {
    expect(await H.promise(slowInc, later([null, 2]))).toEqual([null, 3]);
  });

  // @TODO: promise fails
  // @TODO: errdata fails
  // @TODO: err not null
});

describe("map", () => {
  test("data->data into P(errdata)", async () => {
    expect(await H.map(x => (x + 1), later([null, 5]))).toEqual([null, 6]);
  });

  // @TODO: promise fails
  // @TODO: errdata not deferred
  // @TODO: errdata fails
  // @TODO: err not null
});

describe("bind", () => {
  test("data->errdata into P(errdata)", async () => {
    expect(await H.bind(x => [null, x], later([null, 5]))).toEqual([null, 5]);
  });

  // @TODO: promise fails
  // @TODO: errdata not deferred
  // @TODO: errdata fails
  // @TODO: err not null
});

describe("guard", () => {
  test("data->err into P(errdata)", async () => {
    expect(await H.guard(x => null, later([null, 5]))).toEqual([null, 5]);
  });

  // @TODO: promise fails
  // @TODO: errdata not deferred
  // @TODO: errdata fails
  // @TODO: err not null
});

// describe.skip("bind", () => {
//   let checkAdult = (user) => {
//     if (user.age < 18) {
//       return ["User should be an adult", null];
//     }
//
//     return [null, user];
//   };
//
//   test("uses fn on data when there's no error", () => {
//     expect(H.bind(checkAdult, [null, {age: 30}])).toEqual([null, {age: 30}]);
//   });
//
//   test("uses fn on data when there's no error", () => {
//     expect(H.bind(checkAdult, [null, {age: 16}])).toEqual(["User should be an adult", null]);
//   });
//
//   test("does nothing with errors", () => {
//     expect(H.bind(checkAdult, ["Invalid user name", null])).toEqual(["Invalid user name", null]);
//   });
// });

describe("tap", () => {
  test("data->(nothing)", async () => {
    let cb = jest.fn().mockImplementation(() => "unusedReturn");

    expect(await H.tap(cb, later([null, "value"]))).toEqual([null, "value"]);

    expect(cb.mock.calls.length).toBe(1);
    expect(cb.mock.calls[0][0]).toEqual("value");
  });

  // @TODO: promise fails
  // @TODO: errdata not deferred
  // @TODO: errdata fails
  // @TODO: err not null
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

  test("applies partially arguments", () => {
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
