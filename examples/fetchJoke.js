const H = require('../src/heaven');
const axios = require('axios');

let fetchJson = (url) => axios.get(url, {headers: {"Accept": "application/json"}})

let jokeUrl = "https://icanhazdadjoke.com/";

// One-liner (easy to write wrap inside, not so easy to read because backwards)
H.errtap((e) => console.error("An error occured:", e),
  H.tap(j => console.log("Joke of the day:", j),
    H.map(req => req.data.joke,
      H.promise(fetchJson,
        H.wrap(jokeUrl)))));

// Better (easy to write, easy to read)
p = jokeUrl;
p = H.wrap(p);
p = H.promise(fetchJson, p);
p = H.map(req => req.data.joke, p);
p = H.tap((j) => console.log("Joke of the day:", j), p);
p = H.errtap((e) => console.error("An error occured:", e), p);

// Even better : uses composition + partial application (because data is always at the end)
// Each line can easily be swapped with another, and the whole thing could be stored in a list
// @NOTE: this might be an too-early-refactoring

let getJoke = H.pipe(
  [H.wrap],
  [H.promise, fetchJson],
  [H.map, req => req.data.joke],
  [H.tap, H.partial(console.log, "Joke of the day:")],
  [H.errtap, H.partial(console.error, "An error occured")],
);

getJoke(jokeUrl);

// Did you notice the lack of async/await ? There's even no .then() or .catch()
