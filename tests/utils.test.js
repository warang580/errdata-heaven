const U = require("../src/utils");

describe("partial application", () => {
  let sum = (x, y) => (x + y);

  test("applies partially arguments", () => {
    expect(sum(1, 2)).toEqual(3);

    expect(U.partial(sum)(1, 2))  .toEqual(3);
    expect(U.partial(sum, 1)(2))  .toEqual(3);
    expect(U.partial(sum, 1, 2)()).toEqual(3);
  });
});

describe("tap", () => {
  test("calls cb(value) and returns [null, value]", () => {
    let cb = jest.fn().mockImplementation(() => "bad");

    expect(U.tap(cb, "value")).toEqual("value");
    expect(cb.mock.calls.length).toBe(1);
    expect(cb.mock.calls[0][0]).toEqual("value");
  });
});

describe("pipe", () => {
  let add = (x, y) => (x + y);
  let mul = (x, y) => (x * y);

  test("transforms list of [fn, ...args] into one function", () => {
    expect(U.pipe(
      [add, 1],
      [mul, 2],
      [add, 2],
    )(1)).toEqual(6);
  });
});
