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

## Methods

- `wrap` : Wraps a simple value into a Promise(Errdata)
- `bind` : Transform an Promise(Errdata) with a data->errdata fn
- `map`  : Transform an Promise(Errdata) with a data->data fn
- `tap`  : Apply a data->*ignored* to a Promise(Errdata)

## "Adapters"

- `promise`  : Transform Promise(value) to Promise(Errdata)
- `callback` : Transform callback(err, ...values) to Promise(Errdata)

@TODO: further explanations

# Still open questions

- Callbacks :  Should multiple "data" args merged into data ?

Example : `nodejs.fs.write(/* ... */, cb(err, written, string) => {})`
should maybe be merged into [err, [written, string]] ? or [err, {written, string}] ?

- How do you handle Promises/Callbacks that should only tap and not map

`request = H.tap(await H.promise(saveIntoDatabase, request))`

`request = H.map(await H.promise(fetchFromDatabase, request))`

=> H.promise should not replace tap/map/merge, it should "complement" it ; same for H.callback

- We need merge strategies for merging 2+ promises

- `H.merge(mergeDataStrategy, [...sources], p)`

- `H.rescue` (for err -> errdata) ?

- `H.errtap` ? yes, will be added
