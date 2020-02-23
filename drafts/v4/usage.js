const H = require('../src/heaven')
const axios = require('axios');

let fetchJson = (url) => axios.get(url, {headers: {"Accept": "application/json"}});

let jokeUrl = "https://icanhazdadjoke.com/";

let p = H.promise(fetchJson, H.from(jokeUrl));

console.log("p", p);

// let getJoke = H.map(req => req.data.joke, [null, null]);
//
// console.log("getJoke", getJoke);
//
// getJoke.then(([err, data]) => {
//    console.log("then", err, data);
// });

// // Works but fugly
// (async () => {
//   H.tap(H.p(console.log, "joke"),
//     H.map(d => d.data.joke,
//       await H.promise(requestJoke,
//         H.from())));
// })();
