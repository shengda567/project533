const dbConnection = require("./config/mongoCollections");
const mongoCollections = require("./config/mongoCollections");
const axios = require("axios");
const commitsData = mongoCollections.commits;
const token = "a2a23967a7eb679272addc27ff5001e070c2682c"; //my own token
const headers = {
  Authorization: "token " + token,
};

async function saveCommits(repo) {
  const commitsCollection = await commitsData();
  const staticUrl = `https://api.github.com/repos/${repo}/commits`;
  for (let i = 1; i < 1000; i++) {
    console.log(`At page ${i}`);
    url = `${staticUrl}?page=${i}`;
    let data_parsed = [];
    try {
      const r = await axios.get(url, {
        headers: headers,
      });
      const { data } = r;
      data_parsed = data;
    } catch (e) {
      console.log(e);
      throw `Error: wrong path to ${url} or the net problem.`;
    }
    if (!data_parsed) throw "Error: wrong path";
    //let parsedData = JSON.parse(data); // parse the data from JSON into a normal JS Object
    for (let j = 0; j < data_parsed.length; j++) {
      let commit = data_parsed[j];
      // let author = commit["commit"]["author"]["name"];
      // let author_email = commit["commit"]["author"]["email"];
      // let commit_time = commit["commit"]["author"]["date"];
      // let commit_message = commit["commit"]["message"];
      // let commit_url = commit["url"];
      let newCommit = {
        commit: data_parsed[j],
        author: commit["commit"]["author"]["name"],
        author_email: commit["commit"]["author"]["email"],
        commit_time: commit["commit"]["author"]["date"],
        commit_message: commit["commit"]["message"],
        commit_url: commit["url"],
      };

      const insertNewCommitInfo = await commitsCollection.insertOne(newCommit);
      if (insertNewCommitInfo.insertedCount === 0)
        throw `Error: could not add the commit.`;
      const newCommitId = insertNewCommitInfo.insertedId;
      console.log(commit["commit"]["author"]["date"]);
    }
    if (data_parsed.length < 30) {
      console.log("done!!!!!!!!");
      break;
    }
  }
}

module.exports = { saveCommits };
