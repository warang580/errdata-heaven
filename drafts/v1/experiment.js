const { curry, wrap, compose, pipe, delay } = require("./base");

// Wrap a promise into a function so it's not started at construction
// time but only when unwrapping the promise
// Usage:
// (constructors/promise callback)
let constructPromise = (callback) => {
    return () => new Promise(callback)
}

let printAndReturn = (label, x) => {console.log(label, x); return x};
// compose(curry(printAndReturn, "1", curry(printAndReturn, "2")("hello");

// (list/random [:a :b :c :d :e]) ; => :c
let randomEl = function (list) {
  return list.length == 0 ? null : list[Math.floor(Math.random() * list.length)];
}

// let sum = (a, b) => a + b;
// sum(1, 2) == curry(sum, 1)(2) == curry(sum, 1, 2)()

let fetchSomething = constructPromise((resolve, reject) => {
  delay(randomEl([
    curry(resolve, 'foo'),
    curry(resolve, 'bar'),
    curry(resolve, 'baz'),
    curry(reject,  'nope'),
  ]));
});

// fetchSomething()
// .then (curry(console.log, "got"))
// .catch(curry(console.log, "err"))

// states = [:success :validation-error :update-error :smtp-error]
// ... or, simplified :
// states = [:success :error] (note: no :pending because we ignore "transit" for now)

/*
Usecase: Updating some customer information via a webservice
- A user submits some data (userid, name, email)
- Check that name and email are valid (=> validation errors ?)
- The appropriate user record in a database is updated with the new data (=> db error ?) (=> user not found ?)
- If the email has changed, send an email to that address (=> smtp errors ?)
- Show result
*/

// V1 with everything in one function

let user = {name: "John Doe", email: "john.doe@gmail.com"};

// (validate-request req) ; => [state, data]
let validateRequest = (request) => {
  if (! request.name) {
    return ["error", "Name must be present"];
  }

  if (! request.email) {
    return ["error", "E-mail must be present"];
  }

  return ["success", request];
}

// console.log("validation", validateRequest(user));

// V2 with splitted validation functions
// Note that they take 1 arg and return "2" things (not really with an array but hey)

let validateName = input => {
  if (! input.name) {
    return ["error", "Name must not be blank"];
  }

  return ["success", input];
}

let validateEmail = input => {
  if (! input.email) {
    return ["error", "Email must not be blank"];
  }

  return ["success", input];
}

let validateNameLength = input => {
  if (input.name.length <= 5) {
    return ["error", "Name should be more than 5 characters"];
  }

  return ["success", input];
}

// (adapters/bind fn val) ; => [state, data]
// transforms a 1->2 fn into a 2->2 fn
let adapterBind = (dataFn, stateInput) => {
  let [state, data] = stateInput;

  switch (state) {
    case "success":
      return dataFn(data);
    break;

    // case "error":
    // not needed because we "skip" errors

    default:
      // Don't do anything otherwise
      return stateInput;
    break;
  }
}

let constructRail = (state, value) => {
  return [state, value];
}

// let validateRequest2 = pipe(
//   // 1 track (value itself)
//   constructRail,
//   // 2 tracks ("machine")
//   curry(adapterBind, validateName),
//   // curry(printAndReturn, "after validate"),
//   curry(adapterBind, validateEmail),
//   curry(adapterBind, validateNameLength),
// );

let bind = curry(curry, adapterBind);

// @TODO: possible to break down this even more (uppercase=>update-in + not hard-coded state)
// let uppercase = data => {
//   let { name } = data;
//   return ["success", {...data, name: name.toUpperCase()}];
// }

// Perfect to start "a track"
let toSwitch = (fn, x) => {
  return ["success", fn(x)];
}

// @TODO: map (2-track input => 2-track output by using fn on success states)

// let uppercase = data => {
//   let { name } = data;
//
//   return toSwitch(() => {
//     return {...data, name: name.toUpperCase()}
//   })
// }

let updateIn = (data, field, fn) => {
  return { ...data, [field]: fn(data[field]) };
}

let toUppercase = s => s.toUpperCase();
let uppercase = (field, data) => {
  return toSwitch(curry(updateIn, data, field, toUppercase));
}


let validateRequest2 = pipe(
  // 1 track (value itself)
  curry(constructRail, "success"),
  // 2 tracks ("machine")
  bind(validateName),
  // curry(printAndReturn, "after validate"),
  bind(validateEmail),
  bind(validateNameLength),
  bind(curry(uppercase, 'name')),
  bind(curry(uppercase, 'email')),
);

// console.log("done validation 2", validateRequest2(user), validateRequest2({name: "wat"}));

// V3 with merging rules

// Merge 2 (1->2 tracks fns) and transforms it into 1 (1->2 track fn)
let merger = (bindFn1, bindFn2, input) => {
  return pipe(
    bindFn1,
    curry(adapterBind, bindFn2),
  )(input);
}

let validateRequest3 = pipe(
  // 1 track (value itself)
  curry(merger, validateName, validateNameLength),
  // => 2 tracks
  curry(adapterBind, validateEmail),
);

// console.log("done validation 3", validateRequest3(user), validateRequest3({name: "Hi"}));

// @TODO: dead ends

// @TODO later: Nice, but how about ... promises ???

// lambda (print (str "Hello" "world"))
