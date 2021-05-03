const commits = require("./commits");
const downloadAllCommits = require("./downloadAllCommits");
const issues = require("./issues");
const saveTime = require("./saveTime");

const connection = require("./config/mongoConnection");

const main = async () => {
  // const commits_data = await commits.saveCommits(
  //   "CycloneDX/cyclonedx-maven-plugin"
  // );
  // const downloadAllCommits_data = await downloadAllCommits.getAllCommits(
  //     "shengda567/CS546_FinalProject_SmallZillow"
  //   );
  const issues_data = await issues.saveissues("OCA/project");
  //const saveTime_data = await saveTime.saveTime();
  const db = await connection();
  await db.serverConfig.close();

  console.log("Done!");
};

main().catch((error) => {
  console.log(error);
});
