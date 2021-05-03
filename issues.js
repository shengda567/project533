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

  for (let i = 1; i < 1000; i++) {
    const url = `https://api.github.com/repos/${repo}/pulls/${i}`;

    //url = `${staticUrl}?page=${i}`;
    let data_parsed = [];
    try {
      const r = await axios.get(url, {
        headers: headers,
      });
      const { data } = r;
      data_parsed = data;
    } catch (e) {
      console.log(e);
      continue;
      //throw `Error: wrong path to ${url} or the net problem.`;
    }
    if (!data_parsed) throw "Error: wrong path";
    //let parsedData = JSON.parse(data); // parse the data from JSON into a normal JS Object

    let issue = data_parsed;
    let issue_label = issue["labels"];
    for (let obj in issue_label) {
      if (issue_label[obj].name.toLowerCase().trim().valueOf() == "bug") {
        let newissue = {
          issue: data_parsed,
          issue_creatted_time: issue["created_at"],
          issue_closed_time: issue["closed_at"],
          issue_closed_time: issue["updated_at"],
          issue_duration_hours:
            (new Date(issue["closed_at"]).getTime() -
              new Date(issue["created_at"]).getTime()) /
            1000 /
            3600,
          issue_labels: issue["labels"],
          issue_assignees: issue["assignees"].length + 1,

          issue_body: issue["body"],
          issue_url: issue["url"],
          commit_times: issue["commits"],
        };
        const insertNewissueInfo = await issuesCollection.insertOne(newissue);
        if (insertNewissueInfo.insertedCount === 0)
          throw `Error: could not add the issue.`;
        const newissueId = insertNewissueInfo.insertedId;
      }
    }
    // let author = issue["issue"]["author"]["name"];
    // let author_email = issue["issue"]["author"]["email"];
    // let issue_time = issue["issue"]["author"]["date"];
    // let issue_message = issue["issue"]["message"];
    // let issue_url = issue["url"];
  }
}

module.exports = { saveissues };
