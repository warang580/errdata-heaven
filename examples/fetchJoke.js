const H     = require('../src/heaven');
const axios = require('axios');

let fetchJson = (url) => axios.get(url, {headers: {"Accept": "application/json"}})

function getJoke(jokeUrl) {
  let p = H.wrap(jokeUrl);
  p = H.promise(fetchJson, p);
  p = H.map(req => req.data.joke, p);
  p = H.tap(joke => console.log("Joke of the day:", joke), p);
  p = H.errtap(err => console.error("An error occured:", e), p);

  return p;
}

// Did you notice the lack of async/await ? There's even no .then() or .catch()
getJoke("https://icanhazdadjoke.com/");
