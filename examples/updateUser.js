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

let updateUser = H.pipe(
  [H.from],
  // [H.bind,  checkName],
  // [H.bind,  checkEmail],
  // [H.guard, guardEmailUnique],
  [H.guard, H.partial(guardMissingField, "age")],
  // [H.guard, guardAdult],
  [H.map, setUpdatedAtToNow],
  [H.promise, updateUserDb],
  // [H.callback, writeUser],
  [H.promise, sendUpdateEmail],
);

// @TODO: merging strategy when promise don't return what we want (tap/merge)
// => probably remove "promise" fct and handle everything as a potential promise

updateUser({name: "John Doe", age: 30}).then(([err, data]) => {
  console.log("update?", err, data);
});

console.log("your request is in progress...")
