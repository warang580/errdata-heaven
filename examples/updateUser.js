const H = require('../src/heaven');
const U = require('../src/utils');

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

let guardAdult = (user) => {
  if (user.age < 18) {
    return "User must be an adult";
  }
}

let setUpdatedAtToNow = (request) => {
  return Object.assign({}, request, {
    updatedAt: new Date,
  });
};


let guardEmailUnique = (data) => {
  // @TODO: not implemented yet, let's say it's always passing
  return null;
}

let guardMissingField = (field, errorMessage, data) => {
  let value = data[field];

  if (! value) {
    return errorMessage
  }

  // no return or
  // return false|null;
}

let updateUserDb = (user) => {
  return new Promise((resolve, reject) => {
    // Take 100ms to update user
    setTimeout(() => {
      console.log("updated user!");

      // @NOTE: We resolve true as in "write successful"
      // This is for example sake, it would be easier to just resolve(user)
      // but this library is aimed to support existing code - not to
      // rewrite everything so it works ; so let's pretend existing code did that
      resolve(true);
    }, 100)
  });
};

let sendUpdateEmail = (user) => {
  return new Promise((resolve, reject) => {
    // Take 100ms to send an email
    setTimeout(() => {
      console.log("mail sent!");

      // @NOTE: simplify the example by resolving the user directly
      resolve(user);
    }, 100)
  });
};

// callback(err, written, string), nodejs style
let writeUser = (path, contents, callback) => {
  let raw = JSON.stringify(contents);

  console.log("written", raw, "(" + raw.length + " characters) in", path);

  callback(/* err */ null, /* written */ raw.length, /* string */ raw);
}

let handleUserUpdate = (user) => {
  let p = H.wrap(user);

  p = H.bind(checkName, p);
  p = H.bind(checkEmail, p);
  p = H.guard(guardEmailUnique, p);
  p = H.guard(U.partial(guardMissingField, "age", "Missing user age"), p);
  p = H.guard(guardAdult, p);
  p = H.map(setUpdatedAtToNow, p);
  p = H.unwrap((err, data) => {
    console.log("current user", err, data);
  }, p);
  // UpdateUser but keep existing user at merge
  p = H.merge((d1, d2) => ({...d1, saved: d2}), p, H.promise(updateUserDb, p));
  // Write user but only keep "write size"
  p = H.merge((user, write) => ({...user, written: write[0]}),
    // user
    p,
    // Writing user to filesystem
    H.callback((user, cb) => writeUser('path/to/user', user, cb), p)
  )

  p = H.promise(sendUpdateEmail, p);

  return p;
}

H.tap(data => {
  console.log("user has been updated", data);
}, handleUserUpdate({name: "John Doe", email: "john.doe@mail.com", age: 40 }))

console.log("starting updating ...");
