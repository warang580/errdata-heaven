const F = require('./futils')
const H = require('./errdata-heaven')

// Note: the first occurring error will be the last

/*
Usecase: Updating some customer information via a webservice
- A user submits some data (userid, name, email, age)
- Check that name, email and age are valid (=> validation errors ?)
- The appropriate user record in a database is updated with the new data (=> db error ?) (=> user not found ?)
- If the email has changed, send an email to that address (=> smtp errors ?)
- Show result
*/

// Putting the example in async function so I can await stuff

async function usecase(userRequest) {
  // Create errdata from data
  let response = H.from(userRequest);

  // data -> errdata
  let checkName = (user) => {
    let name = user.name;

    if (! name) {
      return ["Missing user name", null];
    }

    if (name.length <= 3) {
      return ["User name is not long enough", null];
    }

    return [null, user];
  }

  // data -> errdata
  let checkEmail = (user) => {
    let email = user.email;

    if (! email) {
      return ["Missing user email"];
    }

    if (email.indexOf('@') === -1) {
      return ["User email has no @"];
    }

    return [null, user];
  }

  // bind is for data->errdata functions
  response = H.bind(checkName, response);
  response = H.bind(checkEmail, response);

  // ===========================================================================

  // Refactoring for not checking fields every time
  let guardMissingField = (field, errorMessage, data) => {
    let value = data[field];

    if (! value) {
      return errorMessage
    }

    // no return or
    // return false|null;
  }

  // Transform guardMissingField into a function that only takes "data" in
  // by pre-setting other variables by currying the function
  // so it can check that user.age is there
  let guardMissingAge = F.curry(guardMissingField, "age", "Missing user age");

  // guard is for data->err functions (no error = return nothing|null|false)
  response = H.guard(guardMissingAge, response)

  // data -> err
  let guardAge = (user) => {
    if (user.age < 18) {
      return "User must be an adult";
    }
  }

  response = H.guard(guardAge, response);

  // ===========================================================================

  let setUpdatedAtToNow = (request) => {
    return Object.assign({}, request, {
      updatedAt: new Date,
    });
  };

  // map is for data -> data functions
  response = H.map(setUpdatedAtToNow, response);

  // ===========================================================================

  let logger = F.curry(console.log, "tap");

  // tap is for data->(nothing) functions (for side-effects) (or for ignoring return value)
  response = H.tap(logger, response);

  // ===========================================================================

  let updateUser = (user) => {
    return new Promise((resolve, reject) => {
      // Take 100ms to update user
      F.delay(() => {
        console.log("user updated");

        // @NOTE: simply the example by resolving the user directly
        resolve(user);
      }, 100)
    });
  };

  // // NOTE: putting it in a function so async/await can work inside
  // let syncUpdateUser = async (user) => {
  //   let result = await H.promise(updateUser(user))
  //
  //   console.log("result", result);
  //
  //   return result;
  // }

  response = await (H.promise(updateUser, response));

  // @TODO?: could be H.await(updateUser, response)
  // so there's no "leak of a promise"

  // promise is for data -> promise functions
  //response = H.bind(H.promise(updateUser), response);

  // ===========================================================================

  // @TODO: after promise stuff

  // // Simulate NodeJs-like callbacks
  // let writeFile = (file, contents, cb) => {
    //   // Pretend we write a file in 500ms
    //   F.delay(() => {
      //     console.log("writing done", file, contents);
      //
      //     cb(null, contents);
      //   }, 500);
      // }
      //
      // let writeUser = (errback, user) => {
        //   return writeFile("user.txt", JSON.stringify(user), errback);
        // }
        //
        // // Not sure it does what I think it does
        // response = H.bind(F.curry(writeUser, H.callbackToPromise), response);

        // ===========================================================================

        console.log("done", response);
}

let userRequest = {name: "John Doe", email: "jdoe@mail.com", age: 30};
usecase(userRequest);
