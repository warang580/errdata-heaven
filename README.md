# [err,data] heaven

**Disclaimer** : this project is very young, don't use it in production yet ! Also, my primary language isn't english so feel free to correct anything.

This library will simplify all the code handling async stuff like promises or callbacks. It's not meant to be a competitor of RxJS, it is a simple wrapper for "single-use promises" like you see a lot in your typical Vue/React components.

**Say goodbye to callback hell and await hell.**

# Examples

## Using promise results

Note: `User.update(data)` returns a promise with the updated user

```js
// Async/Await version
try {
  let user = await User.update(data);
  /* Do something with user... */
} catch (err) {
  /* Do something with error... */
}
```

```js
// Promise version
User.update(data)
  .then(user => { /* Do something with user... */ })
  .catch(err => { /* Do something with error... */ })
```

```js
// Errdata version (looks similar as Promise version)
heaven(User.update(data))
  .then(user => { /* Do something with user... */ })
  .catch(err => { /* Do something with error... */ })
```

OR
```js
// Errdata (using both error and user directly)
heaven(User.update(data))
  .tap(([err, user]) => { /* Do something with error or user... */ })
```

## Awaiting promise results

```js
// Promise + Async/await version
try {
  let user = await User.update(data);
  // Do something with user...
} catch (err) {
  // Do something with error...
}
```

```js
// Errdata version
let [err, user] = await heaven(User.update(data)).unwrap();
// Do something with user or error...
```

## Transforming data

For this example, we don't want to do anything when an error happens.

```js
// Async/await version
try {
  let res = await getJson(jokeUrl);

  console.log("Joke:", res.data.today.joke);
  // ^^^ This might fail if request does not contain "today"
  // but this is catched with the "try/catch", so no crash happens
} catch (err) {}
// ^^^ You must explicitely catch errors to not break the rest of the program
```

```js
// Promise version

getJson(jokeUrl).then(res => {
  console.log("Joke:", res.data.today.joke);
  // ^^^ This might fail if request does not contain "today"
  // Errors are not handled by the promise so your program will crash
}).catch(err => {})
// ^^^ You must explicitely catch errors to avoid warnings about potential unhandled errors
```

```js
// Errdata version
heaven(jokeUrl)
  .promise(fetchJson)
  .apply(r => r.data.today.joke)
  // ^^^ callback will only called if no error happened
  // + any error that might happen in callback is handled as an error that can be catched
  .then(joke => console.log("Joke:", joke))
  // You don't need to explicitely catch anything when you don't want to deal with errors
```

## Data validation (udpating user only if data is valid)

Note: `User.validRequest` and `User.invalidEmail` are synchronous

```js
// Async/await version
async function updateUser(data) {  
  try {
    if (! User.validRequest(data)) {
      console.error("User data is not valid");
      return;
    }

    if (User.invalidEmail(data)) {
      console.error("User email is invalid");
      return;
    }

    let user = await User.update(data);

    console.log("updated", user);
  } catch (err) {
    // Any potentiel promise or programming errors handled here
    console.error("An error occured", err);
  }
}

await updateUser(data);
```

```js
// Promise version
function updateUser(data) {  
  if (! User.validRequest(data)) {
    console.error("User data is not valid");
    return;
  }

  if (User.invalidEmail(data)) {
    console.error("User email is invalid");
    return;
  }

  User.update(data)
    .then(user => console.log("updated", user))
    // Any potential promise errors handled here
    .catch(err => console.error("An error occured", err));
}

let promise = updateUser(data);
```

```js
// Errdata version
function updateUser(data) {  
  return heaven(data)
    .assert(User.validRequest, "User data is not valid")
    .guard(User.invalidEmail, "User email is invalid")
    .promise(User.update)
    .then(user => console.log("updated", user))
    .catch(err => console.error("An error occured", err));
    // Promise errors, programming errors and "domain" errors are all handled here
}

let promise = updateUser(data);
```

# Explanation

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

Here you have `err` and `data` as parameters of the callback : `err` contains any error that have occured while we tried to read the file and `data` contains the contents of the file we read. In this library, the concept `errdata` is simply an array that contains both err and data (`[err, data]`) on which we have methods. (Well, actually it's a Promise that resolves to [err, data] but you shouldn't care about that, we handle that for you)

Only one of err and data is set at a time, the other is always `null`. `[err, null]` means an error occured, `[null, data]` means no error occured.

You might say that it doesn't change anything. But the clever twist is this : You generally don't care about data *when an error occured*. Say you wanted to update a user, whether the error is from the request validation that fails, a crash from the database, etc. you want to stop processing data. You don't want to send an email when you didn't load correctly its contents when reading a file. In this library, we handle that behaviour by default which simplifies a lot the code. As a developer, you're just dealing with something that is potentially an error or real data but you don't care until the end.

@TODO: Use "railway" metaphor to illustrate (data = track#1, err = track#2)
Every time there's an error (because of domain rules or program errors), you're redirected to the "error" track and all the code that is for the "data" track does not apply.

And since we're applying the same concept for promises and callbacks, you can have the same nice syntax API over anything that can fail or is async like promises and callbacks.

# Using it

## Installation

NPM  : `npm install errdata-heaven`

Yarn : `yarn add errdata-heaven`

## Usage

```js
// ES6
import heaven from "errdata-heaven";
```

```js
// NodeJS
let heaven = require("errdata-heaven");
```

# Full API explanations

@TODO: Re-use "railway" metaphor

## "Constructor"

- `heaven(data)`      : Wraps data into errdata
- `heaven(null, err)` : Wraps error into errdata

## Transforming errdata's data

- `.promise(syncFnReturningPromise, errdata)` : Transform data->promise(data) to errdata
- `.callback(syncFnWithCallback, errdata)`    : Transform callback(err, ...data) to errdata

- `.bind(syncFn, errdata)`  : Transform errdata with a data->errdata fn
- `.guard(syncFn, errdata)` : Transform errdata with a data->err fn
- `.apply(syncFn, errdata)` : Transform errdata with a data->data fn
- `.merge(strategy, errdata1, errdata2, ...)` : Merge current errdata with multiple errdatas using a [data]->data fn

## Applying side-effects to errdata

- `.tap(syncFn, errdata)`   : Apply a errdata->*ignored* to errdata
- `.then(syncFn, errdata)`  : Apply a err->*ignored*  to errdata
- `.catch(syncFn, errdata)` : Apply a data->*ignored* to errdata

# More examples

- [A simple HTTP request](examples/fetchJoke.js)
- [Multiple requests](examples/githubUserRepos.js)
- [Full user updated usecase discussed above](examples/updateUser.js)

# TODO (?)

- `fork()` : would be an equivalent of merge(strategy, errdata, bindFn(errdata))
