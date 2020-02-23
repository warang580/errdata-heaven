const F = require("../src/utils");

describe("partial application", () => {
  let sum = (x, y) => (x + y);

  test("applies partially arguments", () => {
    expect(sum(1, 2)).toEqual(3);

    expect(F.partial(sum)(1, 2))  .toEqual(3);
    expect(F.partial(sum, 1)(2))  .toEqual(3);
    expect(F.partial(sum, 1, 2)()).toEqual(3);
  });
});

describe("tap", () => {
  test("calls cb(value) and returns [null, value]", () => {
    let cb = jest.fn().mockImplementation(() => "bad");

    expect(F.tap(cb, "value")).toEqual("value");
    expect(cb.mock.calls.length).toBe(1);
    expect(cb.mock.calls[0][0]).toEqual("value");
  });
});

// Not tested F.delay() because it's an easy function for debug and I'm lazy
