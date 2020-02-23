const H = require('../src/heaven');
const axios = require('axios');

// Fetch a joke
let requestJoke = () => axios.get("https://icanhazdadjoke.com/", {headers: {"Accept": "application/json"}});

// Works but fugly
// (async () => {
//   H.tap(H.p(console.log, "joke"),
//     H.map(d => d.data.joke,
//       await H.promise(requestJoke,
//         H.from())));
// })();
