# CHANGELOG

## [Unreleased](https://github.com/warang580/errdata-heaven/compare/master...develop)

- README examples
- `rescue(data)` : transforms failing errdata into valid errdata with `data` (useful for default values like [] when a listing fails)

## [0.2.0](https://github.com/warang580/errdata-heaven/compare/0.1.2...0.2.0) (2020-03-07)

The goal of these changes is to simplify the whole API. These are breaking changes,
but I don't want to call this a 1.0.0 so here we are with a 0.2.0 version.

- `heaven.wrap(data)` becomes now `heaven(data)` (`heaven` is a constructor fn)

- All methods are now based on the object returned by `heaven()` and `return this` to allow chaining
  - `H.errtap(H.tap(cb, H.wrap(value)))` becomes `heaven(value).then(cb).catch(cb)`

- Better naming
  - `wrap` and `errwrap` are handled by the constructor (`heaven(data)` and `heaven(null, err)`)
  - `guard(fn, err)`  : err used if `fn` returns true (instead of being handled inside fn)
  - `assert(fn, err)` : err used if `fn` returns false (instead of being handled inside fn) [NEW]
  - `tap` is now `then` (same as the Promise keyword)
  - `errtap` is now `catch` (same as the Promise keyword)
  - `unwrap` is now `tap`

- `unwrap` still exist and now is a function that returns the wrapped errdata promise (useful for `await`)
- `merge` works for 2+ errdatas now
