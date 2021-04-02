const axios = require("axios");
const fs = require("fs");
const path = require("path");
const token = "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"; //my own token
const headers = {
  Authorization: "token " + token,
};
async function downloadFile(url, folder, name) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }

  const mypath = path.resolve(folder, name);
  const writer = fs.createWriteStream(mypath);
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
    headers: headers,
  });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}
async function getAllCommits(url, folder, name) {
  let filename = name.split(".")[0];
  if (filename.includes("/")) {
    let fileRoutes = filename.split("/");
    for (let fileRoutei = 0; fileRoutei < fileRoutes.length - 1; fileRoutei++) {
      folder = path.resolve(folder, fileRoutes[fileRoutei]);
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
      }
    }

    filename = fileRoutes[fileRoutes.length - 1];
  }
  for (let i = 1; i < 100; i++) {
    console.log(`At page ${i}`);
    url = `${url}?path=${name}&page=${i}`;
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
      let fileCommit = commit["url"];
      if (fileCommit === undefined) throw "Error";
      let data_commit_parsed = [];
      try {
        const r_commit = await axios.get(fileCommit, {
          headers: headers,
        });
        const { data } = r_commit;
        data_commit_parsed = data;
      } catch (e) {
        console.log(e);
        throw `Error: wrong path to ${fileCommit} or the net problem.`;
      }

      let time = data_commit_parsed["commit"]["author"]["date"];
      let filePath = data_commit_parsed["files"].find(
        (element) => element["filename"] == name
      );
      let parsedTime = time.replace(/:/g, ".");
      let fileDownloadPath = path.resolve(folder, filename);
      let newDownloadPath = path.resolve(fileDownloadPath, parsedTime);
      if (time && filePath) {
        if (!fs.existsSync(folder)) {
          fs.mkdirSync(folder);
        }
        if (!fs.existsSync(fileDownloadPath)) {
          fs.mkdirSync(fileDownloadPath);
        }
        if (!fs.existsSync(newDownloadPath)) {
          fs.mkdirSync(newDownloadPath);
        }
        console.log(
          `At page ${i}. Created ${newDownloadPath}${
            name.split("/").slice(-1)[0]
          }`
        );
        await downloadFile(
          filePath["raw_url"],
          newDownloadPath,
          name.split("/").slice(-1)[0]
        );
      }
    }
    if (data_parsed.length < 30) {
      console.log("done!!!!!!!!");
      break;
    }
  }
}
module.exports = { getAllCommits };
