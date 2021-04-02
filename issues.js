const dbConnection = require("./config/mongoConnection");
const mongoCollections = require("./config/mongoCollections");
const axios = require("axios");
const issuesData = mongoCollections.issues;
const token = "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"; //my own token
const headers = {
  Authorization: "token " + token,
};

async function saveissues(repo) {
  const issuesCollection = await issuesData();
  const staticUrl = `https://api.github.com/repos/${repo}/issues`;
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
      let issue = data_parsed[j];
      // let author = issue["issue"]["author"]["name"];
      // let author_email = issue["issue"]["author"]["email"];
      // let issue_time = issue["issue"]["author"]["date"];
      // let issue_message = issue["issue"]["message"];
      // let issue_url = issue["url"];
      let newissue = {
        issue: data_parsed[j],
        issue_time: issue["created_at"],
        issue_title: issue["title"],
        issue_body: issue["body"],
        issue_url: issue["url"],
      };

      const insertNewissueInfo = await issuesCollection.insertOne(newissue);
      if (insertNewissueInfo.insertedCount === 0)
        throw `Error: could not add the issue.`;
      const newissueId = insertNewissueInfo.insertedId;
      console.log(issue["created_at"]);
    }
    if (data_parsed.length < 30) {
      console.log("done!!!!!!!!");
      break;
    }
  }
}

module.exports = { saveissues };
