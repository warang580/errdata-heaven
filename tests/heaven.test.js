const H = require("../src/heaven");

describe("from", () => {
  test("convert data into errdata", () => {
    expect(H.from("hello")).toEqual([null, "hello"]);
  });
});

describe("error", () => {
  test("convert err into errdata", () => {
    expect(H.error("something bad happened")).toEqual(["something bad happened", null]);
  });
});

describe("bind", () => {
  let checkAdult = (user) => {
    if (user.age < 18) {
      return ["User should be an adult", null];
    }

    return [null, user];
  };

  test("uses fn on data when there's no error", () => {
    expect(H.bind(checkAdult, [null, {age: 30}])).toEqual([null, {age: 30}]);
  });

  test("uses fn on data when there's no error", () => {
    expect(H.bind(checkAdult, [null, {age: 16}])).toEqual(["User should be an adult", null]);
  });

  test("does nothing with errors", () => {
    expect(H.bind(checkAdult, ["Invalid user name", null])).toEqual(["Invalid user name", null]);
  });
});

describe("map", () => {
  test("transforms data without errors", () => {
    expect(H.map(x => (x + 1), [null, 5])).toEqual([null, 6]);
  });

  test("does nothing with errors", () => {
    expect(H.map(x => (x + 1), ["Something went wrong", null])).toEqual(["Something went wrong", null]);
  });
});

describe("tap", () => {
  test("calls cb(value) and returns [null, value]", () => {
    let cb = jest.fn().mockImplementation(() => "unusedReturn");

    expect(H.tap(cb, [null, "value"])).toEqual([null, "value"]);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  test("does nothing with errors", () => {
    let cb = jest.fn();

    expect(H.tap(cb, ["error", null])).toEqual(["error", null]);
    expect(cb).toHaveBeenCalledTimes(0);
  });
});

describe("promise", () => {
  test("takes a data->promise fn and return [null, value] with .then()", async () => {
    let slowInc = (x) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve(x + 1), 100);
      });
    };

    expect(await H.promise(slowInc, [null, 2])).toEqual([null, 3]);
  });

  test("takes a promise and return [err, null] with .catch()", async () => {
    let badInc = (x) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => reject("too hard"), 100);
      });
    };

    expect(await H.promise(badInc, [null, 3])).toEqual(["too hard", null]);
  });

  test("does nothing with errors", async () => {
    let p = jest.fn();

    expect(await H.promise(p, ["error", null])).toEqual(["error", null]);

    expect(p).toHaveBeenCalledTimes(0);
  });
});

describe("callback", () => {
  let readFile = (path, callback) => {
    if (path == "path/to/file") {
      callback(null, "contents");
      return;
    }

    callback("file not found");
  };

  test("takes a data,cb->(nothing) fn and return [null, value] with cb(null, value)", async () => {
    expect(await H.callback(readFile, [null, "path/to/file"])).toEqual([null, "contents"]);
  });

  test("takes a data,cb->(nothing) fn and return [err, null] with cb(err, null)", async () => {
    expect(await H.callback(readFile, [null, "unknown"])).toEqual(["file not found", null]);
  });

  test("does nothing with errors", async () => {
    let fakeReadFile = jest.fn();
    expect(await H.callback(readFile, ["error", null])).toEqual(["error", null]);
    expect(fakeReadFile).toHaveBeenCalledTimes(0);
  });
});
