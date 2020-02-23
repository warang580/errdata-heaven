

let slowSum = (x, y) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(x + y), 100);
  });
}

let sum = async (x, y) => {
  let result = await slowSum(x, y);

  console.log("result", result);

  return result;
}

console.log("1 + 2 = ", sum(1, 2));
// Excepted:
// result 3
// 1 + 2 = 3

// Received:
// 1 + 2 = Promise { <pending> }
// result 3

// ... Ok, actually, it's expected behavior :/
// sum() is running in another thread while it's waiting
