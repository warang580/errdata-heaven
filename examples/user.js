// This file is for the updateUser example

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

let isAdult = (user) => {
  return user.age >= 18
}

let guardEmailUnique = (data) => {
  // @TODO: not implemented yet, let's say it's always passing
  return null;
}

let guardMissingField = (field, data) => {
  let value = data[field];

  if (! value) {
    return true;
  }

  // no return or
  // return false|null;
}

let update = (user) => {
  return new Promise((resolve, reject) => {
    // Take 100ms to update user
    setTimeout(() => {
      console.log("db updated user!");

      // @NOTE: We resolve true as in "write successful"
      // This is for example sake, it would be easier to just resolve(user)
      // but this library is aimed to support existing code - not to
      // rewrite everything so it works ; so let's pretend existing code did that
      resolve(true);
    }, 100)
  });
};

let sendMail = (user) => {
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
let write = (path, contents, callback) => {
  let raw = JSON.stringify(contents);

  console.log("written", raw, "(" + raw.length + " characters) in", path);

  callback(/* err */ null, /* written */ raw.length, /* string */ raw);
}

let setUpdatedAtToNow = (request) => {
  return Object.assign({}, request, {
    updatedAt: new Date,
  });
};

module.exports = {
  checkName,
  checkEmail,
  isAdult,
  guardEmailUnique,
  guardMissingField,
  update,
  sendMail,
  write,
  setUpdatedAtToNow,
}
