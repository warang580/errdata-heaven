# [err,data] heaven

**Disclaimer** : this project is very young, don't use it in production yet ! Also, my primary language isn't english so feel free to correct anything.

This library will simplify all the code handling async stuff like promises or callbacks.
**Say goodbye to callback hell and await hell.**

# The problem

I already know how to handle promises and callbacks ... Why would I need another useless library ? :thinking:

When we think about Promises we think generally about something like this :

```js
user.update(data).then(user => {
  console.log("user", user);
  // ...
}).catch(err => {
  console.error("Something bad happened", err)
})
```

or

```js
try {
  let user = await user.update(data);

  console.log("user", user);
  // ...
} catch (err) {
  console.log("Something bad happened", err);
}
```

Simple, right ?

Ok, but in reality, nothing is that simple. The client actually wants to check that the user has a valid email because we will send him a mail after the update is done, but only if his email changed.
We have to check for SMTP errors too. (let's say that our UI requirement for telling the user about what happened is just console.log or console.error)

```js
async function updateUser(data) {  
  try {
    if (! validEmail(data)) {
      console.error("User e-mail is not valid");
      return;
    }

    let currentUser = await user.get(data);
    let updatedUser = await user.update(data);

    if (currentUser.email != user.email) {
      await mail.send(user.mail, "...");
    }

    console.log("user updates", user);
  } catch (err) {
    // SMTP errors are probably going to be catched here ¯\_(ツ)_/¯
    console.log("An error occured", err);
  }
}
```

Not so nice. You can see that more verifications could lead to another level in the nested callback/promise realm.
Speaking of the devil, let's say our "real" usecase for updating the user is this :

```
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

How do you handle all that nicely ? That's way more complicated, so it will be uglier, right ?
Unfortunately, that scenario is really common in data-oriented programs.

The problem is the same whether we're using callbacks, promises (they use callbacks too) or async/await + try/catch everywhere.

# The solution

The idea is simple : Instead of working on errors and data as separate entities, we work on something that's representing both at the same time and that's the thing we pass around in functions.

If you have already used NodeJs, you have seen a lot of callbacks like this

```js
fs.readFile('path/to/file', (err, data) => {
  if (err) {
    // handle failure
  }

  // handle file contents
});
```

Here you have `err` and `data` as parameters of the callback : `err` contains any error that have occured while we tried to read the file and `data` contains the contents of the file we read. In this library, the concept `errdata` is simply an array that contains both err and data (`[err, data]`) on which we have methods.

Only one of err and data is set at a time, the other is always null.

`[err, null]` means an error occured
`[null, data]` means no error occured

You might say that it doesn't change anything. But the clever twist is this : You generally don't care about data *when an error occured*. Say you wanted to update a user, whether the error is from the request validation that fails, a crash from the database, etc. you want to stop processing data. You don't want to send an email when you didn't load correctly its contents when reading a file. In this library, we handle that behaviour by default which simplifies a lot the code. As a developer, you're just dealing with something that is potentially an error or real data but you don't care until the end.

@TODO: Use "railway" metaphor to illustrate (data = track#1, err = track#2)
Every time there's an error (because of domain rules or program errors), you're redirected to the "error" track and all the code that is for the "data" track does not apply.

And since we're applying the same concept for promises and callbacks, you can have the same nice syntax API over anything that can be async.

# Ok that seems nice, but can I see some actual code ? I don't really *get* it

## Examples

- A simple HTTP request : `examples/fetchJoke.js`
- Full user updated usecase discussed above : `examples/updateUser.js`

# Using it

## Installation

NPM  : `npm install errdata-heaven`

Yarn : `yarn add errdata-heaven`

## Usage

```js
// ES6
import H from "errdata-heaven";
```

```js
// ES5
var H = require("errdata-heaven");
```

```js
// Require.js
define(["require"] , function (require) {
    var H = require("errdata-heaven");
});
```

# Full API explanations

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

# Maybe later

- (@TODO: explain that it chooses to not handle "native" errors auto-magically ... yet ?)
  - Or does it ? I've never tested it
- `H.merge((d1, d2, d3, ...) => {}, p1, p2, p3, ...)` ?
- `H.rescue` (err -> errdata) ?
