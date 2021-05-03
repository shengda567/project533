const dbConnection = require("./config/mongoCollections");
const mongoCollections = require("./config/mongoCollections");
const axios = require("axios");
const commitsData = mongoCollections.commits;
const collaborators = mongoCollections.collaborators;
const token = "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"; //my own token
const headers = {
  Authorization: "token " + token,
};

async function saveCommits(repo) {
  const commitsCollection = await commitsData();
  const collaboratorsCollection = await collaborators();
  const staticUrl = `https://api.github.com/repos/${repo}/commits`;

  let collaboratorsList = new Set();
  let duration = null;
  let maxTime = null;
  let minTime = null;

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

    let min_time_string = "";
    let max_time_string = "";

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

      let startTimeString = commit["commit"]["author"]["date"];
      if (min_time_string == "") {
        min_time_string = startTimeString;
      }
      if (max_time_string == "") {
        max_time_string = startTimeString;
      }
      let starttime = new Date(startTimeString);
      maxTime = new Date(max_time_string);
      minTime = new Date(min_time_string);

      if (starttime < minTime) {
        minTime = starttime;
      }
      if (starttime > maxTime) {
        maxTime = starttime;
      }

      const insertNewCommitInfo = await commitsCollection.insertOne(newCommit);
      if (insertNewCommitInfo.insertedCount === 0)
        throw `Error: could not add the commit.`;
      const newCommitId = insertNewCommitInfo.insertedId;
      console.log(commit["commit"]["author"]["date"]);

      //calculate the number of collaborators

      let collaboratorName = commit["commit"]["author"]["email"];

      if (!collaboratorsList.has(collaboratorName)) {
        collaboratorsList.add(collaboratorName);
      }
    }

    if (data_parsed.length < 30) {
      console.log("done!!!!!!!!");
      break;
    }
  }
  let collaboratorsObj = {};
  //console.log(collaboratorsList);
  let index = 1;
  for (let item of collaboratorsList) {
    collaboratorsObj[index++] = item;
  }
  //console.log(collaboratorsObj);
  const insertCollaboratorsList = await collaboratorsCollection.insertOne(
    collaboratorsObj
  );

  duration = (maxTime.getTime() - minTime.getTime()) / 1000 / 3600;
  //insert the duration below:

  let project_duration_hours = {
    duration: duration,
  };

  console.log("total time it took to complete the project is: " + duration);

  if (insertCollaboratorsList.insertedCount === 0)
    throw `Error: could not add the commit.`;
}

module.exports = { saveCommits };
