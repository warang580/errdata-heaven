const H = require('../src/heaven');

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

      // @NOTE: simplify the example by resolving the user directly
      resolve(user);
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
  p = H.guard(H.partial(guardMissingField, "age", "Missing user age"), p);
  p = H.guard(guardAdult, p);
  p = H.map(setUpdatedAtToNow, p);
  p = H.promise(updateUserDb, p); // works as-is because updateUserDb returns User :+1:
  // Write user but don't save output in pipe
  p = H.dump("before write", p);
  // @NOTE: tap doesn't wait async behaviour ... bug or feature :thinking:
  p = H.tap(() => H.callback((user, cb) => writeUser('path/to/user', user, cb), p), p);
  p = H.dump("after write", p);
  p = H.promise(sendUpdateEmail, p);

  return p;
}

handleUserUpdate({name: "John Doe", email: "john.doe@mail.com", age: 40 }).then(([err, data]) => {
  console.log("done !", err, data);
}); // .catch() not needed

console.log("starting updating ...");
