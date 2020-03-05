const heaven = require('../src/heaven');
const axios  = require('axios');

let fetchJson = (url) => axios.get(url, {headers: {Accept: "application/json"}})

function getJoke(jokeUrl) {
  return heaven(jokeUrl)
    .promise(fetchJson)
    .apply(r => r.data.joke)
    .then(joke => console.log("Joke:", joke));
}

getJoke("https://icanhazdadjoke.com/");
