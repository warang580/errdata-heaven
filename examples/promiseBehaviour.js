
// This file is just there to remind how Promises work, and why this library
// choose to put them everything (because await don't stop anything,
// expect the current async function) so you might as well handle them
// everywhere.

let slowSum = (x, y) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(x + y), 100);
  });
}

let sum = async (x, y) => {
  let result = await slowSum(x, y);

  console.log("computed", result);

  return result;
}

console.log("1 + 2 = ", sum(1, 2));
// Excepted:
// computed 3
// 1 + 2 = 3

// Received:
// 1 + 2 = Promise { <pending> }
// computed 3

// sum() is running in another thread while it's waiting for the promise to resolve
// the rest of the program doesn't stop
