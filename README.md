# [err,data] heaven

**Disclaimer** : this project is very young, don't use it in production yet ! Also, my primary language isn't english so feel free to correct anything.

This library will simplify all the code handling async stuff like promises or callbacks.

**Say goodbye to callback hell and await hell.**

The idea is simple : Instead of working directly on errors and data as separate things, we work on a thing that's representing both at the same time.

If you have already used NodeJs, you have seen a lot of callbacks like this

```
fs.readFile('path/to/file', (err, data) => {
  if (err) {
    // handle failure
  }

  // handle file contents
});
```

Here you have `err` and `data` as parameters of the callback : `err` contains any error that have occured while we tried to read the file and `data` contains the contents of the file we read. In this library, the concept `errdata` is simply an array that contains both err and data (`[err, data]`) on which we have methods.

The clever twist is this : You generally don't care about data when an error occured. Say you wanted to update a user, whether the error is from the request validation, the database that has crashed, etc. you want to stop processing this data. You don't want to send an email when you didn't load correctly its contents when reading a file. It simplifies a lot the api.

Only one is set, the other is always null
(it could have been [true, data] but it doesn't work with existing api well and you always have to test what's the meaning of data ; in [err,data] you always know that the data is the 2nd position so you can ignore errors if that's what you want)


by handling data/errors/callbacks/promises, etc.
with an API that creates and transforms `errdata` (= `[err, data]`) promises.
Forget that you're using async/promises

# I already know how to handle Promises ... Why would I need another useless library ? :thinking:

When we think about Promises we think generally about simple usecases :

> Given a user.update function that returns a Promise

```
user.update(data).then(user => {
    console.log("user", user);
    // ...
}).catch(err => {
    console.error("Something bad happened", err)
})
```

or

```
try {
    let user = await user.update(data);

    console.log("user", user);
    // ...
} catch (err) {
    console.log("Something bad happened", err);
}
```

Simple, right ?

But, let's say our usecase is this (which is really common in data-oriented programs)

```
Updating some customer information via a webservice
- Incoming request : A user wants to update their data (userid, name, email, age)
- Check that name, email and age are valid
  - validation errors ?
  - maybe checking that we don't have any other user with that new email ?
- The appropriate user record in a database is updated with the new data
  - db error ?
  - user not found ?
- If the email has changed, send an email to that address
  - smtp errors ?
- Send an appropriate response to show the results of the request
```

@TODO: code

That's way more complicated **and** ugly.

@TODO: What are we doing now ? (callback hell => promise hell => await(+try/catch + if) everything [tm])

# Another way

@TODO: Use "railway" metaphor to illustrate (data = track#1, err = track#2)

## Examples

- `examples/fetchJoke.js`
- `examples/updateUser.js`

# Using it

## Installation

NPM  : `npm install errdata-heaven`

Yarn : `yarn add errdata-heaven`

## Usage

```
// ES6
import H from "errdata-heaven";
```

```
// ES5
var H = require("errdata-heaven");
```

```
// Require.js
define(["require"] , function (require) {
    var H = require("errdata-heaven");
});
```

# API

@TODO: Re-use "railway" metaphor

(note: internally ^errdata is a promise that resolves to an errdata ; but the library is meant to be used ignoring this fact)

<method>(fn, ..., ^errdata)
("^" means in a promise)

data is always in the last argument(s), so it can be "late-bound" with "pipes" (easier for functional programming)

## Constructors (methods that returns ^errdata, can be used as last argument of other methods

- `wrap(value)` : Wraps a simple value into a Promise(Errdata)
- `promise(syncFnReturningPromise, ^errdata)`  : Transform Promise(value) to Promise(Errdata)
- `callback(syncFnWithCallback, ^errdata)` : Transform callback(err, ...data) to Promise(Errdata)

## Transforms on ^errdata

- `bind(syncFn, ^errdata)`   : Transform an Promise(Errdata) with a data->errdata fn

- `guard(syncFn, ^errdata)`  : Transform an Promise(Errdata) with a data->err fn

- `map(syncFn, ^errdata)`    : Transform an Promise(Errdata) with a data->data fn

## Applying side-effects on ^errdata

- `tap(syncFn, ^errdata)`    : Apply a data->*ignored* to a Promise(Errdata)
Note: `tap` doesn't wait async behaviour, that's a feature, not a bug

- `errtap(syncFn, ^errdata)` : Apply a err->*ignored*  to a Promise(Errdata)

- `unwrap(syncFn, ^errdata)` : Apply a errdata->*ignored* to a Promise(Errdata)

// Useful for ending "streams" (instead of await + try/catch)
p = unwrap((err,data) => {...}, ^errdata)
// or for debug
let logger = (label) => ((err, data) => { console.log(label, err, data) });
p = unwrap(logger, p)

@TODO: further explanations

# Maybe later

- (@TODO: explain that it chooses to not handle "native" errors auto-magically ... yet ?)
  - Or does it ? I've never tested it
- `H.merge((d1, d2, d3, ...) => {}, p1, p2, p3, ...)` ?
- `H.rescue` (err -> errdata) ?
