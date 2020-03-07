const Heaven = require('../src/heaven');
const User   = require('./user');

// @NOTE: this uses all API methods to test everything, this is not meant as an example
// Also, this can be tough to understand at first
let update = (data) => {

  user = Heaven(data)
    .bind(User.checkName)
    .bind(User.checkEmail)
    .guard(User.guardEmailUnique, "Your email already exists")
    .guard(User.guardMissingField.bind(null, "age"), "Missing user age")
    .assert(User.isAdult, "You should be an adult")
    .apply(User.setUpdatedAtToNow)

  user = user.merge((user, update) => Object.assign({}, user, {update}), Heaven(user).promise(User.update))
    // @TODO: try to merge data with
    // (user, write) => ({...user, written: write[0]}
    .then(user => Heaven(user).callback((user, cb) => User.write('path/to/user', user, cb)))

    // @TODO: merge? otherwise then is not "synchronous"
    .then(user => Heaven(user).promise(User.sendMail))

    return user;
}

update({name: "John Doe", email: "john.doe@mail.com", age: 40 })
  .then(console.log.bind(null, "updated"))
  .catch(console.error);

console.log("starting updating ...");
