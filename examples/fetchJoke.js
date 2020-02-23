const H = require('../src/heaven');
const axios = require('axios');

let fetchJson = (url) => axios.get(url, {headers: {"Accept": "application/json"}})

let jokeUrl = "https://icanhazdadjoke.com/";

// One-liner (easy to write from inside, not so easy to read because backwards)
H.tap(j => console.log("Joke of the day:", j),
  H.map(req => req.data.joke,
    H.promise(fetchJson,
      H.from(jokeUrl))));

// Better (easy to write, easy to read)
p = jokeUrl;
p = H.from(p);
p = H.promise(fetchJson, p);
p = H.map(req => req.data.joke, p);
p = H.tap((j) => console.log("Joke of the day:", j), p);

// Even better : uses composition + partial application (because data is always at the end)
// Each line can easily be swapped with another, and the whole thing could be stored in a list

let getJoke = H.pipe(
  [H.from],
  [H.promise, fetchJson],
  [H.map, req => req.data.joke],
  [H.tap, H.partial(console.log, "Joke of the day:")]
);

getJoke(jokeUrl);

// Did you notice the lack of async/await ? There's even no .then() or .catch()
