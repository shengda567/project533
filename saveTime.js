// let timesArray = []
// timesArray = Array(144).fill([]);

const mongoCollections = require("./config/mongoCollections");
const commits = mongoCollections.commits;
function comparator(d1, d2) {
  return new Date(d1.commit_time) - new Date(d2.commit_time);
}

async function saveTime() {
  const commitsCollection = await commits();
  const commitsList = await commitsCollection.find({}).toArray();
  commitsList.sort(comparator);
  let timesArray = Array(144);
  let lastCommit;
  for (let i = 0; i < commitsList.length; i++) {
    let commit = commitsList[i];
    if (
      lastCommit &&
      Math.abs(
        new Date(commit.commit_time) - new Date(lastCommit.commit_time)
      ) <
        60 * 60 * 1000
    ) {
      continue;
    }
    lastCommit = commit;
    let hour = new Date(commit.commit_time).getHours();
    let minute = new Date(commit.commit_time).getMinutes();
    let location = Math.floor((hour * 60 + minute) / 10);

    if (timesArray[location] === undefined) {
      timesArray[location] = [];
    }
    timesArray[location].push(commit.commit_time);
  }
  for (let i = 0; i < timesArray.length; i++) {
    let hour1 = Math.floor((i * 10) / 60);
    let minute1 = (i * 10) % 60;
    let hour2 = Math.floor(((i + 1) * 10) / 60);
    let minute2 = ((i + 1) * 10) % 60;
    console.log(
      `${hour1}:${minute1}-${hour2}:${minute2}\t${
        timesArray[i] ? timesArray[i].length : 0
      }`
    );
  }
}

module.exports = { saveTime };
