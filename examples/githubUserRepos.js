const heaven = require('../src/heaven');
const axios  = require('axios');

let fetchJson = (url) => axios.get(url, {headers: {Accept: "application/vnd.github.v3+json"}})

let api = "https://api.github.com/users/warang580"

let map = (cb) => (value) => value.map(cb)

heaven(api)
  // Fetching user
  .promise(fetchJson)
  // Getting user repos url
  .apply(res => res.data.repos_url)
  // Fetch user repos
  .promise(fetchJson)
  // Getting request data
  .apply(res => res.data)
  // Transform repo data to only contain specific keys
  .apply(map(r => {
    return {
      name: r.name,
      description: r.description,
      url: r.html_url,
      language: r.language,
    }}))
  // We're done, now we can work on our data
  .then(console.log);
