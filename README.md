# Callbacks/Promises heaven with [err,data] all the way

**Disclaimer** : this project is a work in progress, don't use it yet !

Avoid callback/promises hell by handling data/errors/callbacks/promises, etc.
with an API that creates and transforms `errdata` (= `[err, data]`) promises.

(@TODO: explain that it chooses to not handle "native" errors auto-magically ... yet ?)

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

@TODO: What are we doing now ? (callback hell => promise hell => await everything [tm])

# Another way

@TODO: Use "railway" metaphor to illustrate (data = track#1, err = track#2)

## Procedural examples

@TODO

## Functional examples

@TODO

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

<method>(fn, ..., ^errdata)
("^" means in a promise)

data is always last, so it can be "late-bound"

## Constructors (methods that returns ^errdata, can be used as 2nd argument of methods)

- `wrap(value)` : Wraps a simple value into a Promise(Errdata)
- `promise(syncFnReturningPromise, ^errdata)`  : Transform Promise(value) to Promise(Errdata)
- `callback(syncFnWithCallback, ^errdata)` : Transform callback(err, ...data) to Promise(Errdata)

## Transforms on ^errdata

- `bind(syncFn, ^errdata)`   : Transform an Promise(Errdata) with a data->errdata fn

- `guard(syncFn, ^errdata)`  : Transform an Promise(Errdata) with a data->err fn

- `map(syncFn, ^errdata)`    : Transform an Promise(Errdata) with a data->data fn

- `tap(syncFn, ^errdata)`    : Apply a data->*ignored* to a Promise(Errdata)
Note: `tap` doesn't wait async behaviour, that's a feature, not a bug

- `errtap(syncFn, ^errdata)` : Apply a err->*ignored*  to a Promise(Errdata)

## "Destructors"

- `unwrap(syncFn, ^errdata)` : Apply a errdata->*ignored* to a Promise(Errdata)

// Useful for ending "streams" (instead of await + try/catch)
p = unwrap((err,data) => {...}, ^errdata)
// or for debug
let logger = (label) => ((err, data) => { console.log(label, err, data) });
p = unwrap(logger, p)

@TODO: further explanations

# Maybe later

- `H.merge((d1, d2, d3, ...) => {}, p1, p2, p3, ...)` ?
- `H.rescue` (err -> errdata) ?
