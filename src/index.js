const RedditImageFetcher = require("reddit-image-fetcher");
const regeneratorRuntime = require("regenerator-runtime");
const fs = require("fs");

let rawdata = fs.readFileSync("src/db.json", "utf8");
let db = JSON.parse(rawdata);
//console.log(db.Entries)

anImage = (sub, num) =>
  RedditImageFetcher.fetch({
    type: "custom",
    total: num,
    subreddit: [sub],
  }).then((result) => {
    return result;
  });

const getLink = async (id, sub, num) => {
  const a = await anImage(sub, num);
  if (id == 0) {
    for (let i = 0; i < a.length; i++) {
      var img = document.createElement("img");
      img.src = a[i].image;
      //console.log(a[i].image)
      document.getElementById("container1").appendChild(img);
    }
  } else {
    for (let j = 0; j < a.length; j++) {
      var img = document.createElement("img");
      img.src = a[j].image;
      //console.log(a[j].image)
      document.getElementById("container2").appendChild(img);
    }
  }
};

choose = (arr) => arr[Math.floor(rand(0, arr.length))];
rand = (min, max) => Math.random() * (max - min) + min;

const getPlayer1 = () => {
  let player1 = choose(db.Entries);

  var title = document.createElement("h1");
  var node = document.createTextNode(player1.Name);
  title.appendChild(node);
  document.getElementById("nav1").appendChild(title);

  getLink(0, player1.Subreddit, 5);
  return player1;
};

const getPlayer2 = () => {
  let player2 = choose(db.Entries);

  var title = document.createElement("h1");
  var node = document.createTextNode(player2.Name);
  title.appendChild(node);
  document.getElementById("nav2").appendChild(title);

  getLink(1, player2.Subreddit, 5);
  return player2;
};

const getPlayers = () => {
  var images = document.getElementsByTagName("img");
  var l = images.length;
  for (var i = 0; i < l; i++) {
    images[0].parentNode.removeChild(images[0]);
  }
  var h1s = document.getElementsByTagName("h1");
  var m = h1s.length;
  for (var j = 0; j < m; j++) {
    h1s[0].parentNode.removeChild(h1s[0]);
  }
  player1 = getPlayer1();
  player2 = getPlayer2();

  console.log(
    player1.Name +
      " - " +
      player1.Rating +
      " VS " +
      player2.Name +
      " - " +
      player2.Rating
  );

  return [player1, player2];
};

players = getPlayers();

loadMore = () => {
  getLink(0, player1.Subreddit, 5);
  getLink(1, player2.Subreddit, 5);
};

whoWon = (player) => {
  if (player == 0) {
    console.log(players[0].Name + " Wins!");
    ratings = eloRating(
      parseInt(players[0].Rating),
      parseInt(players[1].Rating),
      32,
      1
    );

    players[0].Rating = ratings[0];
    players[1].Rating = ratings[1];

    console.log("New Rankings:");
    console.log(players[0].Name + " - " + ratings[0]);
    console.log(players[1].Name + " - " + ratings[1]);
  } else if (player == 1) {
    console.log(players[1].Name + " Wins!");
    ratings = eloRating(
      parseInt(players[0].Rating),
      parseInt(players[1].Rating),
      32,
      2
    );

    players[0].Rating = ratings[0];
    players[1].Rating = ratings[1];

    console.log("New Rankings:");
    console.log(players[0].Name + " - " + ratings[0]);
    console.log(players[1].Name + " - " + ratings[1]);
  } else {
    console.log("Skipped");
  }
  players = getPlayers();
};

prob = (rating1, rating2) => {
  return (
    (1.0 * 1.0) / (1 + 1.0 * Math.pow(10, (1.0 * (rating1 - rating2)) / 400))
  );
};

eloRating = (Ra, Rb, K, d) => {
  Pb = prob(Ra, Rb);
  Pa = prob(Rb, Ra);

  if (d == 1) {
    Ra = Ra + K * (1 - Pa);
    Rb = Rb + K * (0 - Pb);
  } else {
    Ra = Ra + K * (0 - Pa);
    Rb = Rb + K * (1 - Pb);
  }

  //console.log("Updated Ranking");
  //console.log("Ra = " + Ra + " Rb = " + Rb);
  return [Ra, Rb];
};

showRankings = () => {
  rankArr = [];
  rankSub = [];
  for (let k = 0; k < db.Entries.length; k++) {
    rankArr.push([
      parseInt(db.Entries[k].Rating),
      db.Entries[k].Name,
      db.Entries[k].Subreddit,
    ]);
  }
  rankArr.sort((a, b) => a[0] - b[0]).reverse();

  for (let u = 0; u < rankArr.length; u++) {
    rankArr[u].unshift(u + 1);
  }
  console.log(rankArr);

  document.getElementById("id01").style.display = "block";

  list = document.getElementById("myList");

  var lis = document.getElementsByTagName("li");
  var b = lis.length;
  for (var j = 0; j < b; j++) {
    lis[0].parentNode.removeChild(lis[0]);
  }

  rankArr.forEach((item) => {
    let li = document.createElement("li");
    li.innerText = item[0] + " - " + item[1] + " ";

    var a = document.createElement("a");
    var linkText = document.createTextNode(item[2]);
    a.appendChild(linkText);
    a.href = "https://old.reddit.com/r/" + item[3] + "/top/?sort=top&t=year";
    li.appendChild(a);

    list.appendChild(li);
  });
};

function download(content, fileName, contentType) {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

onDownload = () => {
  download(JSON.stringify(db), "db.json", "text/plain");
};
