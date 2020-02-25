# Callbacks/Promises heaven with [err,data] all the way

**Disclaimer** : this is just an experiment for the moment, don't **actually** use it ! Definitely not in production, and probably not in dev either.

Avoid callback/promises hell by handling data/errors/callbacks/promises, etc.
through promises + [err, data] format (what I call `errdata`) and work on that with an API (that is like an Either monad, or that would be what I would say if I an idea what it really means).

(@TODO: explain that it chooses to not handle "native" errors auto-magically)

# Wait, I already do this ... Why would I need another useless library ?

Let's say our usecase is this :

```
Updating some customer information via a webservice
- Incoming request : A user wants to update their data (userid, name, email, age)
- Check that name, email and age are valid
- The appropriate user record in a database is updated with the new data (change updated_at)
- If the email has changed, send an email to that address
- Send an appropriate response to show the results of the request
```

@TODO: code

Simple, right ? But that's only the happy path. We didn't handle any errors there.

The "real" usecase is this :

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

@TODO: What we're doing now (callback hell => promise hell => await everything [tm])

# Ok, what's your superior way of doing things then ? :thinking:

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

@TODO: Use "railway" metaphor to illustrate (data = track#1, err = track#2)

## Methods (~transforms)

- `wrap` : Wraps a simple value into a Promise(Errdata)
- `bind` : Transform an Promise(Errdata) with a data->errdata fn
- `map`  : Transform an Promise(Errdata) with a data->data fn
- `tap`  : Apply a data->(ignored) to a Promise(Errdata)

## "Adapters"

- `promise`  : Transform Promise(value) to Promise(Errdata)
- `callback` : Transform callback(err, ...values) to Promise(Errdata)

@TODO: further explanations

# Still open questions

I will need real usage examples to decide what I want.

- Callbacks :  Should multiple "data" args merged into data ?

Example : `nodejs.fs.write(/* ... */, cb(err, written, string) => {})`
should maybe be merged into [err, [written, string]] ? or [err, {written, string}] ?

- How do you handle Promises/Callbacks that should only tap and not map

`request = H.tap(await H.promise(saveIntoDatabase, request))`

`request = H.map(await H.promise(fetchFromDatabase, request))`

=> H.promise should not replace tap/map/merge, it should "complement" it ; same for H.callback

- We need merge strategies for merging 2+ promises

- H.merge(mergeDataStrategy, [...sources], p)

- H.rescue (for err -> errdata) ?

- H.errtap ?
