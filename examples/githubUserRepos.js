const heaven = require('../src/heaven');
const axios  = require('axios');

let getJson = (url) => axios.get(url, {headers: {Accept: "application/vnd.github.v3+json"}})

function promiseVersion() {
  function userRepositories(username) {
    let url = "https://api.github.com/users/" + username;

    return new Promise((resolve) => {
      getJson(url).then(res => {
        getJson(res.data.repos_url).then(res => {
          let repos = res.data || [];

          resolve(repos.map(r => {
            return {
              name: r.name,
              description: r.description,
              url: r.html_url,
              language: r.language,
            }
          }))
        }).catch(err => resolve([]));
      }).catch(err => resolve([]));
    });
  }

  console.time('promise');
  userRepositories("warang580").then(() => console.timeEnd('promise'));
}

async function asyncAwaitVersion() {
  async function userRepositories(username) {
    let url = "https://api.github.com/users/" + username;

    try {
      let reposUrl = (await getJson(url)).data.repos_url;
      let repos    = (await getJson(reposUrl)).data;

      return repos.map(r => {
        return {
          name: r.name,
          description: r.description,
          url: r.html_url,
          language: r.language,
        }
      })
    } catch (err) {
      return [];
    }
  }

  console.time('async/await');
  await userRepositories("warang580");
  console.timeEnd('async/await');
}

async function errdataVersion() {
  function userRepositories(username) {
    let url = "https://api.github.com/users/" + username;

    return heaven(url)
    .promise(getJson)
    .apply(res => res.data.repos_url)
    .promise(getJson)
    .apply(res => res.data)
    .apply(repos => repos.map(r => {
      return {
        name: r.name,
        description: r.description,
        url: r.html_url,
        language: r.language,
      }
    }))
    .rescue([])
  }

  console.time('errdata');
  userRepositories("warang580").then(() => console.timeEnd('errdata'));

  console.time('errdataAwait');
  await userRepositories("warang580").unwrap();
  console.timeEnd('errdataAwait');
}

// Call all versions with benchmarks
promiseVersion()
asyncAwaitVersion()
errdataVersion()
