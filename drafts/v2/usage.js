const F  = require("./base");
const ED = require("./errdata");

// "Branding"
// Avoid callback/promises hell, "heaven"

/*
Usecase: Updating some customer information via a webservice
- A user submits some data (userid, name, email, age)
- Check that name, email and age are valid (=> validation errors ?)
- The appropriate user record in a database is updated with the new data (=> db error ?) (=> user not found ?)
- If the email has changed, send an email to that address (=> smtp errors ?)
- Show result
*/


let updateAge = u => ({name: u.name, age: u.age + 1})
let checkUserEmail = u => {
  let { email } = u;

  if (! email) {
    return ["No email was given"];
  }

  return [null, u];
};

// (bad DX to force developer to come up with these themselves)
// functional mapping|binding
let map  = (fn) => F.curry(ED.map,  fn);
let bind = (fn) => F.curry(ED.bind, fn);

// this works well for functionnal pipes,
// but I wonder if it could be used in procedural code as well
let handle = F.pipe(
  ED.errdata,
  map(updateAge),
  bind(checkUserEmail),
  // @TODO: guard(guardEmail) // guardEmail => false|nothing if no problem, truthy == error
  // merge(await (errback(updateUser)))
  // @TODO: merge(otherErrdata)
  F.curry(ED.tap, F.curry(console.log, "data")),
);

let userRequest = {name: "John Doe", age: 30};

let response = handle(userRequest);
console.log("response", ED.success(response), response);
